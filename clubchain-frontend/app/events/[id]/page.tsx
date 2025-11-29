"use client";

import { use } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";
import { useEventDetail } from "./useEventDetail";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    event,
    loading,
    error,
    isParticipant,
    actionLoading,
    handleJoin,
    handleLeave,
    isConnected,
  } = useEventDetail(id);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link
            href="/"
            className="text-3xl font-bold text-blue-900 hover:text-blue-700"
          >
            ClubChain
          </Link>
          <ConnectButton />
        </header>

        {loading && (
          <div className="bg-white/80 rounded-2xl border border-blue-100 p-8 animate-pulse">
            <div className="h-8 bg-blue-100 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-blue-50 rounded w-1/2 mb-6"></div>
            <div className="h-32 bg-blue-50 rounded mb-6"></div>
            <div className="h-10 bg-blue-100 rounded w-32"></div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
            {error}
          </div>
        )}

        {!loading && event && (
          <div className="bg-white/80 rounded-2xl border border-blue-100 p-8 shadow-sm">
            {/* Event Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-blue-900 mb-4">
                {event.title}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="text-sm">
                  📅{" "}
                  {new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Event Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                About This Event
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Participants Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Participants ({event.participants.length})
              </h2>
              {event.participants.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No participants yet. Be the first to join!
                </p>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {event.participants.map((participant, index) => (
                    <div
                      key={participant}
                      className="text-sm text-gray-700 py-2 border-b border-blue-100 last:border-0"
                    >
                      {index + 1}. {participant.slice(0, 10)}...
                      {participant.slice(-8)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center">
              {!isConnected ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  Please connect your wallet to join this event
                </div>
              ) : isParticipant ? (
                <button
                  onClick={handleLeave}
                  disabled={actionLoading}
                  className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Leave Event"}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Processing..." : "Join Event"}
                </button>
              )}

              <Link
                href={`/club/${event.clubId}`}
                className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                View Club
              </Link>
            </div>

            {/* Event Info Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Event ID:</span>
                  <p className="text-gray-700 font-mono text-xs break-all">
                    {event.id}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Created By:</span>
                  <p className="text-gray-700 font-mono text-xs break-all">
                    {event.createdBy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Navigation */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/events"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to All Events
          </Link>
        </div>
      </div>
    </main>
  );
}


