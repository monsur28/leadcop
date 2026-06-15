import Link from "next/link";
import { googleLoginAction } from "@/features/auth/actions";

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">Enter your information to get started</p>
        </div>

        {/* Note: In a real implementation we would use a client component for the form state */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="name">Full Name</label>
            <input id="name" type="text" placeholder="John Doe" required className="w-full p-2 border rounded-md bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="m@example.com" required className="w-full p-2 border rounded-md bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <input id="password" type="password" required className="w-full p-2 border rounded-md bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
            <input id="confirmPassword" type="password" required className="w-full p-2 border rounded-md bg-background" />
          </div>
          <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium">
            Create Account
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <form action={googleLoginAction}>
          <button type="submit" className="w-full py-2 border rounded-md hover:bg-muted font-medium">
            Google
          </button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
