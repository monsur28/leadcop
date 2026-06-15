import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { FeatureGateService } from "@/features/subscriptions/services";
import { ValidationPipelineService } from "@/features/validation/services/engine";
import { UsageService } from "@/features/usage/services";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

const validateSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// ----------------------------------------------------------------------
// Rate Limiting Strategy (In-Memory Mock for MVP Edge Deployment)
// In true distributed Edge environments (e.g. Vercel Edge / Cloudflare),
// this MUST be swapped to @upstash/ratelimit using Redis.
// ----------------------------------------------------------------------
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

function applyRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 min window
  const limit = 60; // 60 requests per minute per IP

  const record = rateLimitCache.get(ip);
  if (!record || record.resetAt < now) {
    rateLimitCache.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Abuse Detection: IP Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!applyRateLimit(ip)) {
      return NextResponse.json({ error: "Too Many Requests: Rate limit exceeded." }, { status: 429 });
    }

    // 2. Parse Body & Payload Protection
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });

    const parsed = validateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Bad Request", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email } = parsed.data;

    // 3. API Key Extraction & Validation
    const apiKeyRaw = req.headers.get("x-api-key");
    if (!apiKeyRaw) {
      return NextResponse.json({ error: "Unauthorized: Missing x-api-key header" }, { status: 401 });
    }

    // 4. API Key Hash Lookup (Prevents Timing Attacks & Plaintext Leaks)
    const keyHash = crypto.createHash("sha256").update(apiKeyRaw).digest("hex");
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { domain: true }
    });
    
    if (!apiKey || !apiKey.isActive) {
      return NextResponse.json({ error: "Unauthorized: Invalid or inactive API Key" }, { status: 401 });
    }

    // 5. Origin / Referer Validation (Security Check for Public Snippets)
    if (apiKey.type === "PUBLIC") {
      const origin = req.headers.get("origin") || req.headers.get("referer") || "";
      // Strip protocol and paths for comparison
      const cleanOrigin = origin.replace(/^https?:\/\//i, "").split('/')[0].split(':')[0].toLowerCase();
      
      if (!cleanOrigin.includes(apiKey.domain.hostname.toLowerCase())) {
        return NextResponse.json({ error: "Forbidden: Origin does not match authorized API Key domain" }, { status: 403 });
      }
    }

    // 6. Verify Domain Status
    if (!apiKey.domain.isActive || !apiKey.domain.isVerified) {
      return NextResponse.json({ error: "Forbidden: Domain is inactive or unverified" }, { status: 403 });
    }

    // 7. Verify Subscription & Fetch Access Limits
    const limits = await FeatureGateService.getAccessLimits(apiKey.domain.userId);
    if (!limits) {
      return NextResponse.json({ error: "Payment Required: Active subscription required" }, { status: 402 });
    }

    // 8. Run Validation Engine (Pass Subscription Limit toggles)
    const validationResult = await ValidationPipelineService.validateEmail(email, {
      checkRole: limits.features.roleDetection,
      checkPublic: limits.features.publicDetection,
      checkCustomBlocklist: limits.features.customBlocklist,
    });

    // 9. Increment Usage & Create Log (Atomic DB Transaction)
    try {
      await UsageService.trackValidationUsage(
        apiKey.domain.userId,
        apiKey.domainId,
        apiKey.domain.hostname,
        validationResult.type,
        apiKey.id
      );
    } catch (usageError: any) {
      if (usageError instanceof AppError && usageError.statusCode === 402) {
        return NextResponse.json({ error: usageError.message }, { status: 402 });
      }
      throw usageError;
    }

    // 10. Return Output Response
    return NextResponse.json({
      valid: validationResult.valid,
      type: validationResult.type,
      suggestion: validationResult.suggestion
    }, { status: 200 });

  } catch (error) {
    console.error("[API Validate Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
