"use client";

import { ClockIcon } from "lucide-react";
import { Label } from "react-aria-components";

import { DateInput, TimeField } from "@/components/ui/datefield-rac";

export default function TimeStartPickerComponent() {
  return (
    <TimeField className="*:not-first:mt-2">
      <Label className="text-foreground text-sm font-medium">Check-in</Label>
      <div className="relative">
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 z-10 flex items-center justify-center ps-3">
          <ClockIcon size={16} aria-hidden="true" />
        </div>
        <DateInput className="ps-9" />
      </div>
    </TimeField>
  );
}
