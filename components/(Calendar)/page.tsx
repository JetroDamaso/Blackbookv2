"use client";
import React from "react";
import { ContinuousCalendar } from "../ContinuousCalendar";
import type { Booking } from "@/generated/prisma";
import BookingDialogComponent from "./BookingDialog";

const CalendarClient = (props: { getAllBookings: Booking[] }) => {
  const { getAllBookings } = props;
  const [bookingId, setBookingId] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <div className="w-full h-full">
      <ContinuousCalendar
        onClick={(day, month, year, bookingId) => {
          console.log(day, month, year, bookingId);
          if (bookingId != null) {
            setBookingId(bookingId);
            setDialogOpen(true);
          }
        }}
        getAllBookings={getAllBookings}
      />

      {bookingId != null && (
        <BookingDialogComponent
          bookingId={bookingId}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
};

export default CalendarClient;
