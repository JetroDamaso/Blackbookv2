"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React from "react";
import { Label } from "@/components/ui/label";

export function StartDatePickerForm({
  startDateOnChange,
  initialDate,
  disabledDates,
}: {
  startDateOnChange?: (value: Date | null) => void;
  initialDate?: Date | string | null;
  disabledDates?: Set<string>;
}) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(() => {
    if (!initialDate) return undefined;
    try {
      const d =
        typeof initialDate === "string" ? new Date(initialDate) : initialDate;
      return isNaN(d.getTime()) ? undefined : d;
    } catch {
      return undefined;
    }
  });

  const handleSelect = (date?: Date) => {
    setStartDate(date);
    startDateOnChange?.(date ?? null);
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <Label className="text-foreground/50 text-sm font-normal mb-2">
          Start date
        </Label>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !startDate && "text-muted-foreground"
            )}
          >
            {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (date < today) return true;
              const key = date.toISOString().slice(0, 10);
              return disabledDates?.has(key) ?? false;
            }}
            captionLayout="dropdown"
            fromYear={new Date().getFullYear()}
            toYear={new Date().getFullYear() + 15}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
