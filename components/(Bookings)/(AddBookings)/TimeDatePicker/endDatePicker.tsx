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
}: {
  endDateOnChange?: (value: Date | null) => void;
}) {
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);

  const handleSelect = (date?: Date) => {
    setEndDate(date);
    endDateOnChange?.(date ?? null);
  };
  return (
    <div className="w-full">
      <Label className="text-foreground text-sm font-normal mb-1">
        End date
      </Label>
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
            disabled={(date) => date < new Date(Date.now())}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
