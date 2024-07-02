import type { FC } from 'react';

import { GOOD_API_URL } from '@good/data/constants';
import { AUTH, PAGEVIEW } from '@good/data/tracking';
import formatRelativeOrAbsolute from '@good/helpers/datetime/formatRelativeOrAbsolute';
import { Card, CardHeader } from '@good/ui';
import cn from '@good/ui/cn';
import axios from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Event {
  actor: string;
  created: Date;
  date: Date;
  ip: string;
  name: string;
  url: string;
}

const Events: FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get<{ result: Event[]; success: boolean }>(
        `${GOOD_API_URL}/leafwatch/stream`
      );
      if (response.data.success) {
        setEvents(response.data.result);
      } else {
        console.error('Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchEvents, 800);
    fetchEvents();
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader title="Realtime Events" />
      <div>
        {events.length === 0 ? (
          <div className="p-5 italic">Waiting for events...</div>
        ) : (
          <ul className="divide-y">
            {events.map((event, index: any) => (
              <li
                className={cn(
                  'space-y-1 px-5 py-2',
                  event.name == AUTH.SIGNUP && 'bg-green-100'
                )}
                key={index}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="font-semibold">{event.name}</div>
                    {event.actor ? (
                      <>
                        <span>·</span>
                        <div className="ld-text-gray-500 font-mono text-xs">
                          {event.actor}
                        </div>
                      </>
                    ) : null}
                    {event.ip ? (
                      <>
                        <span>·</span>
                        <div className="ld-text-gray-500 font-mono text-xs">
                          {event.ip}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="ld-text-gray-500 text-xs">
                    {formatRelativeOrAbsolute(event.created)}
                  </div>
                </div>
                {event.name == PAGEVIEW && (
                  <div className="ld-text-gray-500 linkify truncate text-sm">
                    <Link href={event.url} target="_blank">
                      {event.url.replace(
                        'https://bcharity.net//',
                        'https://bcharity.net/'
                      )}
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default Events;
