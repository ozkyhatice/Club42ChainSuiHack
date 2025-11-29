'use client';

import type { EventItem } from './types';

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const now = Date.now();
  
  const isUpcoming = event.startTime > now;
  const isOngoing = event.startTime <= now && event.endTime > now;
  const isPast = event.endTime < now;

  const getStatusBadge = () => {
    if (isOngoing) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">🔴 Live Now</span>;
    }
    if (isUpcoming) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">📅 Upcoming</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">Past</span>;
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
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all hover:shadow-lg ${
      isOngoing ? 'border-green-500' : isUpcoming ? 'border-blue-500' : 'border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-900 flex-1">{event.title}</h3>
        {getStatusBadge()}
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-700">
          <span className="mr-2">📍</span>
          <span className="font-medium">{event.location}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <span className="mr-2">📅</span>
          <span>{formatDate(startDate)}</span>
        </div>

        <div className="flex items-center text-gray-700">
          <span className="mr-2">⏰</span>
          <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
        </div>

        <div className="flex items-center text-gray-500">
          <span className="mr-2">👤</span>
          <span className="text-xs font-mono">{event.creator.slice(0, 12)}...</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Club: {event.clubId.slice(0, 8)}...
        </span>
        <a
          href={`https://suiscan.xyz/devnet/object/${event.objectId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          View on Explorer →
        </a>
      </div>
    </div>
  );
}

