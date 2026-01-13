import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

const toSubscriptionStatus = (status: Stripe.Subscription.Status) =>
  status.toUpperCase();

const toTier = (status: string) => {
  const premiumStatuses = new Set(["ACTIVE", "TRIALING", "PAST_DUE"]);
  return premiumStatuses.has(status) ? "PREMIUM" : "FREE";
};

export async function POST(request: Request) {
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook configuration." },
      { status: 400 }
    );
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed.", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = toSubscriptionStatus(subscription.status);
      const currentPeriodEnd =
        subscription.items.data[0]?.current_period_end ?? Math.floor(Date.now() / 1000);

      const update = {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        status,
        tier: toTier(status),
        currentPeriodEnd: new Date(currentPeriodEnd * 1000),
      };

      const updated = await prisma.subscription.updateMany({
        where: { stripeCustomerId: customerId },
        data: update,
      });

      if (!updated.count && subscription.metadata?.userId) {
        await prisma.subscription.upsert({
          where: { userId: subscription.metadata.userId },
          update,
          create: {
            userId: subscription.metadata.userId,
            ...update,
          },
        });
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.customer) {
        await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: "INACTIVE",
            tier: "FREE",
          },
        });
      }
    }
  } catch (error) {
    console.error("Stripe webhook handling failed.", error);
    return NextResponse.json({ error: "Webhook error." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
