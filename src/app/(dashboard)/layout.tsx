import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Cast type or pass directly
  const userData = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    globalRole: session.user.globalRole,
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      <DashboardSidebar user={userData as any} />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <DashboardHeader user={userData} />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
