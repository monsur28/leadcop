import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureAccessService } from "@/features/subscriptions/services";
import { toggleSystemRole, addCustomRole, deleteCustomRole } from "@/features/roles/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function RoleDetectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const accessLimits = await FeatureAccessService.evaluate(userId, prisma);
  
  if (!accessLimits) return null;
  
  if (!accessLimits.features.roleDetection) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Role Detection</h1>
        <Card>
          <CardHeader>
            <CardTitle>Feature Locked</CardTitle>
            <CardDescription>Upgrade to Growth or Agency to access Role Detection customization.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Fetch all system roles
  const systemRoles = await prisma.roleAddress.findMany({ where: { isSystem: true }, orderBy: { name: 'asc' } });
  
  // Fetch user overrides
  const overrides = await prisma.websiteRoleRule.findMany({ where: { userId, websiteId: null } });
  
  // Fetch custom roles
  const customRoles = await prisma.customRoleAddress.findMany({ where: { userId, websiteId: null }, orderBy: { name: 'asc' } });

  const getIsBlocked = (roleId: string) => {
    const override = overrides.find((o: { roleAddressId: string; isBlocked: boolean }) => o.roleAddressId === roleId);
    if (override) return override.isBlocked;
    return true; // System roles are blocked by default
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Detection</h1>
        <p className="text-muted-foreground">Manage which role-based emails (e.g., admin@, sales@) are blocked.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>Standard roles synced dynamically from global repositories.</CardDescription>
          </CardHeader>
          <CardContent>
            {accessLimits.features.allowRoleOverrides ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                {systemRoles.map((role: any) => {
                  const isBlocked = getIsBlocked(role.id);
                  return (
                    <div key={role.id} className="flex items-center justify-between border-b pb-2">
                      <label className="flex flex-col cursor-pointer">
                        <span className="font-semibold">{role.name}@</span>
                        <span className="text-xs text-muted-foreground">
                          {isBlocked ? "Blocked" : "Allowed"}
                        </span>
                      </label>
                      <form action={async () => {
                        "use server";
                        await toggleSystemRole(role.id, !isBlocked);
                      }}>
                        <input type="checkbox" onChange={(e) => e.target.form?.requestSubmit()} checked={!isBlocked} className="w-5 h-5 accent-orange-600 cursor-pointer" />
                      </form>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md text-center">
                System role overrides are only available on higher plans.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Roles</CardTitle>
            <CardDescription>Define your own roles to block.</CardDescription>
          </CardHeader>
          <CardContent>
            {accessLimits.features.allowCustomRoles ? (
              <div className="space-y-4">
                <form action={async (formData) => {
                  "use server";
                  const name = formData.get("name") as string;
                  await addCustomRole(name);
                }} className="flex gap-2">
                  <Input name="name" placeholder="e.g. affiliate" required />
                  <Button type="submit">Add</Button>
                </form>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {customRoles.length === 0 && <p className="text-sm text-muted-foreground">No custom roles defined.</p>}
                  {customRoles.map((role: any) => (
                    <div key={role.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                      <span className="font-medium text-sm">{role.name}@</span>
                      <form action={async () => {
                        "use server";
                        await deleteCustomRole(role.id);
                      }}>
                        <Button type="submit" variant="ghost" size="sm" className="h-8 text-red-600">Delete</Button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md text-center">
                Custom roles are only available on the Agency plan.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
