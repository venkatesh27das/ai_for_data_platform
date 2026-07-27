import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { WizardFooter } from "../../components/wizard/WizardFooter";
import { WizardPageHeader } from "../../components/wizard/WizardPageHeader";
import { WizardStepper } from "../../components/wizard/WizardStepper";
import { useNewProjectStore } from "../../stores/newProjectStore";
import { InitializationSuccessScreen } from "./InitializationSuccessScreen";
import { GovernanceStep } from "./steps/GovernanceStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ScopeStep } from "./steps/ScopeStep";
import { SourcesStep } from "./steps/SourcesStep";
import { SuccessCriteriaStep } from "./steps/SuccessCriteriaStep";

const stepComponents = [
  ScopeStep,
  SourcesStep,
  SuccessCriteriaStep,
  GovernanceStep,
];

export function NewProjectFoundationPage() {
  const {
    acceptanceCriteria,
    accessEntries,
    assets,
    businessObjective,
    businessQuestions,
    created,
    currentStep,
    domain,
    policies,
    projectName,
    setCreated,
    setCurrentStep,
    subdomains,
    successMetrics,
    targetConsumers,
  } = useNewProjectStore();
  const [draftMessage, setDraftMessage] = useState("");

  const canContinue = useMemo(() => {
    switch (currentStep) {
      case 0:
        return Boolean(
          projectName.trim() &&
            businessObjective.trim() &&
            domain &&
            subdomains.length &&
            targetConsumers.length &&
            businessQuestions.some((question) => question.trim()),
        );
      case 1:
        return assets.some((asset) => asset.selected);
      case 2:
        return (
          successMetrics.length > 0 &&
          acceptanceCriteria.some((criterion) => criterion.selected)
        );
      case 3:
        return (
          accessEntries.length > 0 &&
          policies.some((policy) => policy.selected)
        );
      default:
        return true;
    }
  }, [
    acceptanceCriteria,
    accessEntries.length,
    assets,
    businessObjective,
    businessQuestions,
    currentStep,
    domain,
    policies,
    projectName,
    subdomains.length,
    successMetrics.length,
    targetConsumers.length,
  ]);

  if (created) {
    return <InitializationSuccessScreen />;
  }

  const StepComponent = stepComponents[currentStep];

  const handleContinue = () => {
    if (!canContinue) return;
    if (currentStep === 4) {
      setCreated(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setCurrentStep(Math.min(4, currentStep + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveDraft = () => {
    setDraftMessage("Draft saved locally with all current selections.");
    window.setTimeout(() => setDraftMessage(""), 3000);
  };

  return (
    <div className="page wizard-page">
      <WizardPageHeader
        canContinue={canContinue}
        currentStep={currentStep}
        onBack={handleBack}
        onContinue={handleContinue}
        onSaveDraft={handleSaveDraft}
      />
      <WizardStepper
        currentStep={currentStep}
        onStepChange={setCurrentStep}
      />

      {currentStep < 4 && StepComponent ? (
        <StepComponent />
      ) : (
        <ReviewStep onEdit={setCurrentStep} />
      )}

      <WizardFooter
        canContinue={canContinue}
        currentStep={currentStep}
        onBack={handleBack}
        onContinue={handleContinue}
      />

      {draftMessage && (
        <div className="inline-notice wizard-save-notice" role="status">
          <CheckCircle2 aria-hidden="true" size={17} />
          {draftMessage}
        </div>
      )}
    </div>
  );
}
