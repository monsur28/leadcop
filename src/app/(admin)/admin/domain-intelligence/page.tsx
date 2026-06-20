import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { triggerManualSync } from "@/features/domain-intelligence/actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Redis } from "@upstash/redis";

export default async function DomainIntelligencePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.globalRole !== "ADMIN") redirect("/dashboard");

  // Fetch stats from Database
  const disposableCount = await prisma.disposableDomain.count({ where: { isActive: true } });
  const publicCount = await prisma.publicEmailProvider.count({ where: { isActive: true } });
  const tldCount = await prisma.tld.count({ where: { isActive: true } });

  // Fetch Redis status to verify cache
  let redisDisposableCount = 0;
  let redisPublicCount = 0;
  let redisTldCount = 0;
  let isRedisConnected = true;
  
  try {
    const redis = Redis.fromEnv();
    redisDisposableCount = await redis.scard("domains:disposable");
    redisPublicCount = await redis.scard("domains:public");
    redisTldCount = await redis.scard("domains:tld");
  } catch (err) {
    isRedisConnected = false;
  }

  // Fetch Sync Logs
  const recentLogs = await prisma.syncLog.findMany({
    orderBy: { startedAt: "desc" },
    take: 10
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domain Intelligence</h1>
          <p className="text-muted-foreground">Manage dynamic lists for Disposable Domains, Public Providers, and TLDs.</p>
        </div>
        <form action={async () => {
          "use server";
          await triggerManualSync();
        }}>
          <Button type="submit">Trigger Manual Sync</Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disposable Domains</CardTitle>
            <CardTitle className="text-2xl">{disposableCount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex justify-between items-center">
              <span>Database Records</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${disposableCount > 0 && disposableCount === redisDisposableCount ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                Redis: {isRedisConnected ? redisDisposableCount.toLocaleString() : "Disconnected"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Public Providers</CardTitle>
            <CardTitle className="text-2xl">{publicCount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex justify-between items-center">
              <span>Database Records</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${publicCount > 0 && publicCount === redisPublicCount ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                Redis: {isRedisConnected ? redisPublicCount.toLocaleString() : "Disconnected"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top-Level Domains (TLDs)</CardTitle>
            <CardTitle className="text-2xl">{tldCount.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground flex justify-between items-center">
              <span>Database Records</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${tldCount > 0 && tldCount === redisTldCount ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                Redis: {isRedisConnected ? redisTldCount.toLocaleString() : "Disconnected"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Logs</CardTitle>
          <CardDescription>Automated sync tasks run every 24 hours.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No sync logs found. Trigger a manual sync above.</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Started At</th>
                    <th className="px-4 py-2 text-left font-medium">Type</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-right font-medium">Added</th>
                    <th className="px-4 py-2 text-right font-medium">Removed</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="px-4 py-3">{log.startedAt.toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium">{log.type}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-md ${log.status === "SUCCESS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">+{log.recordsAdded.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-red-600">-{log.recordsRemoved.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
