import { ArrowLeft, ArrowRight } from "lucide-react";
import { wizardSteps } from "../../data/mock/wizardFixtures";
import { Button } from "../ui/Button";

interface WizardFooterProps {
  currentStep: number;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
}

export function WizardFooter({
  currentStep,
  canContinue,
  onBack,
  onContinue,
}: WizardFooterProps) {
  const isReview = currentStep === wizardSteps.length - 1;
  return (
    <footer className="wizard-footer">
      <Button disabled={currentStep === 0} onClick={onBack}>
        <ArrowLeft aria-hidden="true" size={16} />
        {currentStep === 0
          ? "Back"
          : `Back: ${wizardSteps[currentStep - 1].label}`}
      </Button>
      <Button
        disabled={!canContinue}
        onClick={onContinue}
        variant="primary"
      >
        {isReview
          ? "Create Project"
          : `Next: ${wizardSteps[currentStep + 1].label}`}
        <ArrowRight aria-hidden="true" size={16} />
      </Button>
    </footer>
  );
}
