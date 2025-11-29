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
      <h2 className="text-xl font-semibold mb-4">Registration Progress</h2>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step.isComplete
                    ? "bg-green-500 text-white"
                    : step.isActive
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-sm"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.isComplete ? "✓" : step.number}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step.isComplete ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

