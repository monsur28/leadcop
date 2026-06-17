import React from "react";
import { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

// Expose commonly used system icons
export {
  Users,
  Layers,
  Globe,
  ArrowUpCircle,
  FileText,
  DollarSign,
  Activity,
  CreditCard,
  Key,
  ShieldCheck,
  Server,
  Zap,
  Clock,
  AlertTriangle,
  Lock,
  ArrowRight,
  Menu,
  X,
  Search,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Info,
  Home,
  LayoutDashboard
} from "lucide-react";

interface SystemIconProps extends LucideProps {
  icon: React.ElementType;
  sizeVariant?: "sm" | "md" | "lg" | "xl";
}

const sizeMapping = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export function Icon({ icon: IconComponent, sizeVariant = "md", className, ...props }: SystemIconProps) {
  return (
    <IconComponent 
      className={cn("shrink-0", sizeMapping[sizeVariant], className)} 
      {...props} 
    />
  );
}
