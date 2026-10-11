import Stripe from "stripe";

// Kept so a future checkout can opt in deliberately. No route imports this,
// and getStripe is not called while checkout is closed.
export function getStripe() {
 const key = process.env.STRIPE_SECRET_KEY;
 if (!key) return null;
 return new Stripe(key, {
 apiVersion: "2025-02-24.acacia",
 httpClient: Stripe.createFetchHttpClient(),
 });
}
