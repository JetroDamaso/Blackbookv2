"use client";

import { CalendarEvent } from "./types";

interface EventCalendarProps {
  events: CalendarEvent[];
  onEventAdd?: (event: Omit<CalendarEvent, "id">) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
}

export function EventCalendar({
  events,
  onEventAdd,
  onEventUpdate,
  onEventDelete,
}: EventCalendarProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Event Calendar</h2>
      <p className="text-sm text-gray-600">
        Calendar component placeholder. {events.length} events loaded.
      </p>
    </div>
  );
}
