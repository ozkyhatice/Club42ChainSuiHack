"use client";

import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Hero from "./Hero";
import FeatureCards from "./FeatureCards";
import { ClubList } from "@/src/modules/clubs/ClubList";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-bold text-blue-900">ClubChain</h1>
          
          <div className="flex items-center gap-4">
            {!session ? (
              <Link 
                href="/auth/signin"
                className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 transition flex items-center gap-2"
              >
                <span>🚀</span> Student Login (42)
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">{session.user?.login}</p>
                  <p className="text-xs text-green-600">Verified Student</p>
                </div>
              </div>
            )}

            <ConnectButton />
          </div>
        </header>

        <Hero />
        <FeatureCards />
        <ClubList />
      </div>
    </main>
  );
}

