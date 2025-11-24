"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import type { ReportType, Report, ReportParams } from "@/lib/reports/types";
import { ReportDisplay } from "@/components/reports/ReportDisplay";
import { ReportConfigDialog } from "@/components/reports/ReportConfigDialog";
import { FileText, BarChart3, TrendingUp } from "lucide-react";
import { columns, SavedReport } from "./columns";
import { DataTable } from "./data-table";

export default function ReportsPage() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

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

  // Fetch saved reports
  const { data: savedReports = [] } = useQuery({
    queryKey: ["savedReports"],
    queryFn: async () => {
      const response = await fetch("/api/reports/saved");
      if (!response.ok) throw new Error("Failed to fetch saved reports");
      return response.json();
    },
  });

  const handleGenerateReport = async (params: ReportParams, name: string) => {
    setIsGenerating(true);
    try {
      // Generate the report
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate report");
      }

      const reportData = await response.json();

      // Save the generated report
      const saveResponse = await fetch("/api/reports/saved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          reportType: params.reportType,
          parameters: params,
          reportData,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save report");
      }

      const savedReport = await saveResponse.json();

      // Refresh the saved reports list
      queryClient.invalidateQueries({ queryKey: ["savedReports"] });

      // Set the newly generated report as selected
      setSelectedReport(savedReport);
      setIsConfigDialogOpen(false);
      toast.success("Report generated and saved successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewReport = (report: SavedReport) => {
    setSelectedReport(report);
  };

  const handleDeleteReports = async (reportIds: string[]) => {
    try {
      await Promise.all(
        reportIds.map(id =>
          fetch(`/api/reports/saved?id=${id}`, {
            method: "DELETE",
          })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["savedReports"] });
      toast.success(`Deleted ${reportIds.length} report${reportIds.length > 1 ? "s" : ""}`);

      // Clear selection if deleted report was selected
      if (selectedReport && reportIds.includes(selectedReport.id)) {
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error("Failed to delete reports");
    }
  };

  // Parse the selected report data
  const displayReport = selectedReport
    ? typeof selectedReport.reportData === "string"
      ? JSON.parse(selectedReport.reportData)
      : selectedReport.reportData
    : null;

  // Calculate quick stats
  const totalReports = savedReports.length;
  const totalBookings = displayReport?.bookings?.length || 0;
  const totalRevenue = displayReport?.summary?.totalRevenue || 0;
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
        {/* Total Reports Widget */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Saved Reports</p>
            <p className="text-4xl font-semibold">{totalReports}</p>
            <p className="text-xs">
              {totalReports > 0 ? (
                <>
                  <span className="text-primary">Available</span> to view
                </>
              ) : (
                "No reports saved"
              )}
            </p>
          </div>
        </div>

        {/* Total Bookings Widget (shown when report is selected) */}
        {displayReport && (
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
        {displayReport && totalRevenue > 0 && (
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Bookings Value</p>
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
        <DataTable
          columns={columns}
          data={savedReports}
          onRowClick={handleViewReport}
          onDeleteSelected={handleDeleteReports}
          onNewReport={() => setIsConfigDialogOpen(true)}
        />

        {/* Report Display */}
        {selectedReport && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedReport.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ReportDisplay report={displayReport} isLoading={false} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Report Configuration Dialog */}
      <ReportConfigDialog
        open={isConfigDialogOpen}
        onOpenChange={setIsConfigDialogOpen}
        onGenerateReport={handleGenerateReport}
        isGenerating={isGenerating}
        venues={venues}
        eventTypes={eventTypes}
        clients={clients}
      />
    </>
  );
}
