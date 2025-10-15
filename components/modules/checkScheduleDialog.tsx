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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
  const router = useRouter();

  // Check for booking conflicts
  const selectedDatesList = useMemo(() => {
    return dateRange ? selectedDates : selectedDay ? [selectedDay] : [];
  }, [dateRange, selectedDates, selectedDay]);

  const hasConflict = useMemo(() => {
    if (!selectedPavilionId || (!selectedDay && !dateRange)) return false;

    const pavilionId = parseInt(selectedPavilionId);

    // Check each selected date for conflicts (1 day before or after)
    return selectedDatesList.some((date) => {
      const selectedDate = new Date(date.year, date.month, date.day);

      return bookings.some((booking) => {
        // Check if booking is for the same pavilion
        const bookingPavilionId = booking.pavilionId;
        if (bookingPavilionId !== pavilionId) return false;

        // Get booking date
        const bookingDate =
          booking.startAt ?? booking.foodTastingAt ?? booking.endAt;
        if (!bookingDate) return false;

        const bookingDateTime = new Date(bookingDate);
        if (isNaN(bookingDateTime.getTime())) return false;

        // Check if booking is within 1 day (before or after)
        const dayBefore = new Date(selectedDate);
        dayBefore.setDate(dayBefore.getDate() - 1);

        const dayAfter = new Date(selectedDate);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const bookingDateOnly = new Date(
          bookingDateTime.getFullYear(),
          bookingDateTime.getMonth(),
          bookingDateTime.getDate()
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

        return (
          bookingDateOnly.getTime() === dayBeforeOnly.getTime() ||
          bookingDateOnly.getTime() === dayAfterOnly.getTime() ||
          bookingDateOnly.getTime() === selectedDateOnly.getTime()
        );
      });
    });
  }, [selectedPavilionId, selectedDay, dateRange, selectedDatesList, bookings]);

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
            <Plus
              className="opacity-60 sm:-ms-1"
              size={16}
              aria-hidden="true"
            />
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
            <DialogDescription>
              You are about to create an event on this date.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-full items-start" />
              <div>
                <p className="text-xs text-neutral-500">
                  {dateRange ? "Date Range" : "Date"}
                </p>
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
                  <p className="text-xs text-neutral-400">
                    {selectedDates.length} days selected
                  </p>
                )}
              </div>
            </div>
            <div className="*:not-first:mt-1">
              <Label className="font-normal text-xs text-neutral-500">
                Select pavilion
              </Label>
              <Select
                value={selectedPavilionId}
                onValueChange={setSelectedPavilionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pavilion" />
                </SelectTrigger>
                <SelectContent>
                  {pavilions.map((pav) => (
                    <SelectItem key={pav.id} value={String(pav.id)}>
                      {pav.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasConflict && (
              <div className="flex gap-2 items-start text-red-500 border-1 rounded-md p-2 border-red-500">
                <CircleAlert />
                <p className="text-sm">
                  This pavilion has nearby bookings. Check for conflicts before
                  proceeding.
                </p>
              </div>
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
    </div>
  );
};

export default CheckScheduleDialog;
