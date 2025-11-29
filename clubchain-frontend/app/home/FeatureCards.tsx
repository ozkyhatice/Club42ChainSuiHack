"use client";

import { memo } from "react";
import Card, { CardBody } from "@/components/ui/Card";
import { Calendar, Zap, DollarSign } from "lucide-react";

const FeatureCards = memo(function FeatureCards() {
  const features = [
    {
      icon: Calendar,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
      title: "Event Management",
      description: "Create and publish events on-chain with transparent scheduling",
    },
    {
      icon: Zap,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
      title: "Conflict Detection",
      description: "Prevent scheduling conflicts across campus clubs automatically",
    },
    {
      icon: DollarSign,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      title: "Fundraising Pools",
      description: "Create transparent escrow pools for event fundraising (Coming soon)",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-16">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.title}
            className="animate-slideUp"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <Card hover className="h-full card-interactive group">
              <CardBody className="text-center">
                <div className={`inline-flex p-4 rounded-xl ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform shadow-elevation-1 group-hover:shadow-elevation-2`}>
                  <Icon className={`w-12 h-12 ${feature.iconColor}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-blue-900 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardBody>
            </Card>
          </div>
        );
      })}
    </div>
  );
});

export default FeatureCards;

