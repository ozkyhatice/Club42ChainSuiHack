"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useAdminCaps } from "@/modules/admin/useAdminCap";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboardPage() {
  const account = useCurrentAccount();
  const router = useRouter();
  const { caps, loading, error } = useAdminCaps();

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Connect Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the admin dashboard.
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your clubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your clubs and create events
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/clubs/create"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create New Club
                </h3>
                <p className="text-sm text-gray-600">
                  Start a new club and become its president
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/events/create"
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition group"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Create Event
                </h3>
                <p className="text-sm text-gray-600">
                  Create a new event for your club
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Clubs List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Clubs ({caps.length})
          </h2>

          {caps.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-gray-300 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Clubs Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't created any clubs yet. Create your first club to get started!
              </p>
              <Link
                href="/clubs/create"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Club
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caps.map((cap) => (
                <div
                  key={cap.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Club
                      </h3>
                      <p className="text-xs text-gray-500 font-mono">
                        {cap.club_id.slice(0, 12)}...
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Admin
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/clubs/${cap.club_id}/manage`}
                      className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700 transition text-center"
                    >
                      Manage
                    </Link>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(cap.club_id);
                        alert("Club ID copied to clipboard!");
                      }}
                      className="bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded hover:bg-gray-300 transition"
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">
            About Admin Capabilities
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              • You are the admin of {caps.length} club{caps.length !== 1 ? 's' : ''}
            </p>
            <p>
              • As an admin, you can create and manage events for your clubs
            </p>
            <p>
              • Your admin status is stored on-chain as a ClubAdminCap NFT
            </p>
            <p>
              • Only you can update or delete clubs you created
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

