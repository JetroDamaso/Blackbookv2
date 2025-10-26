"use client";

import { Button } from "@/components/ui/button";
import { Printer, FileDown, FileSpreadsheet } from "lucide-react";
import { printReport, exportToCSV, exportToExcel } from "@/lib/reports/export";
import type { Report } from "@/lib/reports/types";
import { generateReportTitle } from "@/lib/reports/utils";
import { format } from "date-fns";

interface ExportButtonsProps {
  report: Report;
}

export function ExportButtons({ report }: ExportButtonsProps) {
  const handlePrint = () => {
    printReport();
  };

  const handleCSV = () => {
    const filename = `${report.metadata.reportType}-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    exportToCSV(report, filename);
  };

  const handleExcel = () => {
    const filename = `${report.metadata.reportType}-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    exportToExcel(report, filename);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handlePrint} variant="outline" size="sm">
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button onClick={handleCSV} variant="outline" size="sm">
        <FileDown className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button onClick={handleExcel} variant="outline" size="sm">
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}
