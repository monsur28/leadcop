import { prisma } from "@/lib/db";
import { Redis } from "@upstash/redis";
import { FALLBACK_PUBLIC_PROVIDERS } from "@/constants/domain-intelligence";

const redis = Redis.fromEnv();

export class DomainIntelligenceWorker {
  
  static async syncDisposableDomains() {
    const log = await prisma.syncLog.create({ data: { type: "DISPOSABLE", status: "FAILURE" } });
    
    try {
      const response = await fetch("https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf");
      if (!response.ok) throw new Error(`Failed to fetch disposable domains: ${response.status}`);
      
      const text = await response.text();
      const lines = text.split("\n").map(l => l.trim().toLowerCase()).filter(l => l.length > 0 && !l.startsWith("//"));
      
      const newDomains = new Set(lines);
      
      const existing = await prisma.disposableDomain.findMany({ select: { domain: true, isActive: true } });
      const existingDomains = new Set(existing.map((d: { domain: string }) => d.domain));
      
      let added = 0;
      let removed = 0;
      
      const toAdd = [...newDomains].filter(d => !existingDomains.has(d));
      const toReactivate = existing.filter((d: { domain: string, isActive: boolean }) => newDomains.has(d.domain) && !d.isActive).map((d: { domain: string }) => d.domain);
      const toDeactivate = existing.filter((d: { domain: string, isActive: boolean }) => !newDomains.has(d.domain) && d.isActive).map((d: { domain: string }) => d.domain);
      
      await prisma.$transaction([
        prisma.disposableDomain.createMany({
          data: toAdd.map(domain => ({ domain, source: "github:disposable-email-domains" })),
          skipDuplicates: true
        }),
        prisma.disposableDomain.updateMany({
          where: { domain: { in: toReactivate } },
          data: { isActive: true }
        }),
        prisma.disposableDomain.updateMany({
          where: { domain: { in: toDeactivate } },
          data: { isActive: false }
        })
      ]);
      
      added = toAdd.length + toReactivate.length;
      removed = toDeactivate.length;

      const p = redis.pipeline();
      p.del("domains:disposable");
      
      const activeDomains = [...newDomains];
      const chunkSize = 500;
      for (let i = 0; i < activeDomains.length; i += chunkSize) {
        const chunk = activeDomains.slice(i, i + chunkSize);
        if (chunk.length > 0) {
          // Type casting for TS spread argument limits
          const members = chunk as [string, ...string[]];
          p.sadd("domains:disposable", ...members);
        }
      }
      await p.exec();

      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: "SUCCESS", recordsAdded: added, recordsRemoved: removed, completedAt: new Date() }
      });
      
      return { success: true, added, removed };
    } catch (err: any) {
      console.error("[SyncDisposable]", err);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { errorMessage: err.message, completedAt: new Date() }
      });
      return { success: false, error: err.message };
    }
  }

  static async syncTlds() {
    const log = await prisma.syncLog.create({ data: { type: "TLD", status: "FAILURE" } });
    
    try {
      const response = await fetch("https://data.iana.org/TLD/tlds-alpha-by-domain.txt");
      if (!response.ok) throw new Error(`Failed to fetch TLDs: ${response.status}`);
      
      const text = await response.text();
      const lines = text.split("\n").map(l => l.trim().toLowerCase()).filter(l => l.length > 0 && !l.startsWith("#"));
      
      const newTlds = new Set(lines);
      
      const existing = await prisma.tld.findMany({ select: { tld: true, isActive: true } });
      const existingTlds = new Set(existing.map((t: { tld: string }) => t.tld));
      
      let added = 0;
      let removed = 0;
      
      const toAdd = [...newTlds].filter(t => !existingTlds.has(t));
      const toReactivate = existing.filter((t: { tld: string, isActive: boolean }) => newTlds.has(t.tld) && !t.isActive).map((t: { tld: string }) => t.tld);
      const toDeactivate = existing.filter((t: { tld: string, isActive: boolean }) => !newTlds.has(t.tld) && t.isActive).map((t: { tld: string }) => t.tld);
      
      await prisma.$transaction([
        prisma.tld.createMany({
          data: toAdd.map(tld => ({ tld })),
          skipDuplicates: true
        }),
        prisma.tld.updateMany({
          where: { tld: { in: toReactivate } },
          data: { isActive: true }
        }),
        prisma.tld.updateMany({
          where: { tld: { in: toDeactivate } },
          data: { isActive: false }
        })
      ]);
      
      added = toAdd.length + toReactivate.length;
      removed = toDeactivate.length;

      const p = redis.pipeline();
      p.del("domains:tld");
      const activeTlds = [...newTlds];
      const chunkSize = 500;
      for (let i = 0; i < activeTlds.length; i += chunkSize) {
        const chunk = activeTlds.slice(i, i + chunkSize);
        if (chunk.length > 0) {
          const members = chunk as [string, ...string[]];
          p.sadd("domains:tld", ...members);
        }
      }
      await p.exec();

      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: "SUCCESS", recordsAdded: added, recordsRemoved: removed, completedAt: new Date() }
      });
      
      return { success: true, added, removed };
    } catch (err: any) {
      console.error("[SyncTlds]", err);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { errorMessage: err.message, completedAt: new Date() }
      });
      return { success: false, error: err.message };
    }
  }

  static async syncPublicProviders() {
    const log = await prisma.syncLog.create({ data: { type: "PUBLIC", status: "FAILURE" } });
    
    try {
      const existing = await prisma.publicEmailProvider.findMany({ 
        where: { isActive: true },
        select: { domain: true } 
      });
      
      const activeDomains = existing.map((p: { domain: string }) => p.domain.toLowerCase());

      if (activeDomains.length === 0) {
        await prisma.publicEmailProvider.createMany({
          data: FALLBACK_PUBLIC_PROVIDERS.map(domain => ({ domain, source: "seed" })),
          skipDuplicates: true
        });
        activeDomains.push(...FALLBACK_PUBLIC_PROVIDERS);
      }
      
      const p = redis.pipeline();
      p.del("domains:public");
      
      const chunkSize = 500;
      for (let i = 0; i < activeDomains.length; i += chunkSize) {
        const chunk = activeDomains.slice(i, i + chunkSize);
        if (chunk.length > 0) {
          const members = chunk as [string, ...string[]];
          p.sadd("domains:public", ...members);
        }
      }
      await p.exec();

      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: "SUCCESS", recordsAdded: activeDomains.length, recordsRemoved: 0, completedAt: new Date() }
      });
      
      return { success: true, count: activeDomains.length };
    } catch (err: any) {
      console.error("[SyncPublicProviders]", err);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { errorMessage: err.message, completedAt: new Date() }
      });
      return { success: false, error: err.message };
    }
  }

  static async syncRoles() {
    const log = await prisma.syncLog.create({ data: { type: "ROLE", status: "FAILURE" } });
    
    try {
      const response = await fetch("https://raw.githubusercontent.com/mixmaxhq/role-based-email-addresses/master/index.js");
      if (!response.ok) throw new Error(`Failed to fetch roles: ${response.status}`);
      
      const text = await response.text();
      const roles = text.split("\n")
        .map(l => l.match(/'([^']+)'/))
        .filter(m => m)
        .map(m => m![1].toLowerCase());
      
      const newRoles = new Set(roles);
      
      const existing = await prisma.roleAddress.findMany({ select: { name: true, isSystem: true } });
      const existingRoles = new Set(existing.map((r: { name: string }) => r.name));
      
      let added = 0;
      let removed = 0; // We won't remove roles from DB, but we can set isSystem to false if they disappear.
      
      const toAdd = [...newRoles].filter(r => !existingRoles.has(r));
      const toSystem = existing.filter((r: { name: string, isSystem: boolean }) => newRoles.has(r.name) && !r.isSystem).map((r: { name: string }) => r.name);
      const toUnsystem = existing.filter((r: { name: string, isSystem: boolean }) => !newRoles.has(r.name) && r.isSystem).map((r: { name: string }) => r.name);
      
      await prisma.$transaction([
        prisma.roleAddress.createMany({
          data: toAdd.map(name => ({ name, isSystem: true })),
          skipDuplicates: true
        }),
        prisma.roleAddress.updateMany({
          where: { name: { in: toSystem } },
          data: { isSystem: true }
        }),
        prisma.roleAddress.updateMany({
          where: { name: { in: toUnsystem } },
          data: { isSystem: false }
        })
      ]);
      
      added = toAdd.length;
      removed = toUnsystem.length;

      const p = redis.pipeline();
      p.del("domains:role");
      
      const activeRoles = [...newRoles];
      const chunkSize = 500;
      for (let i = 0; i < activeRoles.length; i += chunkSize) {
        const chunk = activeRoles.slice(i, i + chunkSize);
        if (chunk.length > 0) {
          const members = chunk as [string, ...string[]];
          p.sadd("domains:role", ...members);
        }
      }
      await p.exec();

      await prisma.syncLog.update({
        where: { id: log.id },
        data: { status: "SUCCESS", recordsAdded: added, recordsRemoved: removed, completedAt: new Date() }
      });
      
      return { success: true, added, removed };
    } catch (err: any) {
      console.error("[SyncRoles]", err);
      await prisma.syncLog.update({
        where: { id: log.id },
        data: { errorMessage: err.message, completedAt: new Date() }
      });
      return { success: false, error: err.message };
    }
  }

  static async runAll() {
    const results = await Promise.allSettled([
      this.syncDisposableDomains(),
      this.syncTlds(),
      this.syncPublicProviders(),
      this.syncRoles()
    ]);
    return results;
  }
}
