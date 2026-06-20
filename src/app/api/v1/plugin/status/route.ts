import { NextResponse } from "next/server";
import { FeatureAccessService } from "@/features/subscriptions/services";
import { prisma } from "@/lib/db";
import { AppError } from "@/lib/errors";

async function hashSha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  try {
    const apiKeyHeader = req.headers.get("x-api-key");
    if (!apiKeyHeader) {
      return NextResponse.json({ error: "Missing authentication details" }, { status: 401 });
    }

    const body = await req.json();
    const rawHostname = body.hostname || "";
    let hostname = rawHostname;
    try {
      const url = new URL(rawHostname.startsWith("http") ? rawHostname : `https://${rawHostname}`);
      hostname = url.hostname;
    } catch {}
    hostname = hostname.replace(/^www\./, "");

    const keyHash = await hashSha256(apiKeyHeader);
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { 
        domain: { 
          include: { 
            user: { 
              include: { 
                subscriptions: { 
                  include: { plan: true }, 
                  where: { status: "ACTIVE" } 
                } 
              } 
            } 
          } 
        } 
      }
    });

    if (!apiKey || !apiKey.isActive || !apiKey.domain.isActive) {
       return NextResponse.json({ error: "Invalid or inactive API Key" }, { status: 401 });
    }

    if (apiKey.domain.hostname !== hostname) {
       return NextResponse.json({ error: "Unauthorized Domain. Key belongs to another domain." }, { status: 403 });
    }

    if (apiKey.domain.user.status !== "ACTIVE") {
       return NextResponse.json({ error: "Account suspended" }, { status: 403 });
    }

    const domain = apiKey.domain;

    const accessLimits = await FeatureAccessService.evaluate(domain.userId, prisma);
    if (!accessLimits) {
      return NextResponse.json({ error: "No active subscription" }, { status: 403 });
    }

    const now = new Date();
    const usageCounter = await prisma.usageCounter.findFirst({
      where: {
        userId: domain.userId,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      }
    });
    
    const usedValidations = usageCounter?.validationsCount || 0;
    const quota = accessLimits.limits.quota;
    const remaining = quota === -1 ? -1 : Math.max(0, quota - usedValidations);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.validationLog.findMany({
      where: {
        domainId: domain.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { status: true }
    });

    const totalLogs = logs.length;
    let blockedRole = 0;
    let blockedDisposable = 0;
    let blockedOther = 0;
    let passed = 0;

    logs.forEach((log: { status: string }) => {
      if (log.status === "VALID") passed++;
      else if (log.status === "ROLE") blockedRole++;
      else if (log.status === "DISPOSABLE") blockedDisposable++;
      else blockedOther++;
    });

    const successRate = totalLogs > 0 ? Math.round((passed / totalLogs) * 100) : 100;

    const recentBlocked = await prisma.validationLog.findMany({
      where: {
        domainId: domain.id,
        status: { not: "VALID" }
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { validatedDomain: true, status: true, createdAt: true }
    });

    const sub = domain.user.subscriptions[0];
    const planName = sub ? sub.plan.name : "Free Plan";

    return NextResponse.json({
      success: true,
      data: {
        plan: {
          name: planName,
          quotaLimit: quota,
          roleDetection: accessLimits.features.roleDetection,
          publicDetection: accessLimits.features.publicDetection
        },
        usage: {
          used: usedValidations,
          remaining: remaining,
          percent: quota === -1 ? 0 : Math.round((usedValidations / quota) * 100)
        },
        metrics: {
          totalChecked: totalLogs,
          blockedRole,
          blockedDisposable,
          blockedTotal: blockedRole + blockedDisposable + blockedOther,
          successRate
        },
        recentBlocked: recentBlocked.map((log: { validatedDomain: string, status: string, createdAt: Date }) => ({
          domain: log.validatedDomain,
          reason: log.status,
          date: log.createdAt.toISOString()
        }))
      }
    });

  } catch (error) {
    console.error("[Plugin Status Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
