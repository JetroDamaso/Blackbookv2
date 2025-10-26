"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportType } from "@/lib/reports/types";

interface ReportTypeSelectorProps {
  value: ReportType | "";
  onChange: (value: ReportType) => void;
}

const reportTypes = [
  { value: "monthly", label: "Monthly Report" },
  { value: "yearly", label: "Yearly Report" },
  { value: "dateRange", label: "Date Range Report" },
  { value: "status", label: "Booking Status Report" },
  { value: "selected", label: "Selected Bookings Report" },
  { value: "venue", label: "Venue Performance Report" },
  { value: "eventType", label: "Event Type Analysis" },
  { value: "client", label: "Client Report" },
] as const;

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="report-type">Report Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="report-type">
          <SelectValue placeholder="Select report type" />
        </SelectTrigger>
        <SelectContent>
          {reportTypes.map(type => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
