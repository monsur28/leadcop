import { NextResponse } from "next/server";
import { LemonSqueezyService } from "@/features/billing/services/lemon-squeezy";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    if (!LemonSqueezyService.verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const obj = event.data;
    const attributes = obj.attributes;

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated":
        await handleSubscriptionUpsert(event, obj, attributes);
        break;
      case "subscription_cancelled":
      case "subscription_expired":
        await handleSubscriptionEnd(obj, attributes);
        break;
      case "subscription_payment_success":
      case "subscription_payment_failed":
        await handlePaymentEvent(eventName, obj, attributes);
        break;
      default:
        console.log(`Unhandled Lemon Squeezy event: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleSubscriptionUpsert(event: any, obj: any, attributes: any) {
  const customerId = attributes.customer_id.toString();
  const subscriptionId = obj.id.toString();
  const variantId = attributes.variant_id.toString();
  
  let status = "ACTIVE";
  if (attributes.status === "past_due") status = "PAST_DUE";
  if (attributes.status === "cancelled") status = "CANCELED";
  if (attributes.status === "expired" || attributes.status === "unpaid") status = "INCOMPLETE";

  const renewsAt = attributes.renews_at ? new Date(attributes.renews_at) : null;
  const endsAt = attributes.ends_at ? new Date(attributes.ends_at) : null;
  const urls = attributes.urls || {};

  const customUserId = event.meta.custom_data?.user_id;

  if (customUserId) {
    await prisma.user.updateMany({
      where: { id: customUserId },
      data: { lemonSqueezyCustomerId: customerId }
    });
  }

  const user = await prisma.user.findFirst({
    where: { lemonSqueezyCustomerId: customerId }
  });

  if (!user) {
    console.error("No user found for customer:", customerId);
    return;
  }

  const plan = await prisma.plan.findFirst({
    where: {
      OR: [
        { lemonMonthlyVariantId: variantId },
        { lemonYearlyVariantId: variantId }
      ]
    }
  });

  if (!plan) {
    console.error("No plan found for variant:", variantId);
    return;
  }

  const currentPeriodEnd = renewsAt || endsAt || new Date();

  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      planId: plan.id,
      status: status as any,
      lemonSqueezyId: subscriptionId,
      variantId,
      renewsAt,
      endsAt,
      currentPeriodEnd,
      updatePaymentMethodUrl: urls.update_payment_method,
      customerPortalUrl: urls.customer_portal,
    },
    update: {
      planId: plan.id,
      status: status as any,
      lemonSqueezyId: subscriptionId,
      variantId,
      renewsAt,
      endsAt,
      currentPeriodEnd,
      updatePaymentMethodUrl: urls.update_payment_method,
      customerPortalUrl: urls.customer_portal,
    }
  });
}

async function handleSubscriptionEnd(obj: any, attributes: any) {
  const subscriptionId = obj.id.toString();
  const endsAt = attributes.ends_at ? new Date(attributes.ends_at) : null;

  await prisma.subscription.updateMany({
    where: { lemonSqueezyId: subscriptionId },
    data: {
      status: attributes.status === "expired" ? "INCOMPLETE" : "CANCELED",
      endsAt,
    }
  });
}

async function handlePaymentEvent(eventName: string, obj: any, attributes: any) {
  const customerId = attributes.customer_id.toString();
  const amount = attributes.total; // in cents
  const currency = attributes.currency;
  const providerTxId = obj.id.toString();
  const invoiceUrl = attributes.urls?.receipt;

  const user = await prisma.user.findFirst({
    where: { lemonSqueezyCustomerId: customerId }
  });

  if (!user) return;

  const paymentStatus = eventName === "subscription_payment_success" ? "SUCCEEDED" : "FAILED";

  await prisma.payment.upsert({
    where: { providerTxId },
    create: {
      userId: user.id,
      amount,
      currency,
      status: paymentStatus as any,
      providerTxId,
      invoiceUrl,
    },
    update: {
      status: paymentStatus as any,
      invoiceUrl,
    }
  });
}
