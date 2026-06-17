import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      <header className="h-16 px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#FF7A00] to-[#FF9F43] text-white shadow-sm shadow-orange-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2 0 4 1 7 2a1 1 0 0 1 1 1v7z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <span className="font-bold tracking-tight text-slate-900">
            LeadCop
          </span>
        </div>
        <div className="text-sm font-semibold text-slate-500">
          Onboarding
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center pt-12 md:pt-20 px-4 pb-12">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
export const dynamic = "force-dynamic";
