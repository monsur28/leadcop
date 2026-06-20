import { NextResponse } from "next/server";
import { DomainIntelligenceWorker } from "@/features/domain-intelligence/services/sync-worker";

// Vercel Cron Jobs will call this endpoint automatically based on the vercel.json schedule.
// But we also allow calling this manually via the Admin Dashboard.
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    
    // In a real production app, ensure this endpoint is protected via CRON_SECRET 
    // or an authenticated admin session.
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !authHeader?.includes("AdminSession")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await DomainIntelligenceWorker.runAll();
    
    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("[CRON sync-domains] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Allow Vercel Cron to GET
  return POST(req);
}
