"use client";

import { memo } from "react";
import Link from "next/link";
import type { EventInfo } from "@/src/services/blockchain/getClubs";

type Props = {
  events: EventInfo[];
};

export const EventList = memo(function EventList({ events }: Props) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white/80 p-8 text-center text-blue-700">
        Bu kulüp için henüz etkinlik bulunmuyor.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="rounded-2xl border border-blue-100 bg-white/80 p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition cursor-pointer block"
        >
          <p className="text-xs uppercase tracking-wide text-blue-400">
            {new Date(Number(event.date)).toLocaleString()}
          </p>
          <h3 className="text-lg font-semibold text-blue-900">
            {event.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{event.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>👥 {event.participants?.length || 0} participants</span>
          </div>
        </Link>
      ))}
    </div>
  );
});

