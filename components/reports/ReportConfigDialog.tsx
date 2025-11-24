"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { validateReportParams } from "@/lib/reports/utils";
import type { ReportType, ReportParams } from "@/lib/reports/types";
import { ReportTypeSelector } from "@/components/reports/ReportTypeSelector";
import { ReportFilters } from "@/components/reports/ReportFilters";

interface ReportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: (params: ReportParams, name: string) => void;
  isGenerating: boolean;
  venues: any[];
  eventTypes: any[];
  clients: any[];
}

export function ReportConfigDialog({
  open,
  onOpenChange,
  onGenerateReport,
  isGenerating,
  venues,
  eventTypes,
  clients,
}: ReportConfigDialogProps) {
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [filters, setFilters] = useState<any>({});
  const [reportName, setReportName] = useState("");

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    setFilters({});
  };

  const handleGenerate = () => {
    // Validate report type
    if (!reportType) {
      toast.error("Please select a report type");
      return;
    }

    // Validate report name
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    if (reportName.trim().length < 3) {
      toast.error("Report name must be at least 3 characters");
      return;
    }

    if (reportName.trim().length > 100) {
      toast.error("Report name must not exceed 100 characters");
      return;
    }

    // Build report parameters
    const params: ReportParams = {
      reportType,
      ...filters,
    };

    // Validate parameters
    const validation = validateReportParams(params);
    if (!validation.valid) {
      toast.error(validation.error || "Validation failed");
      return;
    }

    onGenerateReport(params, reportName.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="e.g., Monthly Revenue Report - January 2025"
              value={reportName}
              onChange={e => setReportName(e.target.value)}
            />
          </div>

          {/* Report Type */}
          <ReportTypeSelector value={reportType} onChange={handleReportTypeChange} />

          {/* Filters */}
          <ReportFilters
            reportType={reportType}
            filters={filters}
            onFiltersChange={setFilters}
            venues={venues}
            eventTypes={eventTypes}
            clients={clients}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
              Cancel
            </button>
          </DialogClose>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate & Save Report"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
