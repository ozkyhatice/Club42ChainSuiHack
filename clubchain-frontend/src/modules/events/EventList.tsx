"use client";

import { memo } from "react";
import Link from "next/link";
import type { EventInfo } from "@/src/services/blockchain/getClubs";
import { Calendar, Users, ArrowRight } from "lucide-react";
import Card, { CardBody } from "@/components/ui/Card";

type Props = {
  events: EventInfo[];
};

export const EventList = memo(function EventList({ events }: Props) {
  if (!events.length) {
    return (
      <Card className="border-border">
        <CardBody className="text-center py-12">
          <div className="inline-flex p-4 bg-secondary/50 rounded-full mb-4">
            <Calendar className="w-12 h-12 text-text-muted" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No Events Yet
          </h3>
          <p className="text-text-muted">
            This club doesn't have any events yet.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="block"
        >
          <Card className="hover-lift card-interactive border-border">
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                      {new Date(Number(event.date)).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm text-text-muted mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Users className="w-3.5 h-3.5" />
                      <span>{event.participants?.length || 0} participants</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </CardBody>
          </Card>
        </Link>
      ))}
    </div>
  );
});

