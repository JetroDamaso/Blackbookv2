import React from "react";
import CalendarClient from "../../../components/(Calendar)/page";
import { getAllBookings } from "@/server/Booking/pullActions";

const CalendarPage = async () => {
  const allBookings = await getAllBookings();
  return (
    <div className="w-full h-full">
      <CalendarClient getAllBookings={allBookings} />
    </div>
  );
};

export default CalendarPage;
