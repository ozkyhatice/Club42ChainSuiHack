export default function FeatureCards() {
  const features = [
    {
      icon: "📅",
      title: "Event Management",
      description: "Create and publish events on-chain with transparent scheduling",
    },
    {
      icon: "⚡",
      title: "Conflict Detection",
      description: "Prevent scheduling conflicts across campus clubs automatically",
    },
    {
      icon: "💰",
      title: "Fundraising Pools",
      description: "Create transparent escrow pools for event fundraising (Coming soon)",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-16">
      {features.map((feature) => (
        <div key={feature.title} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-blue-900">
            {feature.icon} {feature.title}
          </h3>
          <p className="text-gray-600">{feature.description}</p>
        </div>
      ))}
    </div>
  );
}

