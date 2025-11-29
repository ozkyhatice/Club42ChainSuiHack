'use client';

import EventCard from './EventCard';
import type { EventItem } from '../types';

interface EventsListProps {
  events: EventItem[];
  isLoading: boolean;
  error: Error | null;
  onRefresh: () => void;
}

export default function EventsList({ events, isLoading, error, onRefresh }: EventsListProps) {
  const now = Date.now();
  const upcomingEvents = events.filter(e => (e.startTime || 0) > now);
  const ongoingEvents = events.filter(e => (e.startTime || 0) <= now && (e.endTime || 0) > now);
  const pastEvents = events.filter(e => (e.endTime || 0) < now);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events from blockchain...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6 text-center border border-red-200">
        <p className="text-red-800 font-medium mb-2">Error loading events</p>
        <p className="text-red-600 text-sm mb-4">{error.message}</p>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:underline font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">No Events Yet</h2>
        <p className="text-gray-600 mb-8">
          Be the first to create an event on the blockchain!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {ongoingEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🔴</span> Live Now ({ongoingEvents.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {ongoingEvents.map((event) => (
              <EventCard key={event.objectId} event={event} />
            ))}
          </div>
        </section>
      )}

      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">📅</span> Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event.objectId} event={event} />
            ))}
          </div>
        </section>
      )}

      {pastEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-500 flex items-center">
            <span className="mr-2">📜</span> Past Events ({pastEvents.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-6 opacity-75">
            {pastEvents.map((event) => (
              <EventCard key={event.objectId} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

