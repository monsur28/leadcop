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
      return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    const body = await req.json();
    const rawHostname = body.hostname || "";

    if (!rawHostname) {
      return NextResponse.json({ error: "Missing hostname in payload" }, { status: 400 });
    }

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

    const accessLimits = await FeatureAccessService.evaluate(apiKey.domain.userId, prisma);

    if (!accessLimits) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 403 });
    }

    const sub = apiKey.domain.user.subscriptions[0];
    const planName = sub ? sub.plan.name : "Free Plan";
    const subStatus = sub ? sub.status : "INACTIVE";

    return NextResponse.json({
      success: true,
      message: "Connection successful",
      data: {
        domain: apiKey.domain.hostname,
        plan: planName,
        status: subStatus,
      }
    });

  } catch (error) {
    console.error("[Plugin Connect Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
