import { DialogClose } from "@radix-ui/react-dialog";
import { CalendarIcon, CircleAlert, Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import TimeStartPickerCreateBookingComponent from "../(Bookings)/(AddBookings)/TimeDatePicker/timeStartPicker";
import TimeEndPickerCreateBookingComponent from "../(Bookings)/(AddBookings)/TimeDatePicker/timeEndPicker";
import { Pavilion, Booking } from "@/generated/prisma";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateBooking } from "@/server/Booking/pushActions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { ScrollArea } from "../ui/scroll-area";

interface selected {
  month: number;
  day: number;
  year: number;
}

interface DateRange {
  start: selected;
  end: selected;
}

const CheckScheduleDialog = (props: {
  selectedDay?: selected;
  selectedDates?: selected[];
  dateRange?: DateRange;
  pavilions: Pavilion[];
  bookings?: Booking[];
  onNoDateAlert?: () => void;
  onNoPavilionAlert?: () => void;
  reschedulingBooking?: Booking | null;
  onRescheduleComplete?: () => void;
}) => {
  const selectedDay = props.selectedDay ?? null;
  const selectedDates = props.selectedDates ?? [];
  const dateRange = props.dateRange ?? null;
  const pavilions = props.pavilions ?? null;
  const bookings = props.bookings ?? [];
  const onNoDateAlert = props.onNoDateAlert;
  const onNoPavilionAlert = props.onNoPavilionAlert;
  const reschedulingBooking = props.reschedulingBooking ?? null;
  const onRescheduleComplete = props.onRescheduleComplete;

  const isRescheduling = !!reschedulingBooking;

  const [selectedPavilionId, setSelectedPavilionId] = useState<string>("");
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [numPax, setNumPax] = useState<string>("");
  const [startTime, setStartTime] = useState<{
    hour: number;
    minute: number;
    second?: number;
  } | null>(null);
  const [endTime, setEndTime] = useState<{ hour: number; minute: number; second?: number } | null>(
    null
  );

  const router = useRouter();
  const queryClient = useQueryClient();

  // Set pavilion ID and times when rescheduling
  useEffect(() => {
    if (isRescheduling && reschedulingBooking?.pavilionId) {
      setSelectedPavilionId(String(reschedulingBooking.pavilionId));

      // Set start time
      if (reschedulingBooking.startAt) {
        const start = new Date(reschedulingBooking.startAt);
        setStartTime({
          hour: start.getHours(),
          minute: start.getMinutes(),
          second: start.getSeconds(),
        });
      }

      // Set end time
      if (reschedulingBooking.endAt) {
        const end = new Date(reschedulingBooking.endAt);
        setEndTime({
          hour: end.getHours(),
          minute: end.getMinutes(),
          second: end.getSeconds(),
        });
      }
    }
  }, [isRescheduling, reschedulingBooking]);

  // Check for booking conflicts
  const selectedDatesList = useMemo(() => {
    return dateRange ? selectedDates : selectedDay ? [selectedDay] : [];
  }, [dateRange, selectedDates, selectedDay]);

  const conflictingBookings = useMemo(() => {
    if (!selectedPavilionId || (!selectedDay && !dateRange)) return [];

    const pavilionId = parseInt(selectedPavilionId);
    const conflicts: Array<{
      bookingId: number;
      eventName: string;
      startAt: Date;
      endAt: Date | null;
      daysDifference: number;
      pavilionId: number;
    }> = [];

    // Check each selected date for conflicts (1 day before or after)
    selectedDatesList.forEach(date => {
      const selectedDate = new Date(date.year, date.month, date.day);

      bookings.forEach(booking => {
        // Check if booking is for the same pavilion
        const bookingPavilionId = booking.pavilionId;
        if (bookingPavilionId !== pavilionId) return;

        // Get booking start date
        const bookingStartDate = booking.startAt;
        if (!bookingStartDate) return;

        const bookingStartDateTime = new Date(bookingStartDate);
        if (isNaN(bookingStartDateTime.getTime())) return;

        // Get booking end date
        const bookingEndDate = booking.endAt ? new Date(booking.endAt) : null;

        // Check if booking is within 1 day (before or after)
        const dayBefore = new Date(selectedDate);
        dayBefore.setDate(dayBefore.getDate() - 1);

        const dayAfter = new Date(selectedDate);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const bookingDateOnly = new Date(
          bookingStartDateTime.getFullYear(),
          bookingStartDateTime.getMonth(),
          bookingStartDateTime.getDate()
        );
        const selectedDateOnly = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const dayBeforeOnly = new Date(
          dayBefore.getFullYear(),
          dayBefore.getMonth(),
          dayBefore.getDate()
        );
        const dayAfterOnly = new Date(
          dayAfter.getFullYear(),
          dayAfter.getMonth(),
          dayAfter.getDate()
        );

        const isConflicting =
          bookingDateOnly.getTime() === dayBeforeOnly.getTime() ||
          bookingDateOnly.getTime() === dayAfterOnly.getTime() ||
          bookingDateOnly.getTime() === selectedDateOnly.getTime();

        if (isConflicting) {
          // Calculate days difference
          const diffTime = selectedDateOnly.getTime() - bookingDateOnly.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          // Check if already added
          const alreadyAdded = conflicts.some(c => c.bookingId === booking.id);
          if (!alreadyAdded) {
            conflicts.push({
              bookingId: booking.id,
              eventName: booking.eventName || "Unknown Event",
              startAt: bookingStartDateTime,
              endAt: bookingEndDate,
              daysDifference: diffDays,
              pavilionId: bookingPavilionId,
            });
          }
        }
      });
    });

    return conflicts;
  }, [selectedPavilionId, selectedDay, dateRange, selectedDatesList, bookings]);

  const hasConflict = conflictingBookings.length > 0;

  const handleContinue = async () => {
    if (!selectedDay && !dateRange) {
      // Trigger the external alert for no date
      onNoDateAlert?.();
      return;
    }

    if (!selectedPavilionId) {
      // Trigger the external alert for no pavilion
      onNoPavilionAlert?.();
      return;
    }

    // Handle rescheduling
    if (isRescheduling && reschedulingBooking) {
      try {
        // Calculate new start and end dates
        let newStartDate: Date;
        let newEndDate: Date;

        if (selectedDay) {
          // Single day reschedule - use selected times or original times
          const startHours = startTime?.hour ?? 9;
          const startMinutes = startTime?.minute ?? 0;
          const endHours = endTime?.hour ?? 17;
          const endMinutes = endTime?.minute ?? 0;

          newStartDate = new Date(
            selectedDay.year,
            selectedDay.month,
            selectedDay.day,
            startHours,
            startMinutes
          );
          newEndDate = new Date(
            selectedDay.year,
            selectedDay.month,
            selectedDay.day,
            endHours,
            endMinutes
          );
        } else if (dateRange) {
          // Date range reschedule - use selected times or original times
          const startHours = startTime?.hour ?? 9;
          const startMinutes = startTime?.minute ?? 0;
          const endHours = endTime?.hour ?? 17;
          const endMinutes = endTime?.minute ?? 0;

          newStartDate = new Date(
            dateRange.start.year,
            dateRange.start.month,
            dateRange.start.day,
            startHours,
            startMinutes
          );
          newEndDate = new Date(
            dateRange.end.year,
            dateRange.end.month,
            dateRange.end.day,
            endHours,
            endMinutes
          );
        } else {
          return;
        }

        // Validate times
        if (newEndDate <= newStartDate) {
          toast.error("End time must be after start time");
          return;
        }

        await updateBooking(
          reschedulingBooking.id,
          undefined, // eventName
          selectedPavilionId, // pavilionID
          undefined, // pax
          undefined, // eventType
          undefined, // notes
          newStartDate, // bookingStart
          newEndDate // bookingEnd
        );

        toast.success("Booking rescheduled successfully!");

        // Invalidate queries to refresh the calendar
        queryClient.invalidateQueries({ queryKey: ["bookings"] });

        // Close dialog and reset reschedule state
        setDialogOpen(false);
        onRescheduleComplete?.();
      } catch (error) {
        console.error("Failed to reschedule booking:", error);
        toast.error("Failed to reschedule booking");
      }
      return;
    }

    // Create URL parameters for new booking
    const params = new URLSearchParams();

    if (dateRange) {
      // For date range, also use the single-day booking page
      params.set(
        "startDate",
        `${dateRange.start.year}-${String(dateRange.start.month + 1).padStart(2, "0")}-${String(dateRange.start.day).padStart(2, "0")}`
      );
      params.set(
        "endDate",
        `${dateRange.end.year}-${String(dateRange.end.month + 1).padStart(2, "0")}-${String(dateRange.end.day).padStart(2, "0")}`
      );

      if (selectedPavilionId) {
        params.set("pavilionId", selectedPavilionId);
      }

      // Add time parameters if set
      if (startTime) {
        params.set("startHour", String(startTime.hour));
        params.set("startMinute", String(startTime.minute));
      }
      if (endTime) {
        params.set("endHour", String(endTime.hour));
        params.set("endMinute", String(endTime.minute));
      }

      // Add pax parameter if set
      if (numPax) {
        params.set("pax", numPax);
      }

      // Navigate to create booking page with date range parameters
      router.push(`/bookings/create-booking?${params.toString()}`);
    } else if (selectedDay) {
      // For single date
      params.set(
        "startDate",
        `${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, "0")}-${String(selectedDay.day).padStart(2, "0")}`
      );

      if (selectedPavilionId) {
        params.set("pavilionId", selectedPavilionId);
      }

      // Add time parameters if set
      if (startTime) {
        params.set("startHour", String(startTime.hour));
        params.set("startMinute", String(startTime.minute));
      }
      if (endTime) {
        params.set("endHour", String(endTime.hour));
        params.set("endMinute", String(endTime.minute));
      }

      // Add pax parameter if set
      if (numPax) {
        params.set("pax", numPax);
      }

      // Navigate to create booking page with parameters
      router.push(`/bookings/create-booking?${params.toString()}`);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="max-[479px]:aspect-square max-[479px]:p-0! shadow-sm">
            <Plus className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
            <span className="max-[479px]:sr-only flex gap-2 items-center">
              {isRescheduling ? "Reschedule" : "Add Booking"}
              {/* if date is present, show. Else, hide */}
              {(selectedDay || dateRange) && (
                <p className="text-xs bg-white rounded-md px-2 py-1 text-black">
                  {dateRange
                    ? `${new Date(
                        dateRange.start.year,
                        dateRange.start.month,
                        dateRange.start.day
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })} - ${new Date(
                        dateRange.end.year,
                        dateRange.end.month,
                        dateRange.end.day
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}`
                    : selectedDay
                      ? new Date(
                          selectedDay.year,
                          selectedDay.month,
                          selectedDay.day
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "No day selected"}
                </p>
              )}
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="[&>button]:hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="text-center">
            <DialogTitle>{isRescheduling ? "Reschedule Booking" : "Add Booking"}</DialogTitle>
            <DialogDescription>
              {isRescheduling
                ? `Reschedule "${reschedulingBooking?.eventName}" to a new date.`
                : "You are about to create an event on this date."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 max-h-[60vh]">
            <div className="flex flex-col gap-4 pr-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-full items-start" />
                <div>
                  <p className="text-xs text-neutral-500">{dateRange ? "Date Range" : "Date"}</p>
                  <p className="text-sm font-medium">
                    {dateRange
                      ? `${new Date(
                          dateRange.start.year,
                          dateRange.start.month,
                          dateRange.start.day
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} - ${new Date(
                          dateRange.end.year,
                          dateRange.end.month,
                          dateRange.end.day
                        ).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : selectedDay
                        ? new Date(
                            selectedDay.year,
                            selectedDay.month,
                            selectedDay.day
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "No day selected"}
                  </p>
                  {selectedDates.length > 1 && (
                    <p className="text-xs text-neutral-400">{selectedDates.length} days selected</p>
                  )}
                </div>
              </div>
              <div className="*:not-first:mt-1">
                <Label className="font-normal text-xs text-neutral-500">Select pavilion</Label>
                <Select value={selectedPavilionId} onValueChange={setSelectedPavilionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pavilion" />
                  </SelectTrigger>
                  <SelectContent>
                    {pavilions.map(pav => (
                      <SelectItem key={pav.id} value={String(pav.id)}>
                        {pav.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="*:not-first:mt-1">
                  <Label className="font-normal text-xs text-neutral-500">Start Time</Label>
                  <TimeStartPickerCreateBookingComponent
                    startTimeOnChange={setStartTime}
                    initialDateTime={
                      isRescheduling && reschedulingBooking?.startAt
                        ? reschedulingBooking.startAt
                        : null
                    }
                  />
                </div>
                <div className="*:not-first:mt-1">
                  <Label className="font-normal text-xs text-neutral-500">End Time</Label>
                  <TimeEndPickerCreateBookingComponent
                    endTimeOnChange={setEndTime}
                    initialDateTime={
                      isRescheduling && reschedulingBooking?.endAt
                        ? reschedulingBooking.endAt
                        : null
                    }
                  />
                </div>
              </div>

              <div className="*:not-first:mt-1">
                <Label className="font-normal text-xs text-neutral-500">No. of Pax</Label>
                <Input
                  type="text"
                  placeholder="200"
                  value={numPax}
                  onChange={e => setNumPax(e.target.value)}
                />
              </div>

              {isRescheduling && (
                <div className="hidden">
                  {/* Hidden for rescheduling - times are shown above */}
                </div>
              )}

              {hasConflict && (
                <button
                  type="button"
                  onClick={() => {
                    setIsConflictDialogOpen(true);
                    setDialogOpen(false);
                  }}
                  className="flex gap-2 items-start text-red-500 border-1 rounded-md p-2 border-red-500 hover:bg-red-50 transition-colors cursor-pointer w-full text-left"
                >
                  <CircleAlert />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {conflictingBookings.length} nearby booking
                      {conflictingBookings.length > 1 ? "s" : ""} found
                    </p>
                    <p className="text-xs text-red-400">Click to view details</p>
                  </div>
                </button>
              )}
            </div>
          </ScrollArea>

          <DialogFooter>
            <DialogClose asChild>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                Cancel
              </button>
            </DialogClose>
            <Button type="submit" onClick={handleContinue}>
              {isRescheduling ? "Confirm Reschedule" : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Details Dialog */}
      {isConflictDialogOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-[9998]"
              onClick={() => setIsConflictDialogOpen(false)}
            />

            {/* Dialog Content */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div
                className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto p-6"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Booking Conflicts Detected</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      The following bookings are within 1 day of your selected date
                    </p>
                  </div>
                  <button
                    onClick={() => setIsConflictDialogOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Selected Date Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium">Your Selected Date:</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {dateRange
                      ? `${new Date(
                          dateRange.start.year,
                          dateRange.start.month,
                          dateRange.start.day
                        ).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })} - ${new Date(
                          dateRange.end.year,
                          dateRange.end.month,
                          dateRange.end.day
                        ).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : selectedDay
                        ? new Date(
                            selectedDay.year,
                            selectedDay.month,
                            selectedDay.day
                          ).toLocaleDateString(undefined, {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No date selected"}
                  </p>
                  <p className="text-sm text-blue-700">
                    {pavilions.find(p => p.id === parseInt(selectedPavilionId))?.name || "Unknown"}
                  </p>
                </div>

                {/* Conflicting Bookings List */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">Nearby Bookings:</h3>
                  {conflictingBookings.map((conflict, index) => (
                    <div
                      key={conflict.bookingId}
                      className="border border-red-200 rounded-lg p-4 bg-red-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex gap-2">
                            <p className="font-medium text-gray-900">{conflict.eventName}</p>

                            <p>
                              {conflict.daysDifference === 0 ? (
                                <span className="text-red-600 font-medium">Same day</span>
                              ) : conflict.daysDifference === 1 ? (
                                <span className="text-orange-600 font-medium">1 day before</span>
                              ) : conflict.daysDifference === -1 ? (
                                <span className="text-orange-600 font-medium">1 day after</span>
                              ) : (
                                <span>
                                  {Math.abs(conflict.daysDifference)} days{" "}
                                  {conflict.daysDifference > 0 ? "after" : "before"}
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p className="text-lg font-semibold text-orange-900 -mt-2">
                              {conflict.startAt.toLocaleDateString(undefined, {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                              {conflict.endAt &&
                                conflict.startAt.toLocaleDateString() !==
                                  conflict.endAt.toLocaleDateString() && (
                                  <>
                                    {" - "}
                                    {conflict.endAt.toLocaleDateString(undefined, {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </>
                                )}
                            </p>
                            <p className="text-sm text-gray-700">
                              Time:{" "}
                              {conflict.startAt.toLocaleTimeString(undefined, {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })}
                              {conflict.endAt && (
                                <>
                                  {" - "}
                                  {conflict.endAt.toLocaleTimeString(undefined, {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </>
                              )}
                            </p>
                            <p className="-mt-1">
                              {pavilions.find(p => p.id === conflict.pavilionId)?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsConflictDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    className="bg-primary hover:bg-red-700"
                    onClick={() => {
                      setIsConflictDialogOpen(false);
                      handleContinue();
                    }}
                  >
                    Continue Anyway
                  </Button>
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};

export default CheckScheduleDialog;
