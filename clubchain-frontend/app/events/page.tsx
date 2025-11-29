"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getClubs } from "@/src/services/blockchain/getClubs";
import GamifiedButton from "@/components/ui/GamifiedButton";
import StatCard from "@/components/ui/StatCard";
import { Sparkles, Search, Calendar, Users, Plus, ArrowRight } from "lucide-react";
import type { EventInfo } from "@/src/services/blockchain/getClubs";
import Link from "next/link";
import { useIsAnyClubOwner } from "@/hooks/useClubOwnership";

export default function EventsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const { isOwner } = useIsAnyClubOwner();

  // Fetch all clubs to get events
  const { data: clubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["all-events-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });

  // Flatten all events from all clubs
  const allEvents: EventInfo[] = clubs.flatMap((club) => club.events || []);
  
  // Sort by date (upcoming first)
  const sortedEvents = [...allEvents].sort((a, b) => a.date - b.date);
  
  // Filter events by search
  const filteredEvents = sortedEvents.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate upcoming and past events
  const now = Date.now();
  const upcomingEvents = filteredEvents.filter((e) => e.date > now);
  const pastEvents = filteredEvents.filter((e) => e.date <= now);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-primary rounded-xl p-8 text-white shadow-elevation-3 animate-slideUp">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-10 h-10 animate-icon-pulse" />
            <h1 className="text-3xl md:text-4xl font-bold">All Events</h1>
          </div>
          <p className="text-white/90 text-lg">
            Discover and join events from all clubs on campus
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 animate-slideUp animation-delay-200">
          <StatCard
            label="Total Events"
            value={clubsLoading ? "..." : allEvents.length}
            icon={Calendar}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatCard
            label="Upcoming"
            value={clubsLoading ? "..." : upcomingEvents.length}
            icon={Sparkles}
            iconColor="text-accent"
            iconBgColor="bg-accent/10"
          />
          <StatCard
            label="Past Events"
            value={clubsLoading ? "..." : pastEvents.length}
            icon={Calendar}
            iconColor="text-text-muted"
            iconBgColor="bg-secondary"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-6 animate-slideUp animation-delay-300">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search events by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-input-bg border border-input-border rounded-lg text-foreground placeholder:text-text-muted focus:ring-2 focus:ring-input-focus focus:border-input-focus outline-none transition-all"
              />
            </div>
            {isOwner && (
              <GamifiedButton
                variant="gradient"
                size="md"
                icon={Plus}
                onClick={() => router.push("/events/create")}
              >
                Create Event
              </GamifiedButton>
            )}
          </div>
        </div>

        {/* Events List */}
        <div className="animate-slideUp animation-delay-400">
          {clubsLoading ? (
            <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-text-muted">Loading events from blockchain...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-card border border-border rounded-xl shadow-elevation-2 p-12 text-center">
              <div className="inline-flex p-6 bg-secondary rounded-2xl mb-6">
                <Calendar className="w-16 h-16 text-text-muted" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                {searchTerm ? "No events found" : "No events yet"}
              </h3>
              <p className="text-text-muted mb-6">
                {searchTerm
                  ? "Try a different search term"
                  : "Be the first to create an event!"}
              </p>
              {isOwner && !searchTerm && (
                <GamifiedButton
                  variant="primary"
                  icon={Plus}
                  onClick={() => router.push("/events/create")}
                >
                  Create First Event
                </GamifiedButton>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary animate-icon-pulse" />
                    Upcoming Events ({upcomingEvents.length})
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {pastEvents.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-text-muted mb-4 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-text-muted" />
                    Past Events ({pastEvents.length})
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-75">
                    {pastEvents.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Event Card Component
function EventCard({ event }: { event: EventInfo }) {
  const eventDate = new Date(event.date);
  const isUpcoming = event.date > Date.now();

  return (
    <Link
      href={`/events/${event.id}`}
      prefetch={false}
      className="bg-card border border-border rounded-xl p-6 shadow-elevation-2 hover-lift transition-all card-interactive group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary mb-2">
            <Calendar className="w-3 h-3" />
            <span>
              {eventDate.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {isUpcoming && (
          <span className="px-2 py-1 text-xs font-semibold bg-success/10 text-success border border-success/20 rounded-full">
            Upcoming
          </span>
        )}
      </div>

      <p className="text-sm text-text-muted mb-4 line-clamp-2">
        {event.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Users className="w-3 h-3" />
          <span>{event.participants?.length || 0} participants</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-2 transition-all">
          <span>View Details</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
