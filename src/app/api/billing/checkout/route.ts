import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LemonSqueezyService } from "@/features/billing/services/lemon-squeezy";
import { env } from "@/env";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { variantId } = await req.json();

    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    const storeId = env.LEMON_SQUEEZY_STORE_ID;
    if (!storeId) {
      return NextResponse.json({ error: "Store ID is not configured" }, { status: 500 });
    }

    // Check if the variant exists in our system
    const plan = await prisma.plan.findFirst({
      where: {
        OR: [
          { lemonMonthlyVariantId: variantId },
          { lemonYearlyVariantId: variantId }
        ]
      }
    });

    if (!plan) {
      return NextResponse.json({ error: "Invalid variant ID" }, { status: 400 });
    }

    const redirectUrl = `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`;

    const checkoutData = await LemonSqueezyService.createCheckout({
      storeId,
      variantId,
      userEmail: session.user.email as string,
      userId: session.user.id,
      redirectUrl,
    });

    const checkoutUrl = checkoutData.data.attributes.url;

    return NextResponse.json({ checkoutUrl });
  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout" }, { status: 500 });
  }
}
