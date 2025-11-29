'use client';

import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useDynamicEvents } from './useDynamicEvents';
import EventsList from './EventsList';

export default function EventsPage() {
  const account = useCurrentAccount();
  const { events, isLoading, error, refetch } = useDynamicEvents();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-600 hover:underline mb-2 block">
              ← Home
            </Link>
            <h1 className="text-3xl font-bold">Campus Events</h1>
            <p className="text-gray-600 mt-2">
              {isLoading ? 'Loading...' : `${events.length} event${events.length !== 1 ? 's' : ''} on-chain`}
            </p>
          </div>
          {account && (
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                🔄 Refresh
              </button>
              <Link
                href="/events/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition"
              >
                + Create Event
              </Link>
            </div>
          )}
        </div>

        {!account ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-8">
              Please connect your wallet to view and manage events.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              Go to Home
            </Link>
          </div>
        ) : (
          <>
            <EventsList
              events={events}
              isLoading={isLoading}
              error={error}
              onRefresh={refetch}
            />

            {account && !isLoading && events.length > 0 && (
              <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-100">
                <h3 className="font-semibold mb-3 text-lg">💡 How ClubChain Works</h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Events are stored as shared objects on Sui blockchain</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>All event data is transparent and verifiable on-chain</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Automatic conflict detection prevents double-booking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span>Connected: {account.address.slice(0, 10)}...{account.address.slice(-6)}</span>
                  </li>
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

