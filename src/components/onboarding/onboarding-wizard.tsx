"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WizardProgress } from "./wizard-progress";
import { StepSelectPlan } from "./step-select-plan";
import { StepAddDomain } from "./step-add-domain";
import { StepGenerateKey } from "./step-generate-key";
import { StepInstallation } from "./step-installation";
import { StepSuccess } from "./step-success";

interface OnboardingState {
  hasSubscription: boolean;
  domainAdded: boolean;
  keyGenerated: boolean;
  scriptInstalled: boolean;
  latestKeyHint?: string;
}

interface OnboardingWizardProps {
  initialState: OnboardingState;
}

const STEPS = [
  { id: "plan", title: "Select Plan" },
  { id: "add", title: "Add Domain" },
  { id: "key", title: "API Key" },
  { id: "install", title: "Install" }
];

export function OnboardingWizard({ initialState }: OnboardingWizardProps) {
  const router = useRouter();

  // Determine initial step based on server state
  let initialStep = 1; // Default to Select Plan
  if (initialState.scriptInstalled) initialStep = 5;
  else if (initialState.keyGenerated) initialStep = 4;
  else if (initialState.domainAdded) initialStep = 3;
  else if (initialState.hasSubscription) initialStep = 2; // Move to Add Domain if plan selected

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [domainId, setDomainId] = useState<string>("");
  const [hostname, setHostname] = useState<string>("");
  const [generatedKey, setGeneratedKey] = useState<string>(initialState.latestKeyHint || "");

  const handlePlanSelected = () => {
    setCurrentStep(2);
    router.refresh();
  };

  const handleDomainAdded = (id: string, name: string, key: string) => {
    setDomainId(id);
    setHostname(name);
    setGeneratedKey(key);
    setCurrentStep(3); // Go straight to API Key step
    router.refresh();
  };

  const handleKeyGenerated = (key: string) => {
    setGeneratedKey(key);
    setCurrentStep(4);
  };

  const handleScriptInstalled = () => {
    setCurrentStep(5); // Success step
  };

  const handleComplete = () => {
    // Refresh to completely swap out the wizard for the normal dashboard view
    router.refresh();
  };

  // Prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      {currentStep < 5 && (
        <WizardProgress currentStep={currentStep} steps={STEPS} />
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 md:p-12 mt-8 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-[#FF7A00]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full">
          {currentStep === 1 && (
            <StepSelectPlan onNext={handlePlanSelected} />
          )}

          {currentStep === 2 && (
            <StepAddDomain onNext={handleDomainAdded} />
          )}

          {currentStep === 3 && (
            <StepGenerateKey 
              domainId={domainId} 
              rawKey={generatedKey}
              onNext={handleKeyGenerated} 
            />
          )}

          {currentStep === 4 && (
            <StepInstallation 
              apiKey={generatedKey}
              onNext={handleScriptInstalled} 
            />
          )}

          {currentStep === 5 && (
            <StepSuccess 
              onComplete={handleComplete} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
