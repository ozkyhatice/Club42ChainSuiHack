"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Calendar, Sparkles, CheckCircle, Clock, Plus, Search, MapPin, Users, ArrowRight } from "lucide-react";
import { useCanCreateEvent } from "@/hooks/useBadgeAuth";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/src/services/blockchain/getEvents";
import { getClubs } from "@/src/services/blockchain/getClubs";
import type { EventInfo } from "@/src/services/blockchain/getEvents";
import { useParticipationBadges } from "@/hooks/useParticipationBadges";
import { useUserOwnedClubs } from "@/hooks/useClubOwnership";

type TabType = "registered" | "created" | "past";

export default function MyEventsPage() {
  const canCreateEvent = useCanCreateEvent();
  const account = useCurrentAccount();
  const [activeTab, setActiveTab] = useState<TabType>("registered");
  
  // Fetch all events
  const { data: allEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["all-events"],
    queryFn: getEvents,
    staleTime: 60000,
  });
  
  // Fetch clubs for name lookup
  const { data: clubs = [] } = useQuery({
    queryKey: ["clubs-for-events"],
    queryFn: getClubs,
    staleTime: 60000,
  });
  
  // Get user's participation badges (events they joined)
  const { data: participationBadges = [] } = useParticipationBadges();
  
  // Get user's owned clubs (to find events they created)
  const { data: ownedClubs = [] } = useUserOwnedClubs();
  
  // Create a map of club IDs to club names
  const clubNameMap = new Map(clubs.map(club => [club.id, club.name]));
  
  // Normalize ID helper
  const normalizeId = (id: string) => {
    if (!id) return "";
    const cleaned = id.startsWith("0x") ? id.slice(2) : id;
    return cleaned.toLowerCase();
  };
  
  // Get owned club IDs (normalized)
  const ownedClubIds = new Set(ownedClubs.map(club => normalizeId(club.id)));
  
  // Get participation event IDs
  const participationEventIds = new Set(
    participationBadges.map(badge => normalizeId(badge.eventId || ""))
  );
  
  const now = Date.now();
  
  // Filter events based on user's relationship
  const registeredEvents = allEvents.filter(event => {
    const normalizedEventId = normalizeId(event.id);
    return participationEventIds.has(normalizedEventId);
  });
  
  const createdEvents = allEvents.filter(event => {
    const normalizedClubId = normalizeId(event.clubId);
    return ownedClubIds.has(normalizedClubId);
  });
  
  const pastEvents = registeredEvents.filter(event => event.date <= now);
  const upcomingEvents = registeredEvents.filter(event => event.date > now);
  
  // Get events for current tab
  const getTabEvents = (): EventInfo[] => {
    switch (activeTab) {
      case "registered":
        return registeredEvents.sort((a, b) => b.date - a.date);
      case "created":
        return createdEvents.sort((a, b) => b.date - a.date);
      case "past":
        return pastEvents.sort((a, b) => b.date - a.date);
      default:
        return [];
    }
  };
  
  const tabEvents = getTabEvents();
  const isLoading = eventsLoading;
  
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Events</h1>
            <p className="text-gray-400">Events you've created or joined</p>
          </div>
          {canCreateEvent && (
            <Link href="/events/create">
              <Button variant="primary" className="gap-2">
                <Plus className="w-4 h-4" />
                Create Event
              </Button>
            </Link>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 border-b border-secondary">
          <button 
            onClick={() => setActiveTab("registered")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "registered"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-foreground"
            }`}
          >
            Registered ({registeredEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab("created")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "created"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-foreground"
            }`}
          >
            Created ({createdEvents.length})
          </button>
          <button 
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "past"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-400 hover:text-foreground"
            }`}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>
        
        {/* Events list */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="col-span-full hover-lift">
              <CardBody className="text-center py-12">
                <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                <p className="text-gray-400">Loading events...</p>
              </CardBody>
            </Card>
          ) : tabEvents.length === 0 ? (
            <Card className="col-span-full hover-lift">
              <CardBody className="text-center py-12">
                <div className="inline-flex p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl mb-4 border border-primary/20">
                  <Calendar className="w-16 h-16 text-primary animate-icon-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No events yet</h3>
                <p className="text-gray-400 mb-6">
                  {activeTab === "registered" && "Register for events to see them here"}
                  {activeTab === "created" && "Create events to see them here"}
                  {activeTab === "past" && "No past events yet"}
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/events">
                    <Button variant="outline" className="gap-2">
                      <Search className="w-4 h-4" />
                      Browse Events
                    </Button>
                  </Link>
                  {canCreateEvent && (
                    <Link href="/events/create">
                      <Button variant="primary" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Event
                      </Button>
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          ) : (
            tabEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                clubName={clubNameMap.get(event.clubId)}
              />
            ))
          )}
        </div>
        
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mt-8">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-[#f5f3f8] rounded-lg mb-2">
                <Calendar className="w-8 h-8 text-[#6b5b95]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{registeredEvents.length}</p>
              <p className="text-sm text-gray-400">Registered</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-[#f5f3f8] rounded-lg mb-2">
                <Sparkles className="w-8 h-8 text-[#6b5b95]" />
              </div>
              <p className="text-2xl font-bold text-foreground">{createdEvents.length}</p>
              <p className="text-sm text-gray-400">Created</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-green-50 rounded-lg mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{pastEvents.length}</p>
              <p className="text-sm text-gray-400">Attended</p>
            </CardBody>
          </Card>
          
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="inline-flex p-3 bg-orange-50 rounded-lg mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
              <p className="text-sm text-gray-400">Upcoming</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Event Card Component
function EventCard({ event, clubName }: { event: EventInfo; clubName?: string }) {
  const eventDate = new Date(event.date);
  const isUpcoming = event.date > Date.now();
  
  return (
    <Link href={`/events/${event.id}`} prefetch={false}>
      <Card className="hover-lift cursor-pointer transition-all">
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-lg flex flex-col items-center justify-center text-white">
              <div className="text-2xl font-bold">{eventDate.getDate()}</div>
              <div className="text-xs uppercase">{eventDate.toLocaleDateString("en-US", { month: "short" })}</div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">{event.title}</h3>
              <p className="text-sm text-text-muted mb-3 line-clamp-2">{event.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                {clubName && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{clubName}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{event.participants?.length || 0} participants</span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 flex items-center gap-2">
              {isUpcoming && (
                <span className="px-2 py-1 text-xs font-semibold bg-success/10 text-success border border-success/20 rounded-full">
                  Upcoming
                </span>
              )}
              <div className="flex items-center gap-1 text-primary font-medium text-sm">
                <span>View</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

