"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ModuleCard from "./ModuleCard";
import GamifiedButton from "@/components/ui/GamifiedButton";
import { getClubs } from "@/src/services/blockchain/getClubs";
import { getEvents } from "@/src/services/blockchain/getEvents";
import type { EventInfo } from "@/src/services/blockchain/getEvents";
import { useCanCreateEvent } from "@/hooks/useBadgeAuth";
import Card, { CardBody } from "@/components/ui/Card";
import { 
  Building2, 
  Sparkles, 
  Calendar,
  Plus,
  ArrowRight,
  MapPin,
  Users
} from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  const router = useRouter();
  
  // Fetch all clubs for stats
  const { data: allClubs = [], isLoading: clubsLoading } = useQuery({
    queryKey: ["dashboard-clubs"],
    queryFn: getClubs,
    staleTime: 60000,
  });
  
  // Fetch all events
  const { data: allEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: getEvents,
    staleTime: 60000,
  });
  
  const canCreateEvent = useCanCreateEvent();
  
  // Create a map of club IDs to club names
  const clubNameMap = new Map(allClubs.map(club => [club.id, club.name]));
  
  // Sort events by date (upcoming first) and get upcoming events
  const now = Date.now();
  const sortedEvents = [...allEvents].sort((a, b) => a.date - b.date);
  const upcomingEvents = sortedEvents.filter((e) => e.date > now).slice(0, 6); // Show max 6 upcoming events
  
  // Calculate stats
  const totalEvents = allClubs.reduce((sum, club) => sum + club.events.length, 0);
  
  return (
    <div className="space-y-6">
      {/* Modular Dashboard Cards */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slideUp animation-delay-500">
        {/* All Clubs Module */}
        <ModuleCard
          title="Club Directory"
          description="Discover all clubs on campus and find your community"
          icon={Building2}
          iconColor="text-[#6b5b95]"
          stats={[
            { label: "Total Clubs", value: clubsLoading ? "--" : allClubs.length.toString() },
            { label: "Active", value: clubsLoading ? "--" : allClubs.length.toString() }
          ]}
          actions={[
            { label: "Explore Clubs", href: "/clubs" }
          ]}
          onClick={() => router.push("/clubs")}
        />
        
        {/* All Events Module */}
        <ModuleCard
          title="Event Listings"
          description="Browse upcoming events and register to participate"
          icon={Sparkles}
          iconColor="text-warning"
          stats={[
            { label: "Total Events", value: eventsLoading ? "--" : allEvents.length.toString() },
            { label: "Upcoming", value: eventsLoading ? "--" : upcomingEvents.length.toString() }
          ]}
          actions={[
            { label: "View All Events", href: "/events" }
          ]}
          badge={undefined}
          onClick={() => router.push("/events")}
        />
      </div>

      {/* Upcoming Events Section */}
      <Card className="animate-slideUp animation-delay-600">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-icon-pulse" />
              <h2 className="text-2xl font-bold text-foreground">Upcoming Events</h2>
            </div>
            <Link
              href="/events"
              className="text-primary hover:text-primary-hover font-medium text-sm flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {eventsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-3 text-text-muted">Loading events...</p>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex p-6 bg-secondary rounded-2xl mb-4">
                <Calendar className="w-12 h-12 text-text-muted" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming events</h3>
              <p className="text-text-muted text-sm mb-4">
                Check back later or create an event to get started!
              </p>
              {canCreateEvent && (
                <GamifiedButton
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => router.push("/events/create")}
                >
                  Create Event
                </GamifiedButton>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} clubName={clubNameMap.get(event.clubId)} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// Event Card Component for Dashboard
function EventCard({ event, clubName }: { event: EventInfo; clubName?: string }) {
  const eventDate = new Date(event.date);
  const isUpcoming = event.date > Date.now();

  return (
    <Link
      href={`/events/${event.id}`}
      prefetch={false}
      className="bg-card border border-border rounded-xl p-4 shadow-elevation-1 hover:shadow-elevation-2 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
          {clubName && (
            <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{clubName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        {isUpcoming && (
          <span className="px-2 py-0.5 text-xs font-semibold bg-success/10 text-success border border-success/20 rounded-full flex-shrink-0 ml-2">
            Upcoming
          </span>
        )}
      </div>

      <p className="text-xs text-text-muted mb-3 line-clamp-2">
        {event.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-text-secondary">
          <Users className="w-3 h-3" />
          <span>{event.participants?.length || 0}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-primary font-medium group-hover:gap-1.5 transition-all">
          <span>View</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

