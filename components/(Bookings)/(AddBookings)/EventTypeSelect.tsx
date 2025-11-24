"use client";

import React, { useCallback, useMemo, memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EventType = {
  id: number;
  name: string;
};

interface EventTypeSelectProps {
  eventTypes: EventType[];
  value: string;
  hasError?: boolean;
  onChange: (value: string, isValid: boolean) => void;
}

const EventTypeSelect = memo(({
  eventTypes,
  value,
  hasError = false,
  onChange
}: EventTypeSelectProps) => {

  // Validate the selected value
  const isValid = useMemo(() => {
    return value !== "" && value !== "0";
  }, [value]);

  // Memoize the select items to prevent re-creation
  const selectItems = useMemo(() => {
    return eventTypes.map(eventType => (
      <SelectItem value={`${eventType.id}`} key={eventType.id}>
        {eventType.name}
      </SelectItem>
    ));
  }, [eventTypes]);

  // Stable onChange handler
  const handleChange = useCallback((newValue: string) => {
    const valid = newValue !== "" && newValue !== "0";
    onChange(newValue, valid);
  }, [onChange]);

  return (
    <div className="mt-4 *:not-first:mt-2">
      <Label className="text-foreground/50 font-normal">Event type</Label>
      <Select
        value={value}
        onValueChange={handleChange}
      >
        <SelectTrigger className={hasError ? "ring-2 ring-red-500 border-red-500" : ""}>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {selectItems}
        </SelectContent>
      </Select>
    </div>
  );
});

EventTypeSelect.displayName = "EventTypeSelect";

export default EventTypeSelect;
