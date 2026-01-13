import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured." },
        { status: 500 }
      );
    }

    const stripe = getStripe();

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { interval?: "monthly" | "yearly" };
    const interval = body.interval === "yearly" ? "yearly" : "monthly";
    const priceId =
      interval === "yearly"
        ? process.env.STRIPE_YEARLY_PRICE_ID
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    if (!priceId) {
      return NextResponse.json(
        { error: "Stripe price is not configured." },
        { status: 500 }
      );
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          status: "INACTIVE",
          tier: "FREE",
        },
      });
    }

    let customerId = subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          userId,
        },
      });

      customerId = customer.id;
      await prisma.subscription.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const origin =
      headers().get("origin") ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3011";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/app?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancel`,
      subscription_data: {
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
        interval,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to start checkout." },
      { status: 500 }
    );
  }
}
