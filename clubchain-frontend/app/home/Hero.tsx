"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";

export default function Hero() {
  const account = useCurrentAccount();

  return (
    <div className="text-center py-20">
      <h2 className="text-5xl font-bold mb-4 text-gray-900">
        42 Campus Event Management
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        On-chain scheduling and fundraising for campus clubs
      </p>
      
      {account ? (
        <div>
          <div className="bg-green-50 p-4 rounded-lg inline-block mb-8">
            <p className="text-green-800 font-medium">
              ✓ Wallet Connected
            </p>
            <p className="text-sm text-green-600">
              {account.address.slice(0, 8)}...{account.address.slice(-6)}
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Events
            </Link>
            <Link
              href="/events/create"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Create Event
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Connect your wallet to get started</p>
      )}
    </div>
  );
}

