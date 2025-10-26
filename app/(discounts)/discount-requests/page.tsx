/**
 * Discount Requests Page
 * List of all discount requests (filtered by role)
 */

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DiscountRequestCard } from "@/components/discounts/DiscountRequestCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageContent } from "@/components/layout/PageContent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Receipt } from "lucide-react";

interface DiscountRequest {
  id: string;
  bookingId: number;
  discountValue: number;
  discountUnit: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";
  originalAmount: number;
  finalAmount: number | null;
  justification: string;
  requestedAt: string;
  requestedBy: {
    firstName: string;
    lastName: string;
  };
  booking: {
    client: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function DiscountRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<DiscountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/discount-requests?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data.discountRequests);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Error fetching discount requests:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader icon={Receipt} title="Discount Requests" />
      <PageContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="MODIFIED">Modified</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchRequests}>
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty State */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {statusFilter === "all"
                ? "No discount requests yet"
                : `No ${statusFilter.toLowerCase()} discount requests`}
            </p>
          </div>
        )}

        {/* Requests Grid */}
        {!loading && requests.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {requests.map(request => (
              <DiscountRequestCard
                key={request.id}
                id={request.id}
                bookingId={request.bookingId}
                clientName={`${request.booking.client.firstName} ${request.booking.client.lastName}`}
                requesterName={`${request.requestedBy.firstName} ${request.requestedBy.lastName}`}
                discountValue={request.discountValue}
                discountUnit={request.discountUnit}
                status={request.status}
                originalAmount={request.originalAmount}
                finalAmount={request.finalAmount}
                requestedAt={new Date(request.requestedAt)}
                justification={request.justification}
              />
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
