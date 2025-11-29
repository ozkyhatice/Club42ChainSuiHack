'use client';

import { memo } from 'react';
import type { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
}

const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startTime || 0);
  const endDate = new Date(event.endTime || 0);
  const now = Date.now();
  
  const isUpcoming = (event.startTime || 0) > now;
  const isOngoing = (event.startTime || 0) <= now && (event.endTime || 0) > now;
  const isPast = (event.endTime || 0) < now;

  const getStatusBadge = () => {
    if (isOngoing) {
      return <span className="px-2 py-1 bg-success/15 text-success border border-success/20 text-xs rounded-full font-medium">🔴 Live Now</span>;
    }
    if (isUpcoming) {
      return <span className="px-2 py-1 bg-primary/15 text-primary border border-primary/20 text-xs rounded-full font-medium">📅 Upcoming</span>;
    }
    return <span className="px-2 py-1 bg-secondary text-gray-400 border border-secondary text-xs rounded-full font-medium">Past</span>;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-card border border-secondary rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${
      isOngoing ? 'border-l-success' : isUpcoming ? 'border-l-primary' : 'border-l-secondary'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-foreground flex-1">{event.title}</h3>
        {getStatusBadge()}
      </div>

      <p className="text-gray-400 mb-4 line-clamp-2">{event.description}</p>

      <div className="space-y-2 text-sm">
        {event.location && (
          <div className="flex items-center text-gray-300">
            <span className="mr-2">📍</span>
            <span className="font-medium">{event.location}</span>
          </div>
        )}

        <div className="flex items-center text-gray-300">
          <span className="mr-2">📅</span>
          <span>{formatDate(startDate)}</span>
        </div>

        <div className="flex items-center text-gray-300">
          <span className="mr-2">⏰</span>
          <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>

        {event.creator && (
          <div className="flex items-center text-gray-400">
            <span className="mr-2">👤</span>
            <span className="text-xs font-mono">{event.creator.slice(0, 12)}...</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-secondary flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Club: {event.clubId.slice(0, 8)}...
        </span>
        <a
          href={`https://suiscan.xyz/devnet/object/${event.objectId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover underline text-sm font-medium"
        >
          View on Explorer →
        </a>
      </div>
    </div>
  );
});

export default EventCard;

