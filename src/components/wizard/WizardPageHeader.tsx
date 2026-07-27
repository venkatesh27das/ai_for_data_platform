import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { wizardSteps } from "../../data/mock/wizardFixtures";
import { Button } from "../ui/Button";

interface WizardPageHeaderProps {
  currentStep: number;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSaveDraft: () => void;
}

export function WizardPageHeader({
  currentStep,
  canContinue,
  onBack,
  onContinue,
  onSaveDraft,
}: WizardPageHeaderProps) {
  const navigate = useNavigate();
  const step = wizardSteps[currentStep];
  const isFirst = currentStep === 0;
  const isReview = currentStep === wizardSteps.length - 1;

  return (
    <>
      <div className="breadcrumbs">
        <button onClick={() => navigate("/projects")} type="button">
          Knowledge Projects
        </button>
        <span>/</span>
        <span>New Knowledge Project</span>
      </div>
      <div className="wizard-title-row">
        <div>
          {!isFirst && <span className="wizard-kicker">New Knowledge Project</span>}
          <h1>{step.title}</h1>
          <p>{step.description}</p>
        </div>
        <div className="wizard-title-actions">
          <Button onClick={onSaveDraft}>Save Draft</Button>
          {!isFirst && (
            <Button onClick={onBack}>
              <ArrowLeft aria-hidden="true" size={15} />
              Back
            </Button>
          )}
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
        </div>
      </div>
    </>
  );
}
