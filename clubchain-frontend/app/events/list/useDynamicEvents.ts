'use client';

import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/lib/constants';
import type { EventItem } from './types';

export function useDynamicEvents() {
  const client = useSuiClient();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Query for all shared Event objects using multiGetObjects
      // Since events are shared objects, we need to query differently
      const response = await client.queryEvents({
        query: { MoveEventType: `${PACKAGE_ID}::event::Event` },
        limit: 50,
      });

      // Alternative: Try to get objects by type
      const objectsResponse = await client.getOwnedObjects({
        owner: PACKAGE_ID,
        options: {
          showContent: true,
          showType: true,
        },
      });

      const eventObjects: EventItem[] = [];

      for (const item of objectsResponse.data) {
        if (item.data?.content?.dataType === 'moveObject') {
          const content = item.data.content as any;
          if (content.type.includes('::event::Event')) {
            const fields = content.fields;
            eventObjects.push({
              objectId: item.data.objectId,
              title: fields.title,
              description: fields.description,
              location: fields.location,
              startTime: parseInt(fields.start_time),
              endTime: parseInt(fields.end_time),
              clubId: fields.club_id,
              creator: fields.creator,
              createdAt: parseInt(fields.created_at),
            });
          }
        }
      }

      // Sort by start time (most recent first)
      eventObjects.sort((a, b) => b.startTime - a.startTime);
      setEvents(eventObjects);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching events:', err);
      // Set empty array on error so UI can still render
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
