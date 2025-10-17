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

export function EndDatePickerForm({
  endDateOnChange,
  initialDate,
  disabledDates,
  minDate,
}: {
  endDateOnChange?: (value: Date | null) => void;
  initialDate?: Date | string | null;
  disabledDates?: Set<string>;
  minDate?: Date | null;
}) {
  const [endDate, setEndDate] = React.useState<Date | undefined>(() => {
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
    setEndDate(date);
    endDateOnChange?.(date ?? null);
  };
  return (
    <div className="w-full">
      <div className="mb-2">
        <Label className="text-foreground/50 text-sm font-normal mb-2">
          End date
        </Label>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !endDate && "text-muted-foreground"
            )}
          >
            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={handleSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (date < today) return true;
              if (minDate) {
                const min = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
                if (date < min) return true;
              }
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
