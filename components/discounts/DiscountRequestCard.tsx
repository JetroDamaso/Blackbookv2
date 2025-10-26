/**
 * Discount Request Card
 * Card component for displaying discount request summary
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscountStatusBadge } from "./DiscountStatusBadge";
import { Button } from "@/components/ui/button";
import { Calendar, User, DollarSign } from "lucide-react";
import Link from "next/link";

interface DiscountRequestCardProps {
  id: string;
  bookingId: number;
  clientName: string;
  requesterName: string;
  discountValue: number;
  discountUnit: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";
  originalAmount: number;
  finalAmount: number | null;
  requestedAt: Date;
  justification: string;
}

export function DiscountRequestCard({
  id,
  bookingId,
  clientName,
  requesterName,
  discountValue,
  discountUnit,
  status,
  originalAmount,
  finalAmount,
  requestedAt,
  justification,
}: DiscountRequestCardProps) {
  const discountDisplay =
    discountUnit === "PERCENTAGE" ? `${discountValue}%` : `₱${discountValue.toFixed(2)}`;

  const discountAmount = finalAmount ? originalAmount - finalAmount : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Booking #{bookingId} - {clientName}
            </CardTitle>
            <CardDescription className="mt-1">
              Requested {new Date(requestedAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <DiscountStatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Requester */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Requested by {requesterName}</span>
        </div>

        {/* Discount Amount */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="text-sm font-medium">{discountDisplay} discount</div>
            <div className="text-xs text-muted-foreground">
              ₱{originalAmount.toFixed(2)} → ₱
              {(finalAmount || originalAmount - discountAmount).toFixed(2)}
              <span className="text-destructive ml-1">(-₱{discountAmount.toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* Justification */}
        <div className="text-sm">
          <span className="font-medium">Justification:</span>
          <p className="text-muted-foreground mt-1 line-clamp-2">{justification}</p>
        </div>

        {/* View Details Button */}
        <Link href={`/discount-requests/${id}`}>
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
