import { Check } from "lucide-react";
import { wizardSteps } from "../../data/mock/wizardFixtures";

interface WizardStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function WizardStepper({
  currentStep,
  onStepChange,
}: WizardStepperProps) {
  return (
    <ol className="wizard-steps" aria-label="Project creation steps">
      {wizardSteps.map((step, index) => {
        const state =
          index === currentStep
            ? "active"
            : index < currentStep
              ? "complete"
              : "upcoming";
        return (
          <li
            aria-current={state === "active" ? "step" : undefined}
            className={`wizard-step wizard-step--${state}`}
            key={step.id}
          >
            <button
              aria-label={`Go to ${step.label}`}
              disabled={index > currentStep}
              onClick={() => onStepChange(index)}
              type="button"
            >
              {index < currentStep ? <Check size={14} /> : index + 1}
            </button>
            <strong>{step.label}</strong>
          </li>
        );
      })}
    </ol>
  );
}
