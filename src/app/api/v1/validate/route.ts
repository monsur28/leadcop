import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { FeatureAccessService } from "@/features/subscriptions/services";
import { ValidationPipelineService } from "@/features/validation/services/engine";
import { UsageService } from "@/features/usage/services";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";

const validateSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Configure Upstash Redis & Ratelimit (Rate limit limit is dynamically passed per request later)
const redis = Redis.fromEnv();

// Polyfill for Node's crypto hash in the Edge runtime
async function hashSha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: NextRequest) {
  const reqId = crypto.randomUUID();
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 1. API Key Extraction & Validation
    const apiKeyRaw = req.headers.get("x-api-key");
    
    // We defer rate limiting until AFTER we determine the limits,
    // but if we have no key, we enforce the unauthenticated limit.
    let accessLimits = FeatureAccessService.defaultLimits();
    let apiKey = null;
    let keyHash = null;

    if (apiKeyRaw) {
      keyHash = await hashSha256(apiKeyRaw);
      apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { domain: { include: { user: true } } }
      });

      if (apiKey && apiKey.isActive && apiKey.domain.isActive) {
        if (apiKey.domain.user.status !== "ACTIVE") {
           return NextResponse.json({ error: "Forbidden: Account is suspended" }, { status: 403 });
        }
        const resolvedLimits = await FeatureAccessService.evaluate(apiKey.domain.userId, prisma);
        if (resolvedLimits) {
          accessLimits = resolvedLimits;
        }
      }
    }

    // 2. Abuse Detection: Dynamic Rate Limiting
    const dynamicLimiter = new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(accessLimits.limits.rateLimitPerMinute, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit",
    });

    // Rate limit by API Key Hash if available, otherwise fallback to IP
    const rateLimitIdentifier = keyHash ? `key_${keyHash}` : `ip_${ip}`;
    const { success, limit, reset, remaining } = await dynamicLimiter.limit(rateLimitIdentifier);
    
    if (!success) {
      logger.warn({ reqId, identifier: rateLimitIdentifier }, "Rate limit exceeded");
      return new NextResponse(JSON.stringify({ error: "Too Many Requests: Rate limit exceeded." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }

    // 2. Parse Body & Payload Protection
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });

    const parsed = validateSchema.safeParse(body);
    if (!parsed.success) {
      logger.info({ reqId, ip, error: parsed.error.flatten() }, "Validation payload format error");
      return NextResponse.json({ error: "Bad Request", details: parsed.error.flatten() }, { status: 400 });
    }
    const { email } = parsed.data;

    if (!apiKeyRaw) {
      return NextResponse.json({ error: "Unauthorized: Missing x-api-key header" }, { status: 401 });
    }
    
    if (!apiKey || !apiKey.isActive) {
      logger.warn({ reqId, keyHash: keyHash?.substring(0, 8) }, "Invalid or inactive API Key attempted");
      return NextResponse.json({ error: "Unauthorized: Invalid or inactive API Key" }, { status: 401 });
    }

    // 5. Origin / Referer Validation (Security Check for Public Snippets)
    if (apiKey.type === "PUBLIC") {
      const origin = req.headers.get("origin") || req.headers.get("referer") || "";
      // Strip protocol and paths for comparison
      const cleanOrigin = origin.replace(/^https?:\/\//i, "").split('/')[0].split(':')[0].toLowerCase();
      
      if (!cleanOrigin.includes(apiKey.domain.hostname.toLowerCase())) {
        logger.warn({ reqId, origin, expected: apiKey.domain.hostname }, "Origin mismatch for PUBLIC key");
        return NextResponse.json({ error: "Forbidden: Origin does not match authorized API Key domain" }, { status: 403 });
      }
    }

    // 6. Ensure Domain Status
    if (!apiKey.domain.isActive) {
      return NextResponse.json({ error: "Forbidden: Domain is inactive" }, { status: 403 });
    }

    // 7. Verify Subscription & Feature Access
    if (accessLimits.limits.quota <= 0 && accessLimits.limits.rateLimitPerMinute === 10) {
      // 10 RPM is our unauthenticated failsafe, implying they have no active plan limits
      logger.info({ reqId, userId: apiKey.domain.userId }, "Subscription exhausted or missing");
      return NextResponse.json({ error: "Payment Required: Active subscription required" }, { status: 402 });
    }

    // 8. Run Validation Engine (Pass dynamic toggles)
    const validationResult = await ValidationPipelineService.validateEmail(email, {
      checkRole: accessLimits.features.roleDetection,
      checkPublic: accessLimits.features.publicDetection,
      checkCustomBlocklist: accessLimits.features.customBlocklist,
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
    } catch (usageError: unknown) {
      if (usageError instanceof AppError && usageError.statusCode === 402) {
        logger.info({ reqId, userId: apiKey.domain.userId }, "Usage cap hit during validation");
        return NextResponse.json({ error: usageError.message }, { status: 402 });
      }
      logger.error({ reqId, err: usageError }, "Error tracking usage");
      throw usageError;
    }

    // 10. Return Output Response
    return NextResponse.json({
      valid: validationResult.valid,
      type: validationResult.type,
      suggestion: validationResult.suggestion
    }, { status: 200 });

  } catch (error) {
    logger.error({ reqId, err: error }, "[API Validate Error]");
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
