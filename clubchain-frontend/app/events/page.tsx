"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@mysten/dapp-kit";
import Link from "next/link";
import type { EventInfo } from "@/src/services/blockchain/getClubs";

export default function EventsPage() {
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const response = await fetch("/api/clubs");
        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }
        const { clubs } = await response.json();
        
        // Flatten all events from all clubs
        const allEvents = clubs.flatMap((club: any) => club.events || []);
        
        // Sort by date (newest first)
        const sortedEvents = allEvents.sort((a: EventInfo, b: EventInfo) => b.date - a.date);
        
        setEvents(sortedEvents);
      } catch (err) {
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <Link href="/" className="text-3xl font-bold text-blue-900 hover:text-blue-700">
            ClubChain
          </Link>
          <ConnectButton />
        </header>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Events</h1>
          <p className="text-gray-600">
            Browse all upcoming events from clubs on the platform
          </p>
        </div>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-2xl bg-blue-50/60"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16 bg-white/80 rounded-2xl border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Events Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first to create an event for your club
            </p>
            <Link
              href="/events/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Create Event
            </Link>
          </div>
        )}

        {!loading && !error && events.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white/80 rounded-2xl border border-blue-100 p-6 shadow-sm hover:shadow-md transition cursor-pointer block"
              >
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-blue-900 mb-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    👥 {event.participants?.length || 0} participants
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 flex gap-4 justify-center">
          <Link
            href="/events/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Create Event
          </Link>
          <Link
            href="/"
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            Browse Clubs
          </Link>
        </div>
      </div>
    </main>
  );
}
