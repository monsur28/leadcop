import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.globalRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const userData = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      <AdminSidebar user={userData} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
