import { prisma } from "@/lib/prisma";

export type SubscriptionState = {
  tier: string;
  status: string;
} | null;

export async function getSubscriptionState(
  userId: string
): Promise<SubscriptionState> {
  return prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true, status: true },
  });
}

export function isPremiumActive(state: SubscriptionState) {
  if (!state) {
    return false;
  }

  const normalizedStatus = state.status.toUpperCase();
  return (
    state.tier === "PREMIUM" &&
    (normalizedStatus === "ACTIVE" || normalizedStatus === "TRIALING")
  );
}
