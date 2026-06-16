"use client";

import * as React from "react";
import { useState, useId, useTransition } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Loader2, ArrowRight, Zap, Lock, Users, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { loginAction, registerAction, googleLoginAction } from "@/features/auth/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary hover:underline underline-offset-4",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-full px-3",
        lg: "h-12 rounded-full px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border border-transparent bg-muted/40 px-5 py-3 text-sm text-foreground shadow-sm transition-all placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:bg-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id} className="sr-only">{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-12", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-2 flex h-full w-10 items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const res = await loginAction({ email, password });
      if (!res.success) {
        setError(res.error || "Login failed");
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[400px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to your LeadCop account to continue.</p>
      </div>

      <form onSubmit={handleSignIn} autoComplete="on" className="grid gap-3">
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="sr-only">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required autoComplete="email" disabled={isPending} />
        </div>
        
        <PasswordInput id="password" name="password" label="Password" required autoComplete="current-password" placeholder="Password" disabled={isPending} />
        
        <Button type="submit" variant="default" className="mt-2 text-base font-semibold" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Log in <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-4 text-muted-foreground uppercase text-xs tracking-wider">Or continue with</span>
      </div>

      <form action={googleLoginAction}>
        <Button variant="outline" type="submit" className="w-full text-base font-medium h-12 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-1">
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onToggle} className="text-primary font-semibold hover:underline transition-all">
          Sign up
        </button>
      </div>
    </div>
  );
}

function SignUpForm({ onToggle }: { onToggle: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => { 
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const res = await registerAction({ name, email, password, confirmPassword });
      if (!res.success) {
        setError(res.error || "Registration failed");
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[400px]">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground leading-relaxed pr-8">
          Start protecting your platform from low-quality signups in minutes.
        </p>
      </div>

      <form onSubmit={handleSignUp} autoComplete="on" className="grid gap-3">
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        
        <div className="grid gap-1.5">
          <Label htmlFor="name" className="sr-only">Full name</Label>
          <Input id="name" name="name" type="text" placeholder="Full name" required autoComplete="name" disabled={isPending} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="email" className="sr-only">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@company.com" required autoComplete="email" disabled={isPending} />
        </div>
        
        <PasswordInput id="signup-password" name="password" label="Password" required autoComplete="new-password" placeholder="Password (min 6 characters)" disabled={isPending} />
        <PasswordInput id="signup-confirm-password" name="confirmPassword" label="Confirm password" required autoComplete="new-password" placeholder="Confirm password" disabled={isPending} />
        
        <Button type="submit" variant="default" className="mt-2 text-base font-semibold" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Create account <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>

      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-4 text-muted-foreground uppercase text-xs tracking-wider">Or continue with</span>
      </div>

      <form action={googleLoginAction}>
        <Button variant="outline" type="submit" className="w-full text-base font-medium h-12 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-3 h-5 w-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-1">
        Already have an account?{" "}
        <button type="button" onClick={onToggle} className="text-primary font-semibold hover:underline transition-all">
          Log in
        </button>
      </div>
    </div>
  );
}

function ValuePropositionPanel() {
  return (
    <div className="w-full max-w-[500px] space-y-8">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-foreground leading-tight">
          Stop fake signups <br /> before they start.
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          LeadCop detects disposable email addresses in real time, keeping your user base clean and your metrics trustworthy.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Real-time detection</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Flag disposable emails before the user submits the form.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">100K+ blocked domains</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Covers Mailinator, Guerrilla Mail, 10MinuteMail and thousands more.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Trusted by 10,000+ developers</h3>
            <p className="text-sm text-muted-foreground mt-0.5">From indie makers to enterprise teams protecting millions of signups.</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-wrap items-center gap-6 sm:gap-10 border-t border-border/50">
        <div>
          <p className="text-2xl font-bold text-primary">99.9%</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Accuracy</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">&lt;50ms</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Response</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">100K+</p>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Domains</p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">Free plan</span>
        </div>
      </div>
    </div>
  );
}

export function AuthUI({ initialMode = "signin" }: { initialMode?: "signin" | "signup" }) {
  const [isSignIn, setIsSignIn] = useState(initialMode === "signin");
  const toggleForm = () => setIsSignIn((prev) => !prev);

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-[1fr_1.2fr] bg-background">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Left Form Panel */}
      <div className="flex flex-col relative z-10 px-6 py-8 lg:px-16 lg:py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Lock className="h-5 w-5" />
            </div>
            LeadCop<span className="text-primary">.io</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="w-full">
            {isSignIn ? <SignInForm onToggle={toggleForm} /> : <SignUpForm onToggle={toggleForm} />}
          </div>
        </div>
      </div>

      {/* Right Value Proposition Panel */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-muted/30 via-muted/50 to-muted items-center justify-center p-8 lg:p-16 border-l border-border/50">
        <ValuePropositionPanel />
      </div>
    </div>
  );
}
