"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { validateReportParams } from "@/lib/reports/utils";
import type { ReportType, Report, ReportParams } from "@/lib/reports/types";
import { ReportTypeSelector } from "@/components/reports/ReportTypeSelector";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportDisplay } from "@/components/reports/ReportDisplay";
import { Loader2, FileText, BarChart3, TrendingUp } from "lucide-react";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType | "">("");
  const [filters, setFilters] = useState<any>({});
  const [shouldGenerate, setShouldGenerate] = useState(false);
  const [reportParams, setReportParams] = useState<ReportParams | null>(null);

  // Fetch data for dropdowns
  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: async () => {
      const response = await fetch("/api/pavilions");
      if (!response.ok) throw new Error("Failed to fetch venues");
      return response.json();
    },
  });

  const { data: eventTypes = [] } = useQuery({
    queryKey: ["eventTypes"],
    queryFn: async () => {
      const response = await fetch("/api/eventtypes");
      if (!response.ok) throw new Error("Failed to fetch event types");
      return response.json();
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await fetch("/api/clients");
      if (!response.ok) throw new Error("Failed to fetch clients");
      return response.json();
    },
  });

  // Generate report query
  const {
    data: report,
    isLoading: isGenerating,
    error,
  } = useQuery<Report>({
    queryKey: ["report", reportParams],
    queryFn: async () => {
      if (!reportParams) throw new Error("No report parameters");

      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportParams),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate report");
      }

      return response.json();
    },
    enabled: shouldGenerate && reportParams !== null,
  });

  const handleGenerateReport = () => {
    if (!reportType) {
      toast.error("Please select a report type");
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

    // Trigger report generation
    setReportParams(params);
    setShouldGenerate(true);
  };

  const handleReportTypeChange = (type: ReportType) => {
    setReportType(type);
    setFilters({});
    setShouldGenerate(false);
    setReportParams(null);
  };

  // Calculate quick stats from report data
  const totalBookings = report?.bookings?.length || 0;
  const totalRevenue = report?.summary?.totalRevenue || 0;
  const averageRevenue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  return (
    <>
      {/* Header Section */}
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <FileText size={18} /> <span>Reports</span>
          </p>
        </div>
      </header>

      {/* Widget Section */}
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        {/* Report Type Widget */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Report Type</p>
            <p className="text-4xl font-semibold">{reportType ? "1" : "0"}</p>
            <p className="text-xs">
              {reportType ? (
                <>
                  Selected: <span className="text-primary">{reportType.replace(/_/g, " ")}</span>
                </>
              ) : (
                "No report selected"
              )}
            </p>
          </div>
        </div>

        {/* Total Bookings Widget (shown when report is generated) */}
        {report && (
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Bookings</p>
              <p className="text-4xl font-semibold">{totalBookings}</p>
              <p className="text-xs">
                In this <span className="text-primary">report</span>
              </p>
            </div>
          </div>
        )}

        {/* Revenue Widget (shown when report has revenue data) */}
        {report && totalRevenue > 0 && (
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Revenue</p>
              <p className="text-4xl font-semibold">
                ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs">
                Average:{" "}
                <span className="text-primary">
                  ₱{averageRevenue.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Action Widgets */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => (window.location.href = "/manage/bookings")}
        >
          <BarChart3 className="size-9 text-blue-600" />
          <p className="text-sm select-none">All Bookings</p>
        </div>

        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => (window.location.href = "/dashboard")}
        >
          <TrendingUp className="size-9 text-blue-600" />
          <p className="text-sm select-none">Dashboard</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        {/* Report Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReportTypeSelector value={reportType} onChange={handleReportTypeChange} />

            <ReportFilters
              reportType={reportType}
              filters={filters}
              onFiltersChange={setFilters}
              venues={venues}
              eventTypes={eventTypes}
              clients={clients}
            />

            <Button
              onClick={handleGenerateReport}
              disabled={!reportType || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Report Results */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error: {error instanceof Error ? error.message : "Failed to generate report"}
              </p>
            </CardContent>
          </Card>
        )}

        <ReportDisplay report={report || null} isLoading={isGenerating} />
      </div>
    </>
  );
}
