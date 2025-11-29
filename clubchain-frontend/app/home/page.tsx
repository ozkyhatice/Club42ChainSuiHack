"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import Hero from "./Hero";
import FeatureCards from "./FeatureCards";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900">ClubChain</h1>
          <ConnectButton />
        </header>

        <Hero />
        <FeatureCards />
      </div>
    </main>
  );
}

