'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import CreateEventForm from './CreateEventForm';
import Link from 'next/link';

export default function CreateEventPage() {
  const account = useCurrentAccount();

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to create an event.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/events" className="text-blue-600 hover:underline">
            ← Back to Events
          </Link>
        </div>
        <CreateEventForm />
      </div>
    </div>
  );
}

