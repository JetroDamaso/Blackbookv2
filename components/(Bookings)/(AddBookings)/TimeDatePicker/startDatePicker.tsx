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
}: {
  startDateOnChange?: (value: Date | null) => void;
}) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);

  const handleSelect = (date?: Date) => {
    setStartDate(date);
    startDateOnChange?.(date ?? null);
  };

  return (
    <div className="w-full">
      <Label className="text-foreground text-sm font-normal mb-1">
        Start date
      </Label>
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
            disabled={(date) => date < new Date(Date.now())}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
