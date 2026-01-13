import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export async function POST() {
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

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: "Billing profile not found." },
        { status: 404 }
      );
    }

    const origin =
      headers().get("origin") ??
      process.env.NEXTAUTH_URL ??
      "http://localhost:3011";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${origin}/app`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to open billing portal." },
      { status: 500 }
    );
  }
}
