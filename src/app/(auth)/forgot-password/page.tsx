import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">Enter your email and we will send you a reset link</p>
        </div>

        {/* Note: In a real implementation we would use a client component for the form state */}
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="m@example.com" required className="w-full p-2 border rounded-md bg-background" />
          </div>
          
          <button type="submit" className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium">
            Send Reset Link
          </button>
        </form>

        <div className="text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
