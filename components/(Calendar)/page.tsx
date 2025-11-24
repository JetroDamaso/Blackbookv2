"use client";
import type { Booking } from "@/generated/prisma";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { getAllBookings } from "@/server/Booking/pullActions";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ContinuousCalendar } from "../ContinuousCalendar";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import BookingDialogComponent from "./BookingDialog";
import NoDateSelectedAlert from "./NoDateSelectedAlert";
import NoPavilionSelectedAlert from "./NoPavilionSelectedAlert";

const CalendarClient = () => {
  const router = useRouter();
  const [bookingId, setBookingId] = React.useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Fetch bookings with real-time polling (every 10 seconds)
  const { data: allBookings = [], isLoading: bookingsLoading, isFetching: bookingsFetching } = useQuery({
    queryKey: ["calendar-bookings"],
    queryFn: () => getAllBookings(),
    refetchInterval: 10000, // Refresh every 10 seconds
    refetchOnWindowFocus: true, // Refresh when user focuses the window
  });

  // Fetch pavilions for color mapping
  const { data: pavilions } = useQuery({
    queryKey: ["pavilions"],
    queryFn: () => getAllPavilions(),
  });

  const [startDate, setStartDate] = React.useState();
  const [endDate, setEndDate] = React.useState();

  const [isEventOpen, isSetEventOpen] = useState(false);
  const [isSelectedMultiDate, setIsSelectedMultiDate] = useState(false);

  // Shared calendar state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [calendarDateRange, setCalendarDateRange] = useState<{ from: Date; to?: Date } | undefined>(
    undefined
  );

  // Alert state for no date selected
  const [showAlert, setShowAlert] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);

  // Legend minimize state
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);

  // Alert state for no pavilion selected
  const [showPavilionAlert, setShowPavilionAlert] = useState(false);
  const [pavilionAlertVisible, setPavilionAlertVisible] = useState(false);

  // Status filter state
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Status options
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "1", label: "Pending" },
    { value: "2", label: "Confirmed" },
    { value: "3", label: "In Progress" },
    { value: "4", label: "Completed" },
    { value: "5", label: "Unpaid" },
    { value: "6", label: "Canceled" },
  ];

  // Filter bookings by selected status
  const filteredBookings =
    selectedStatus === "all"
      ? allBookings
      : allBookings.filter(booking => booking.status?.toString() === selectedStatus);

  // Auto-fade alert after 5 seconds
  useEffect(() => {
    if (showAlert) {
      // Show animation
      setAlertVisible(true);

      // Start fade-out after 4.5 seconds (to account for animation timing)
      const fadeTimer = setTimeout(() => {
        setAlertVisible(false);
      }, 4500);

      // Remove from DOM after 5 seconds
      const removeTimer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showAlert]);

  // Auto-fade pavilion alert after 5 seconds
  useEffect(() => {
    if (showPavilionAlert) {
      // Show animation
      setPavilionAlertVisible(true);

      // Start fade-out after 4.5 seconds (to account for animation timing)
      const fadeTimer = setTimeout(() => {
        setPavilionAlertVisible(false);
      }, 4500);

      // Remove from DOM after 5 seconds
      const removeTimer = setTimeout(() => {
        setShowPavilionAlert(false);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [showPavilionAlert]);

  // Function to trigger the no date alert
  const triggerNoDateAlert = () => {
    if (!selectedDates.length && !calendarDateRange?.from) {
      // Reset alert state first
      setShowAlert(false);
      setAlertVisible(false);

      // Use a small timeout to ensure state resets before showing again
      setTimeout(() => {
        setShowAlert(true);
      }, 10);
    }
  };

  // Function to trigger the no pavilion alert
  const triggerNoPavilionAlert = () => {
    // Reset alert state first
    setShowPavilionAlert(false);
    setPavilionAlertVisible(false);

    // Use a small timeout to ensure state resets before showing again
    setTimeout(() => {
      setShowPavilionAlert(true);
    }, 10);
  };

  return (
    <div className="w-full flex flex-1 justify-center h-full">
      <div className="grow bg-white">
        <ContinuousCalendar
          onClick={(day, month, year, bookingId) => {
            console.log(day, month, year, bookingId);
            if (bookingId != null) {
              setBookingId(bookingId);
              setDialogOpen(true);
            }
          }}
          getAllBookings={filteredBookings}
          currentYear={currentYear}
          currentMonth={currentMonth}
          onYearChange={setCurrentYear}
          onMonthChange={setCurrentMonth}
          externalSelectedDates={selectedDates}
          onDatesChange={(dates, range) => {
            setSelectedDates(dates);
            if (range) {
              setCalendarDateRange({ from: range.start, to: range.end });
            } else if (dates.length === 1) {
              setCalendarDateRange({ from: dates[0] });
            } else {
              setCalendarDateRange(undefined);
            }
          }}
          onNoDateAlert={triggerNoDateAlert}
          onNoPavilionAlert={triggerNoPavilionAlert}
          isFetching={bookingsFetching}
          statusFilter={
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="z-[100]">
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </div>
      {bookingId != null && (
        <div className="">
          <BookingDialogComponent
            bookingId={bookingId}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </div>
      )}
      {/* Right Booking Summary */}
      <div className="min-w-[249px] max-w-[249px] sticky top-0 h-screen flex flex-col bg-white border-l border-gray-200 z-10">
        {(() => {
          // Filter and organize upcoming bookings - ONLY CONFIRMED (status = 2) future bookings
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

          const upcomingBookings = allBookings
            .filter(booking => {
              const bookingDate = booking.startAt || booking.foodTastingAt;
              if (!bookingDate) return false;

              const bookingDateObj = new Date(bookingDate);
              bookingDateObj.setHours(0, 0, 0, 0); // Reset to start of day

              // Only show confirmed (status = 2) bookings that are in the future
              return booking.status === 2 && bookingDateObj >= today;
            })
            .sort((a, b) => {
              const dateA = new Date(a.startAt || a.foodTastingAt || 0);
              const dateB = new Date(b.startAt || b.foodTastingAt || 0);
              return dateA.getTime() - dateB.getTime();
            });

          return (
            <>
              <div className="pt-8 pb-1 px-3 text-sm text-neutral-500 border-b-1 flex-shrink-0 flex justify-between items-end">
                <p>
                  Upcoming Bookings{" "}
                  <span className="text-xs">({upcomingBookings.length})</span>{" "}
                </p>
                <p className="text-xs text-primary hover:text-primary/80 cursor-pointer select-none">
                  View all
                </p>
              </div>

              <ScrollArea className="flex-1 overflow-hidden">
                <div className="px-3 pt-2 space-y-4">
                  {(() => {
                    // Group by month and year
                    const groupedBookings = upcomingBookings.reduce(
                      (acc, booking) => {
                        const bookingDate = new Date(booking.startAt || booking.foodTastingAt || 0);
                        const monthYear = `${bookingDate.toLocaleString("default", { month: "long" })} ${bookingDate.getFullYear()}`;

                        if (!acc[monthYear]) {
                          acc[monthYear] = [];
                        }
                        acc[monthYear].push(booking);
                        return acc;
                      },
                      {} as Record<string, typeof upcomingBookings>
                    );

                    if (Object.keys(groupedBookings).length === 0) {
                      return (
                        <div className="flex justify-between">
                          <p className="text-xs text-neutral-400 py-4">No upcoming confirmed bookings</p>
                        </div>
                      );
                    }

                    return Object.entries(groupedBookings).map(([monthYear, bookings]) => (
                      <div key={monthYear} className="space-y-2">
                        <h4 className="text-xs font-medium text-neutral-600 sticky top-0 bg-white py-1">
                          {monthYear}
                        </h4>
                        <ul className="space-y-2">
                          {bookings.map(booking => {
                            const bookingDate = new Date(
                              booking.startAt || booking.foodTastingAt || 0
                            );
                            const pavilion = pavilions?.find(p => p.id === booking.pavilionId);

                            // Get pavilion color - handle different color formats
                            let pavilionColor = pavilion?.color || "#ef4444";

                            // Handle Tailwind color names and convert to hex
                            const colorMap: Record<string, string> = {
                              // Standard colors
                              red: "#ef4444",
                              green: "#22c55e",
                              emerald: "#10b981",
                              pink: "#ec4899",
                              blue: "#3b82f6",
                              yellow: "#eab308",
                              purple: "#a855f7",
                              orange: "#f97316",
                              indigo: "#6366f1",
                              cyan: "#06b6d4",
                              teal: "#14b8a6",
                              slate: "#64748b",
                              amber: "#f59e0b",
                              lime: "#84cc16",
                              sky: "#0ea5e9",
                              violet: "#8b5cf6",
                              fuchsia: "#d946ef",
                              rose: "#f43f5e",
                            };

                            // Check if it's a Tailwind color name
                            if (pavilionColor) {
                              const sanitized = pavilionColor
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, "")
                                .split(/-+/)[0];
                              pavilionColor = colorMap[sanitized] || pavilionColor;
                            }

                            // Validate hex color format
                            const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(pavilionColor);
                            const finalColor = isValidHex ? pavilionColor : "#ef4444";

                            return (
                              <li key={booking.id} className="flex rounded-l-md items-center">
                                <div
                                  className="w-4 h-4 rounded-sm aspect-square"
                                  style={{ backgroundColor: finalColor }}
                                />
                                <p className="pr-1 rounded-l-md h-fit px-1 py-1 whitespace-nowrap font-medium select-none text-xs">
                                  {bookingDate.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </p>
                                <p className="p-1 truncate select-none text-xs">
                                  {booking.eventName || "Untitled Event"}
                                </p>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ));
                  })()}
                </div>
              </ScrollArea>
            </>
          );
        })()}
      </div>
      {/* Bottom Right Alert with Animation - No Date Selected */}
      {showAlert && (
        <div
          className={`fixed bottom-4 right-4 z-[100] transition-all duration-500 ease-in-out transform ${
            alertVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-full opacity-0 scale-95"
          }`}
        >
          <NoDateSelectedAlert />
        </div>
      )}
      {/* Bottom Right Alert with Animation - No Pavilion Selected */}
      {showPavilionAlert && (
        <div
          className={`fixed bottom-4 right-4 z-[100] transition-all duration-500 ease-in-out transform ${
            pavilionAlertVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-full opacity-0 scale-95"
          }`}
        >
          <NoPavilionSelectedAlert />
        </div>
      )}

      {/* Floating Legend - Pavilion Colors - Bottom Right with Grid Layout */}
      {pavilions && pavilions.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-300">
          {/* Header with Toggle */}
          <div
            className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setIsLegendMinimized(!isLegendMinimized)}
          >
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Pavilion Legend</h3>
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={isLegendMinimized ? "Expand legend" : "Minimize legend"}
            >
              {isLegendMinimized ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              )}
            </button>
          </div>

          {/* Legend Content - 3 rows with multiple columns */}
          {!isLegendMinimized && (
            <div className="p-3">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                  gridAutoFlow: 'column',
                  gridAutoColumns: 'minmax(120px, auto)'
                }}
              >
                {pavilions.map((pavilion: any) => {
                  // Handle color mapping (same logic as in the calendar)
                  let pavilionColor = pavilion?.color || "#ef4444";

                  // Color mapping for common Tailwind color names to hex
                  const colorMap: Record<string, string> = {
                    red: "#ef4444",
                    blue: "#3b82f6",
                    green: "#10b981",
                    yellow: "#f59e0b",
                    purple: "#a855f7",
                    pink: "#ec4899",
                    indigo: "#6366f1",
                    orange: "#f97316",
                    teal: "#14b8a6",
                    cyan: "#06b6d4",
                  };

                  if (pavilionColor) {
                    const sanitized = pavilionColor
                      .toLowerCase()
                      .replace(/\s+/g, "")
                      .replace(/^(bg-|text-|border-)/, "");
                    pavilionColor = colorMap[sanitized] || pavilionColor;
                  }

                  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(pavilionColor);
                  const finalColor = isValidHex ? pavilionColor : "#ef4444";

                  return (
                    <div key={pavilion.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-sm flex-shrink-0 border border-gray-300"
                        style={{ backgroundColor: finalColor }}
                      />
                      <span className="text-xs text-gray-700 truncate">
                        {pavilion.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarClient;
