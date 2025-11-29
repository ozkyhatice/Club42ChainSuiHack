"use client";

import { memo } from "react";
import Card, { CardBody } from "@/components/ui/Card";
import ScrollSection from "@/components/landing/ScrollSection";
import { Calendar, Zap, DollarSign, CheckCircle2 } from "lucide-react";

const FeatureCards = memo(function FeatureCards() {
  const features = [
    {
      icon: Calendar,
      iconColor: "text-primary",
      bgGradient: "from-primary/20 to-primary/10",
      borderColor: "border-primary/30",
      title: "Event Management",
      description: "Create and publish events on-chain with transparent scheduling",
      badge: "Live",
      badgeColor: "bg-success/20 text-success border-success/30",
    },
    {
      icon: Zap,
      iconColor: "text-warning",
      bgGradient: "from-warning/20 to-warning/10",
      borderColor: "border-warning/30",
      title: "Conflict Detection",
      description: "Prevent scheduling conflicts across campus clubs automatically",
      badge: "Live",
      badgeColor: "bg-success/20 text-success border-success/30",
    },
    {
      icon: DollarSign,
      iconColor: "text-accent",
      bgGradient: "from-accent/20 to-accent/10",
      borderColor: "border-accent/30",
      title: "Fundraising Pools",
      description: "Create transparent escrow pools for event fundraising",
      badge: "Coming Soon",
      badgeColor: "bg-warning/20 text-warning border-warning/30",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <ScrollSection key={feature.title} direction="up" delay={index * 150}>
            <Card hover className="h-full card-interactive group relative overflow-hidden border-2 hover:border-primary/50 transition-all shadow-elevation-2 hover:shadow-elevation-3">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border ${feature.badgeColor} backdrop-blur-sm z-10`}>
                {feature.badge}
              </div>
              
              <CardBody className="text-center relative z-10 p-8">
                <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.bgGradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-elevation-1 group-hover:shadow-elevation-2 border ${feature.borderColor}`}>
                  <Icon className={`w-14 h-14 ${feature.iconColor}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-text-muted leading-relaxed">{feature.description}</p>
                
                {/* Progress indicator */}
                <div className="mt-6 pt-6 border-t border-secondary/50">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${feature.badge === "Live" ? "text-success" : "text-warning"}`} />
                    <span className="text-xs font-medium text-text-muted">
                      {feature.badge === "Live" ? "Fully Operational" : "In Development"}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </ScrollSection>
        );
      })}
    </div>
  );
});

export default FeatureCards;

