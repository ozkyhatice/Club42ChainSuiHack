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
  Users,
  Trophy,
  Medal,
  Award,
  Coins,
  TrendingUp,
  Crown
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
  
  // Sort events by date (upcoming first) and get upcoming events
  const now = Date.now();
  const sortedEvents = [...allEvents].sort((a, b) => a.date - b.date);
  const realUpcomingEvents = sortedEvents.filter((e) => e.date > now).slice(0, 6);
  
  // Mock events data for display
  const mockEvents: EventInfo[] = [
    {
      id: "mock-event-1",
      clubId: "mock-club-4",
      createdBy: "0x4444...4444",
      title: "Music Event",
      description: "Join us for an amazing music performance",
      date: Date.now() + 2 * 86400000, // 2 days from now
      participants: [],
    },
    {
      id: "mock-event-2",
      clubId: "mock-club-4",
      createdBy: "0x4444...4444",
      title: "Music Event",
      description: "Join us for an amazing music performance",
      date: Date.now() + 3 * 86400000, // 3 days from now
      participants: [],
    },
    {
      id: "mock-event-3",
      clubId: "mock-club-1",
      createdBy: "0x1111...1111",
      title: "Tech Workshop",
      description: "Learn the latest in technology",
      date: Date.now() + 5 * 86400000, // 5 days from now
      participants: [],
    },
    {
      id: "mock-event-4",
      clubId: "mock-club-2",
      createdBy: "0x2222...2222",
      title: "Art Exhibition",
      description: "Showcase of student artwork",
      date: Date.now() + 7 * 86400000, // 7 days from now
      participants: [],
    },
  ];
  
  // Use mock events if no real events, otherwise use real events
  const upcomingEvents = realUpcomingEvents.length > 0 ? realUpcomingEvents : mockEvents.slice(0, 6);
  
  // Calculate stats
  const totalEvents = allClubs.reduce((sum, club) => sum + club.events.length, 0);
  
  // Mock clubs data for ranking display
  const mockClubs = [
    {
      id: "mock-club-1",
      owner: "0x1111...1111",
      name: "Tech Innovation Club",
      description: "Leading technology and innovation discussions on campus",
      events: Array(12).fill(null).map((_, i) => ({
        id: `mock-event-${i}`,
        clubId: "mock-club-1",
        createdBy: "0x1111...1111",
        title: `Tech Event ${i + 1}`,
        description: "Technology event",
        date: Date.now() + i * 86400000,
        participants: [],
      })),
      balance: 0,
    },
    {
      id: "mock-club-2",
      owner: "0x2222...2222",
      name: "Art & Design Society",
      description: "Creative community for artists and designers",
      events: Array(9).fill(null).map((_, i) => ({
        id: `mock-event-${i}`,
        clubId: "mock-club-2",
        createdBy: "0x2222...2222",
        title: `Art Event ${i + 1}`,
        description: "Art event",
        date: Date.now() + i * 86400000,
        participants: [],
      })),
      balance: 0,
    },
    {
      id: "mock-club-3",
      owner: "0x3333...3333",
      name: "Sports & Fitness Club",
      description: "Promoting active lifestyle and sports activities",
      events: Array(7).fill(null).map((_, i) => ({
        id: `mock-event-${i}`,
        clubId: "mock-club-3",
        createdBy: "0x3333...3333",
        title: `Sports Event ${i + 1}`,
        description: "Sports event",
        date: Date.now() + i * 86400000,
        participants: [],
      })),
      balance: 0,
    },
    {
      id: "mock-club-4",
      owner: "0x4444...4444",
      name: "Music",
      description: "Music Club",
      events: Array(5).fill(null).map((_, i) => ({
        id: `mock-event-${i}`,
        clubId: "mock-club-4",
        createdBy: "0x4444...4444",
        title: `Music Event ${i + 1}`,
        description: "Music event",
        date: Date.now() + i * 86400000,
        participants: [],
      })),
      balance: 0,
    },
    {
      id: "mock-club-5",
      owner: "0x5555...5555",
      name: "Entrepreneurship Hub",
      description: "Building the next generation of entrepreneurs",
      events: Array(4).fill(null).map((_, i) => ({
        id: `mock-event-${i}`,
        clubId: "mock-club-5",
        createdBy: "0x5555...5555",
        title: `Business Event ${i + 1}`,
        description: "Business event",
        date: Date.now() + i * 86400000,
        participants: [],
      })),
      balance: 0,
    },
  ];
  
  // Get top 3 clubs by event count, only use real data for sorting
  // Don't sort with mock data - only show mock data in loading state
  const topClubsByEvents = allClubs.length > 0
    ? [...allClubs]
        .sort((a, b) => b.events.length - a.events.length)
        .slice(0, 3)
    : [];
  
  // Create a combined club name map including mock clubs
  const allClubsWithMock = [...allClubs, ...mockClubs];
  const clubNameMap = new Map(allClubsWithMock.map(club => [club.id, club.name]));
  
  // Mock data for top donors (will be replaced with real data later)
  const topDonors = [
    { address: "0x1234...5678", username: "alice_42", totalDonated: 125.5, rank: 1 },
    { address: "0x2345...6789", username: "bob_42", totalDonated: 98.3, rank: 2 },
    { address: "0x3456...7890", username: "charlie_42", totalDonated: 76.2, rank: 3 },
    { address: "0x4567...8901", username: "diana_42", totalDonated: 54.8, rank: 4 },
    { address: "0x5678...9012", username: "eve_42", totalDonated: 43.1, rank: 5 },
  ];
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-text-muted font-bold">{rank}</span>;
    }
  };
  
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/30";
      default:
        return "bg-secondary/50 border-border";
    }
  };
  
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
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} clubName={clubNameMap.get(event.clubId) || "Music Club"} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Leaderboards Section */}
      <div className="grid lg:grid-cols-2 gap-6 animate-slideUp animation-delay-700">
        {/* Top Clubs by Events */}
        <Card className="hover-lift">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Top Active Clubs</h2>
                <p className="text-sm text-text-muted">Most events created</p>
              </div>
            </div>

            <div className="space-y-3">
              {[...mockClubs]
                .sort((a, b) => b.events.length - a.events.length)
                .slice(0, 3)
                .map((club, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={club.id}
                      className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${getRankBadgeColor(rank)}`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      <div className="flex-shrink-0 relative">
                        {getRankIcon(rank)}
                        {rank === 1 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-foreground truncate">{club.name}</h3>
                          {rank === 1 && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-bounce" />}
                        </div>
                        <p className="text-xs text-text-muted line-clamp-1">{club.description}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="flex items-center gap-1 text-primary font-bold">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-lg">{club.events.length}</span>
                        </div>
                        <p className="text-xs text-text-muted">events</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardBody>
        </Card>

        {/* Top Donors */}
        <Card className="hover-lift">
          <CardBody className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Coins className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Top Donors</h2>
                <p className="text-sm text-text-muted">Most generous supporters</p>
              </div>
            </div>

            <div className="space-y-3">
              {topDonors.map((donor, index) => (
                <div
                  key={donor.address}
                  className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg ${getRankBadgeColor(donor.rank)}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <div className="flex-shrink-0 relative">
                    {getRankIcon(donor.rank)}
                    {donor.rank === 1 && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">{donor.username}</h3>
                      {donor.rank === 1 && <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-bounce" />}
                    </div>
                    <p className="text-xs text-text-muted font-mono truncate">{donor.address}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-accent font-bold">
                      <Coins className="w-4 h-4 group-hover:animate-bounce transition-transform" />
                      <span className="text-lg">{donor.totalDonated.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-text-muted">SUI</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
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

