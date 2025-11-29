"use client";

interface Step {
  number: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
}

interface RegistrationStepsProps {
  currentStep: number;
}

export default function RegistrationSteps({ currentStep }: RegistrationStepsProps) {
  const steps: Step[] = [
    {
      number: 1,
      title: "42 Account",
      description: "Sign in with your 42 credentials",
      isComplete: currentStep > 1,
      isActive: currentStep === 1,
    },
    {
      number: 2,
      title: "Sui Wallet",
      description: "Connect your Sui wallet",
      isComplete: currentStep > 2,
      isActive: currentStep === 2,
    },
    {
      number: 3,
      title: "On-Chain Registration",
      description: "Link your identity on the blockchain",
      isComplete: currentStep > 3,
      isActive: currentStep === 3,
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-6 text-foreground">Registration Progress</h2>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center w-full">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all duration-300 ${
                  step.isComplete
                    ? "bg-gradient-to-br from-success to-success-light text-white shadow-lg shadow-success/30 scale-110"
                    : step.isActive
                    ? "bg-gradient-to-br from-primary/30 to-primary/20 text-primary border-2 border-primary/50 shadow-lg shadow-primary/20 scale-105"
                    : "bg-secondary text-text-muted border border-border"
                }`}
              >
                {step.isComplete ? (
                  <span className="text-lg sm:text-xl">✓</span>
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              
              {/* Step Info */}
              <div className="mt-3 text-center w-full">
                <p className={`text-xs sm:text-sm font-semibold mb-1 ${
                  step.isComplete 
                    ? "text-success" 
                    : step.isActive 
                    ? "text-primary" 
                    : "text-text-muted"
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-text-secondary leading-tight">
                  {step.description}
                </p>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 transition-all duration-300 ${
                  step.isComplete 
                    ? "bg-gradient-to-r from-success to-success-light" 
                    : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

