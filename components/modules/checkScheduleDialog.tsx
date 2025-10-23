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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Pavilion, Booking } from "@/generated/prisma";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
}) => {
  const selectedDay = props.selectedDay ?? null;
  const selectedDates = props.selectedDates ?? [];
  const dateRange = props.dateRange ?? null;
  const pavilions = props.pavilions ?? null;
  const bookings = props.bookings ?? [];
  const onNoDateAlert = props.onNoDateAlert;
  const onNoPavilionAlert = props.onNoPavilionAlert;

  const [selectedPavilionId, setSelectedPavilionId] = useState<string>("");
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const router = useRouter();

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

  const handleContinue = () => {
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

    // Create URL parameters
    const params = new URLSearchParams();

    if (dateRange) {
      // For date range, pass start and end dates
      params.set(
        "startDate",
        `${dateRange.start.year}-${String(dateRange.start.month + 1).padStart(2, "0")}-${String(dateRange.start.day).padStart(2, "0")}`
      );
      params.set(
        "endDate",
        `${dateRange.end.year}-${String(dateRange.end.month + 1).padStart(2, "0")}-${String(dateRange.end.day).padStart(2, "0")}`
      );
    } else if (selectedDay) {
      // For single date
      params.set(
        "startDate",
        `${selectedDay.year}-${String(selectedDay.month + 1).padStart(2, "0")}-${String(selectedDay.day).padStart(2, "0")}`
      );
    }

    if (selectedPavilionId) {
      params.set("pavilionId", selectedPavilionId);
    }

    // Navigate to create booking page with parameters
    router.push(`/bookings/create-booking?${params.toString()}`);
  };

  return (
    <div className="w-full flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="max-[479px]:aspect-square max-[479px]:p-0! shadow-sm">
            <Plus className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
            <span className="max-[479px]:sr-only flex gap-2 items-center">
              Add Booking
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

        <DialogContent className="[&>button]:hidden">
          <DialogHeader className="text-center">
            <DialogTitle>Add Booking</DialogTitle>
            <DialogDescription>You are about to create an event on this date.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
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
            {hasConflict && (
              <button
                type="button"
                onClick={() => setIsConflictDialogOpen(true)}
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

          <DialogFooter>
            <DialogClose>
              <Button variant={"outline"}>Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleContinue}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Conflict Details Dialog */}
      {isConflictDialogOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={() => setIsConflictDialogOpen(false)}
          />

          {/* Dialog Content */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
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
                <p className="text-sm text-blue-700 mt-1">
                  Pavilion:{" "}
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
                        <p className="font-medium text-gray-900">{conflict.eventName}</p>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>
                            <span className="font-medium">Pavilion:</span>{" "}
                            {pavilions.find(p => p.id === conflict.pavilionId)?.name || "Unknown"}
                          </p>
                          <p>
                            <span className="font-medium">Booking Date:</span>{" "}
                            {conflict.startAt.toLocaleDateString(undefined, {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                            {conflict.endAt && (
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
                          <p>
                            <span className="font-medium">Time Difference:</span>{" "}
                            {conflict.daysDifference === 0 ? (
                              <span className="text-red-600 font-semibold">Same day</span>
                            ) : conflict.daysDifference === 1 ? (
                              <span className="text-orange-600 font-semibold">1 day after</span>
                            ) : conflict.daysDifference === -1 ? (
                              <span className="text-orange-600 font-semibold">1 day before</span>
                            ) : (
                              <span>
                                {Math.abs(conflict.daysDifference)} days{" "}
                                {conflict.daysDifference > 0 ? "after" : "before"}
                              </span>
                            )}
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
        </>
      )}
    </div>
  );
};

export default CheckScheduleDialog;
