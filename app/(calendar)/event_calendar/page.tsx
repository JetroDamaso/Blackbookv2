import React from "react";
import CalendarClient from "../../../components/(Calendar)/page";
import { getAllBookings } from "@/server/Booking/pullActions";

const CalendarPage = async () => {
  const allBookings = await getAllBookings();
  return <CalendarClient getAllBookings={allBookings} />;
};

export default CalendarPage;
