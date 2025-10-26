"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingSelectorProps {
  selectedBookingIds: string[];
  onSelectionChange: (ids: string[]) => void;
}

interface Booking {
  id: number;
  eventName: string;
  startAt: Date | null;
  status: number;
  client: {
    firstName: string;
    lastName: string;
  } | null;
  pavilion: {
    name: string;
  } | null;
}

const statusMap: Record<number, string> = {
  0: "Pending",
  1: "Confirmed",
  2: "Completed",
  3: "Cancelled",
};

export function BookingSelector({ selectedBookingIds, onSelectionChange }: BookingSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all bookings
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ["bookings-for-report"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/all");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
  });

  const filteredBookings = bookings?.filter(booking => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const clientName = booking.client
      ? `${booking.client.firstName} ${booking.client.lastName}`.toLowerCase()
      : "";
    const eventName = booking.eventName.toLowerCase();
    const bookingId = booking.id.toString();
    return (
      clientName.includes(searchLower) ||
      eventName.includes(searchLower) ||
      bookingId.includes(searchLower)
    );
  });

  const toggleBooking = (id: string) => {
    if (selectedBookingIds.includes(id)) {
      onSelectionChange(selectedBookingIds.filter(bookingId => bookingId !== id));
    } else {
      onSelectionChange([...selectedBookingIds, id]);
    }
  };

  const toggleAll = () => {
    if (selectedBookingIds.length === filteredBookings?.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredBookings?.map(b => b.id.toString()) || []);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label>Select Bookings</Label>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Select Bookings</Label>
      <Input
        placeholder="Search by booking ID, client name, or event name..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <div className="border rounded-md max-h-96 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    filteredBookings &&
                    filteredBookings.length > 0 &&
                    selectedBookingIds.length === filteredBookings.length
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBookingIds.includes(booking.id.toString())}
                      onCheckedChange={() => toggleBooking(booking.id.toString())}
                    />
                  </TableCell>
                  <TableCell>{booking.id}</TableCell>
                  <TableCell>{booking.eventName}</TableCell>
                  <TableCell>
                    {booking.client
                      ? `${booking.client.firstName} ${booking.client.lastName}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {booking.startAt ? format(new Date(booking.startAt), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>{booking.pavilion?.name || "N/A"}</TableCell>
                  <TableCell>{statusMap[booking.status] || "Unknown"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground">
        {selectedBookingIds.length} booking(s) selected
      </p>
    </div>
  );
}
