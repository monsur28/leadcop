import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { FeatureAccessService } from "@/features/subscriptions/services";
import { ValidationPipelineService } from "@/features/validation/services/engine";
import { ValidationMessageService } from "@/features/validation/services/messages";
import { ValidationMessageType } from "@prisma/client";
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
           const msg = await ValidationMessageService.resolveMessage(apiKey.domain.userId, "ACCOUNT_SUSPENDED");
           return NextResponse.json({ valid: false, reason: "ACCOUNT_SUSPENDED", message: msg }, { status: 403 });
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
      const userId = apiKey ? apiKey.domain.userId : "anonymous";
      const msg = await ValidationMessageService.resolveMessage(userId, "RATE_LIMITED");
      return new NextResponse(JSON.stringify({ valid: false, reason: "RATE_LIMITED", message: msg }), {
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
      return NextResponse.json({ valid: false, reason: "INVALID_API_KEY", message: "Missing x-api-key header" }, { status: 401 });
    }
    
    if (!apiKey || !apiKey.isActive) {
      logger.warn({ reqId, keyHash: keyHash?.substring(0, 8) }, "Invalid or inactive API Key attempted");
      const userId = apiKey ? apiKey.domain.userId : "anonymous";
      const reason = apiKey ? "API_KEY_REVOKED" : "INVALID_API_KEY";
      const msg = await ValidationMessageService.resolveMessage(userId, reason);
      return NextResponse.json({ valid: false, reason, message: msg }, { status: 401 });
    }

    // 5. Origin / Referer Validation (Security Check for Public Snippets)
    if (apiKey.type === "PUBLIC") {
      const origin = req.headers.get("origin") || req.headers.get("referer") || "";
      // Strip protocol and paths for comparison
      const cleanOrigin = origin.replace(/^https?:\/\//i, "").split('/')[0].split(':')[0].toLowerCase();
      
      if (!cleanOrigin.includes(apiKey.domain.hostname.toLowerCase())) {
        logger.warn({ reqId, origin, expected: apiKey.domain.hostname }, "Origin mismatch for PUBLIC key");
        const msg = await ValidationMessageService.resolveMessage(apiKey.domain.userId, "UNAUTHORIZED_DOMAIN");
        return NextResponse.json({ valid: false, reason: "UNAUTHORIZED_DOMAIN", message: msg }, { status: 403 });
      }
    }

    // 6. Ensure Domain Status
    if (!apiKey.domain.isActive) {
      const msg = await ValidationMessageService.resolveMessage(apiKey.domain.userId, "UNAUTHORIZED_DOMAIN");
      return NextResponse.json({ valid: false, reason: "UNAUTHORIZED_DOMAIN", message: msg }, { status: 403 });
    }

    // 7. Verify Subscription & Feature Access
    if (accessLimits.limits.quota <= 0 && accessLimits.limits.rateLimitPerMinute === 10) {
      // 10 RPM is our unauthenticated failsafe, implying they have no active plan limits
      logger.info({ reqId, userId: apiKey.domain.userId }, "Subscription exhausted or missing");
      const msg = await ValidationMessageService.resolveMessage(apiKey.domain.userId, "SUBSCRIPTION_EXPIRED");
      return NextResponse.json({ valid: false, reason: "SUBSCRIPTION_EXPIRED", message: msg }, { status: 402 });
    }

    // 8. Run Validation Engine (Pass dynamic toggles)
    const validationResult = await ValidationPipelineService.validateEmail(email, {
      checkRole: accessLimits.features.roleDetection,
      checkPublic: accessLimits.features.publicDetection,
      userId: apiKey.domain.userId,
      websiteId: apiKey.domainId,
      allowRoleOverrides: accessLimits.features.allowRoleOverrides,
      allowCustomRoles: accessLimits.features.allowCustomRoles,
      allowWebsiteLevelRoles: accessLimits.features.allowWebsiteLevelRoles,
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
        const msg = await ValidationMessageService.resolveMessage(apiKey.domain.userId, "QUOTA_EXCEEDED");
        return NextResponse.json({ valid: false, reason: "QUOTA_EXCEEDED", message: msg }, { status: 402 });
      }
      logger.error({ reqId, err: usageError }, "Error tracking usage");
      throw usageError;
    }

    // 10. Return Output Response
    let message: string | null = null;
    let reason: ValidationMessageType | null = null;

    if (!validationResult.valid || validationResult.type === "TYPO") {
      reason = validationResult.type as ValidationMessageType;
      message = await ValidationMessageService.resolveMessage(
        apiKey.domain.userId,
        reason,
        apiKey.domainId,
        validationResult.suggestion
      );
    }

    return NextResponse.json({
      valid: validationResult.valid,
      reason: validationResult.type === "VALID" ? null : validationResult.type,
      role: validationResult.role || undefined,
      message: message,
      featureAvailable: validationResult.featureAvailable
    }, { status: 200 });

  } catch (error) {
    logger.error({ reqId, err: error }, "[API Validate Error]");
    return NextResponse.json({ valid: false, reason: "SERVICE_OFFLINE", message: "Validation service unavailable." }, { status: 500 });
  }
}
