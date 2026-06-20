import { env } from "@/env";
import crypto from "crypto";

export class LemonSqueezyService {
  private static readonly API_BASE_URL = "https://api.lemonsqueezy.com/v1";

  private static get headers() {
    return {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${env.LEMON_SQUEEZY_API_KEY}`,
    };
  }

  /**
   * Creates a checkout session for a given variant.
   */
  static async createCheckout(params: {
    storeId: string;
    variantId: string;
    userEmail: string;
    userId: string;
    redirectUrl?: string;
  }) {
    const response = await fetch(`${this.API_BASE_URL}/checkouts`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: params.userEmail,
              custom: {
                user_id: params.userId,
              },
            },
            product_options: {
              redirect_url: params.redirectUrl,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: params.storeId,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: params.variantId,
              },
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Lemon Squeezy API Error: ${response.status} - ${text}`);
    }

    return response.json();
  }

  /**
   * Changes the subscription to a new variant (Upgrade/Downgrade).
   */
  static async changeSubscription(subscriptionId: string, newVariantId: string) {
    const response = await fetch(`${this.API_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: subscriptionId,
          attributes: {
            variant_id: parseInt(newVariantId, 10),
          },
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to change subscription: ${text}`);
    }

    return response.json();
  }

  /**
   * Cancels a subscription immediately or at the end of the billing period.
   */
  static async cancelSubscription(subscriptionId: string) {
    const response = await fetch(`${this.API_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to cancel subscription: ${text}`);
    }

    return response.json();
  }

  /**
   * Resumes a canceled subscription.
   */
  static async resumeSubscription(subscriptionId: string) {
    const response = await fetch(`${this.API_BASE_URL}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify({
        data: {
          type: "subscriptions",
          id: subscriptionId,
          attributes: {
            cancelled: false,
          },
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to resume subscription: ${text}`);
    }

    return response.json();
  }

  /**
   * Verifies the HMAC signature of incoming webhooks.
   */
  static verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = env.LEMON_SQUEEZY_WEBHOOK_SECRET;
    if (!secret) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  }
}
