"use client";

import { ClockIcon } from "lucide-react";
import { Label } from "react-aria-components";

import { DateInput, TimeField } from "@/components/ui/datefield-rac";

import { Time } from "@internationalized/date";

export default function TimeEndPickerCreateBookingComponent({
  endTimeOnChange,
  initialDateTime,
}: {
  endTimeOnChange?: (value: { hour: number; minute: number; second?: number } | null) => void;
  initialDateTime?: Date | string | null;
}) {
  let defaultTimeValue: Time | undefined = undefined;
  if (initialDateTime) {
    try {
      const d = typeof initialDateTime === "string" ? new Date(initialDateTime) : initialDateTime;
      if (!isNaN(d.getTime())) {
        defaultTimeValue = new Time(d.getHours(), d.getMinutes(), d.getSeconds());
      }
    } catch {
      // ignore parse errors
    }
  }
  const handleTimeChange = (value: unknown) => {
    let obj: { hour: number; minute: number; second?: number } | null = null;

    if (value && typeof value === "object" && "hour" in value && "minute" in value) {
      const v = value as { hour: number; minute: number; second?: number };
      obj = { hour: v.hour, minute: v.minute, second: v.second ?? 0 };
    } else if (typeof value === "string") {
      const m = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (m) {
        obj = {
          hour: Number(m[1]),
          minute: Number(m[2]),
          second: m[3] ? Number(m[3]) : 0,
        };
      }
    } else if (value instanceof Date) {
      obj = {
        hour: value.getHours(),
        minute: value.getMinutes(),
        second: value.getSeconds(),
      };
    }

    endTimeOnChange?.(obj);
    if (obj) console.log("Time out:", obj);
  };
  return (
    <TimeField
      className="*:not-first:mt-2"
      onChange={handleTimeChange}
      defaultValue={defaultTimeValue}
    >
      <Label className="text-foreground/50 text-sm font-normal">Time out</Label>
      <div className="relative">
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-center ps-3">
          <ClockIcon size={16} aria-hidden="true" />
        </div>
        <DateInput className="ps-9" />
      </div>
    </TimeField>
  );
}
