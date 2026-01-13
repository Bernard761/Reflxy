import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Stripe is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }

  return stripeClient;
};
