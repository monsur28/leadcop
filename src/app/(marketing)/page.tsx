import { HeroSection } from "./components/HeroSection";
import { InteractiveDemoSection } from "./components/InteractiveDemoSection";
import { BeforeAfterSection } from "./components/BeforeAfterSection";
import { DashboardPreviewSection } from "./components/DashboardPreviewSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { FeaturesGridSection } from "./components/FeaturesGridSection";
import { SupportedFormsSection } from "./components/SupportedFormsSection";
import { WordPressPluginSection } from "./components/WordPressPluginSection";
import { TrustSecuritySection } from "./components/TrustSecuritySection";
import { CodeInstallationSection } from "./components/CodeInstallationSection";
import { PricingPreviewSection } from "./components/PricingPreviewSection";
import { FaqSection } from "./components/FaqSection";
import { CtaFooterSection } from "./components/CtaFooterSection";

export const metadata = {
  title: "LeadCop - Stop fake leads before they enter your CRM",
  description: "LeadCop helps companies prevent low-quality leads by blocking disposable, role-based, and low-value email addresses.",
};

export default function MarketingPage() {
  return (
    <>
      <HeroSection />
      <InteractiveDemoSection />
      <BeforeAfterSection />
      <DashboardPreviewSection />
      <HowItWorksSection />
      <FeaturesGridSection />
      <SupportedFormsSection />
      <WordPressPluginSection />
      <TrustSecuritySection />
      <CodeInstallationSection />
      <PricingPreviewSection />
      <FaqSection />
      <CtaFooterSection />
    </>
  );
}
