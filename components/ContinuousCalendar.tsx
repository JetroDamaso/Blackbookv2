"use client";

import { Inbox, MoveLeft, MoveRight, X, CalendarClock } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type { Booking, Pavilion } from "@/generated/prisma";
import { useQuery } from "@tanstack/react-query";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { Button } from "./ui/button";
import CheckScheduleDialog from "./modules/checkScheduleDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface ContinuousCalendarProps {
  onClick?: (_day: number, _month: number, _year: number, _bookingId?: Booking["id"]) => void;
  getAllBookings?: Booking[];
  // External state control props
  currentYear?: number;
  currentMonth?: number;
  onYearChange?: (year: number) => void;
  onMonthChange?: (month: number) => void;
  externalSelectedDates?: Date[];
  onDatesChange?: (dates: Date[], range?: { start: Date; end: Date }) => void;
  onNoDateAlert?: () => void;
  onNoPavilionAlert?: () => void;
  statusFilter?: React.ReactNode; // New prop for status filter component
}

export interface selected {
  month: number;
  day: number;
  year: number;
}

export interface DateRange {
  start: selected;
  end: selected;
}

export const ContinuousCalendar: React.FC<ContinuousCalendarProps> = ({
  onClick,
  getAllBookings,
  currentYear: externalYear,
  currentMonth: externalMonth,
  onYearChange,
  onMonthChange,
  externalSelectedDates,
  onDatesChange,
  onNoDateAlert,
  onNoPavilionAlert,
  statusFilter, // Add statusFilter prop
}) => {
  const [selectedDate, setSelectedDate] = useState<selected | undefined>(undefined);
  const [selectedDates, setSelectedDates] = useState<selected[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const today = new Date();
  const [year, setYear] = useState<number>(externalYear ?? new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(
    externalMonth ?? new Date().getMonth()
  );

  // Reschedule state
  const [reschedulingBookingId, setReschedulingBookingId] = useState<number | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);

  // Sync with external state
  useEffect(() => {
    if (externalYear !== undefined) setYear(externalYear);
  }, [externalYear]);

  useEffect(() => {
    if (externalMonth !== undefined) setSelectedMonth(externalMonth);
  }, [externalMonth]);

  useEffect(() => {
    if (externalSelectedDates) {
      const convertedDates = externalSelectedDates.map(date => ({
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      }));
      setSelectedDates(convertedDates);

      if (convertedDates.length === 1) {
        setSelectedDate(convertedDates[0]);
        setDateRange(undefined);
      } else if (convertedDates.length > 1) {
        setSelectedDate(convertedDates[convertedDates.length - 1]);
        setDateRange({
          start: convertedDates[0],
          end: convertedDates[convertedDates.length - 1],
        });
      } else {
        setSelectedDate(undefined);
        setDateRange(undefined);
      }
    }
  }, [externalSelectedDates]);
  const monthOptions = monthNames.map((month, index) => ({
    name: month,
    value: `${index}`,
  }));

  const yearOptions = Array.from({ length: 100 }, (_, i) => {
    const yearValue = new Date().getFullYear() - 10 + i;
    return {
      name: yearValue.toString(),
      value: yearValue.toString(),
    };
  });

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      const newYear = year - 1;
      setYear(newYear);
      onYearChange?.(newYear);
    } else {
      const newMonth = selectedMonth - 1;
      setSelectedMonth(newMonth);
      onMonthChange?.(newMonth);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      const newYear = year + 1;
      setYear(newYear);
      onYearChange?.(newYear);
    } else {
      const newMonth = selectedMonth + 1;
      setSelectedMonth(newMonth);
      onMonthChange?.(newMonth);
    }
  };

  const handleYearChange = (value: string) => {
    const newYear = parseInt(value, 10);
    setYear(newYear);
    onYearChange?.(newYear);
  };

  const handleMonthChange = (value: string) => {
    const monthIndex = parseInt(value, 10);
    setSelectedMonth(monthIndex);
    onMonthChange?.(monthIndex);
  };

  const handleTodayClick = () => {
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    setYear(todayYear);
    setSelectedMonth(todayMonth);
    onYearChange?.(todayYear);
    onMonthChange?.(todayMonth);
  };

  const isDateInRange = useCallback(
    (day: number, month: number, year: number): boolean => {
      if (!dateRange) return false;

      const currentDate = new Date(year, month, day);
      const startDate = new Date(dateRange.start.year, dateRange.start.month, dateRange.start.day);
      const endDate = new Date(dateRange.end.year, dateRange.end.month, dateRange.end.day);

      return currentDate >= startDate && currentDate <= endDate;
    },
    [dateRange]
  );

  const generateDateRange = useCallback((start: selected, end: selected): selected[] => {
    const dates: selected[] = [];
    const startDate = new Date(start.year, start.month, start.day);
    const endDate = new Date(end.year, end.month, end.day);

    // Ensure start is before end
    const actualStart = startDate <= endDate ? startDate : endDate;
    const actualEnd = startDate <= endDate ? endDate : startDate;

    const currentDate = new Date(actualStart);
    while (currentDate <= actualEnd) {
      dates.push({
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, []);

  const notifyDateChange = useCallback(
    (dates: selected[], range?: DateRange) => {
      const convertedDates = dates.map(date => new Date(date.year, date.month, date.day));
      const convertedRange = range
        ? {
            start: new Date(range.start.year, range.start.month, range.start.day),
            end: new Date(range.end.year, range.end.month, range.end.day),
          }
        : undefined;

      onDatesChange?.(convertedDates, convertedRange);
    },
    [onDatesChange]
  );

  const handleDayClick = useCallback(
    (day: number, month: number, year: number, bookingId?: Booking["id"]) => {
      const clickedDate = { day, month, year };
      let newSelectedDates: selected[] = [];
      let newDateRange: DateRange | undefined = undefined;

      // If no date is selected, select this date
      if (!selectedDate) {
        setSelectedDate(clickedDate);
        newSelectedDates = [clickedDate];
        setSelectedDates(newSelectedDates);
        setDateRange(undefined);
      } else {
        // If same date is clicked, deselect
        if (
          selectedDate.day === day &&
          selectedDate.month === month &&
          selectedDate.year === year
        ) {
          setSelectedDate(undefined);
          newSelectedDates = [];
          setSelectedDates(newSelectedDates);
          setDateRange(undefined);
        } else {
          // Check if clicked date is before the start date
          const clickedDateTime = new Date(year, month, day);
          const startDateTime = new Date(selectedDate.year, selectedDate.month, selectedDate.day);

          if (clickedDateTime < startDateTime) {
            // If clicked date is before start date, reset start date to this new date
            setSelectedDate(clickedDate);
            newSelectedDates = [clickedDate];
            setSelectedDates(newSelectedDates);
            setDateRange(undefined);
          } else {
            // Create a range between first selected date and current date
            const range = { start: selectedDate, end: clickedDate };
            const rangedDates = generateDateRange(selectedDate, clickedDate);

            newDateRange = range;
            newSelectedDates = rangedDates;
            setDateRange(range);
            setSelectedDates(rangedDates);
            setSelectedDate(clickedDate); // Keep track of the last clicked date
          }
        }
      }

      // Notify parent component of date changes
      notifyDateChange(newSelectedDates, newDateRange);

      if (!onClick) return;
      onClick(day, month, year, bookingId);
    },
    [onClick, selectedDate, generateDateRange, notifyDateChange]
  );

  // Pavilion colors
  const { data: pavilions } = useQuery({
    queryKey: ["pavilions"],
    queryFn: () => getAllPavilions(),
  });

  const pavilionColorMap = useMemo(() => {
    const map: Record<number, string> = {};
    (pavilions ?? []).forEach((p: { id: number; color?: string | null }) => {
      if (p?.id != null && p?.color) map[p.id] = p.color;
    });
    return map;
  }, [pavilions]);

  interface DayBookingItem {
    id: Booking["id"];
    name: string;
    startTime?: string;
    endTime?: string;
    pavilionId?: number | null;
  }

  const bookingsByDay = useMemo(() => {
    const map: Record<string, DayBookingItem[]> = {};
    const list = getAllBookings ?? [];

    let missingDateCount = 0;
    for (const b of list) {
      const rawDate = b.startAt ?? b.foodTastingAt ?? b.endAt;
      if (!rawDate) {
        missingDateCount++;
        continue;
      }
      const dt = new Date(rawDate as unknown as string | number | Date);
      if (isNaN(dt.getTime())) {
        missingDateCount++;
        continue;
      }
      const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
      const name = b.eventName ?? `Booking #${b.id}`;
      const fmt = (d?: Date | string | null): string | undefined => {
        if (!d) return undefined;
        const dd = typeof d === "string" || d instanceof Date ? new Date(d) : undefined;
        if (!dd || isNaN(dd.getTime())) return undefined;
        return dd.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      };
      const startTime = fmt(b.startAt);
      const endTime = fmt(b.endAt);
      const tastingTime = fmt(b.foodTastingAt);
      const displayStart = startTime ?? tastingTime;
      if (!map[key]) map[key] = [];
      map[key].push({
        id: b.id,
        name,
        startTime: displayStart,
        endTime,
        pavilionId: (b as unknown as { pavilionId?: number | null }).pavilionId ?? undefined,
      });
    }
    if (
      process.env.NODE_ENV !== "production" &&
      list.length > 0 &&
      missingDateCount === list.length
    ) {
      console.warn(
        "ContinuousCalendar: No date fields found on bookings. Expecting startAt/foodTastingAt/endAt."
      );
    }
    return map;
  }, [getAllBookings]);

  const generateCalendar = useMemo(() => {
    const todayDate = new Date();

    const firstDayOfWeek = new Date(year, selectedMonth, 1).getDay();
    const daysInCurrentMonth = new Date(year, selectedMonth + 1, 0).getDate();

    const prevMonth = (selectedMonth + 11) % 12;
    const nextMonth = (selectedMonth + 1) % 12;
    const prevYear = selectedMonth === 0 ? year - 1 : year;
    const nextYear = selectedMonth === 11 ? year + 1 : year;

    type DayCell = {
      day: number;
      month: number;
      year: number;
      isCurrent: boolean;
    };
    const cells: DayCell[] = [];

    if (firstDayOfWeek > 0) {
      const daysInPrevMonth = new Date(year, selectedMonth, 0).getDate();
      const start = daysInPrevMonth - firstDayOfWeek + 1;
      for (let d = start; d <= daysInPrevMonth; d++) {
        cells.push({
          day: d,
          month: prevMonth,
          year: prevYear,
          isCurrent: false,
        });
      }
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      cells.push({ day: d, month: selectedMonth, year, isCurrent: true });
    }

    const trailing = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= trailing; d++) {
      cells.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrent: false,
      });
    }

    const calendarWeeks: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      calendarWeeks.push(cells.slice(i, i + 7));
    }

    return calendarWeeks.map((week, weekIndex) => (
      <div className="flex w-full flex-1 min-h-0 select-none" key={`week-${weekIndex}`}>
        {week.map(({ day, month, year: cellYear, isCurrent }) => {
          const isToday =
            todayDate.getFullYear() === cellYear &&
            todayDate.getMonth() === month &&
            todayDate.getDate() === day;
          const dateKey = `${cellYear}-${month}-${day}`;
          const items = bookingsByDay[dateKey] ?? [];
          const isSelected =
            selectedDate &&
            selectedDate.day === day &&
            selectedDate.month === month &&
            selectedDate.year === cellYear;

          const isInRange = isDateInRange(day, month, cellYear);
          const isPartOfSelection = selectedDates.some(
            date => date.day === day && date.month === month && date.year === cellYear
          );

          return (
            <div
              key={`${cellYear}-${month}-${day}`}
              onClick={() => handleDayClick(day, month, cellYear)}
              className={`relative m-[-0.5px] group flex-1 w-full h-full min-h-[175px] border-1 font-medium transition-all cursor-pointer ${
                isSelected
                  ? "bg-red-500/30"
                  : isPartOfSelection || isInRange
                    ? "bg-red-500/15"
                    : "hover:bg-gray-100"
              }`}
            >
              <span
                className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs   ${
                  isToday ? "bg-blue-500 text-white" : ""
                } ${isCurrent ? "text-slate-800" : "text-slate-400"}`}
              >
                {day}
              </span>
              {items.length > 0 && (
                <div className="absolute top-1 w-full h-fit text-start mt-6 space-y-1 px-1">
                  {items.slice(0, 4).map((n, i) => {
                    const rawColorToken = n.pavilionId ? pavilionColorMap[n.pavilionId] : undefined;

                    // Convert Tailwind color names to hex values
                    const colorMap: Record<string, string> = {
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

                    // Get the hex color
                    let backgroundColor = "#ef4444"; // default red
                    if (rawColorToken) {
                      const sanitized = rawColorToken
                        .toLowerCase()
                        .replace(/[^a-z0-9-]/g, "")
                        .split(/-+/)[0];
                      backgroundColor = colorMap[sanitized] || rawColorToken; // Use colorMap or direct value if it's already hex
                    }

                    // Determine text color based on background brightness
                    const lightColors = new Set(["yellow", "amber", "lime"]);
                    const sanitized = rawColorToken
                      ?.toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                      .split(/-+/)[0];
                    const textColor =
                      sanitized && lightColors.has(sanitized) ? "#0f172a" : "#ffffff";

                    const isRescheduling = reschedulingBookingId === n.id;

                    return (
                      <ContextMenu key={`${dateKey}-${i}`}>
                        <ContextMenuTrigger asChild>
                          <div
                            className={`text-[10px] font-normal rounded-sm h-fit cursor-pointer transition-all hover:brightness-110 ${
                              isRescheduling ? "opacity-50 ring-2 ring-blue-500" : ""
                            }`}
                            style={{
                              backgroundColor: backgroundColor,
                              color: textColor,
                            }}
                            title={n.name}
                            onClick={e => {
                              e.stopPropagation();
                              if (!isRescheduling) {
                                handleDayClick(day, month, cellYear, n.id);
                              }
                            }}
                          >
                            <div className="flex line-clamp-1 gap-1 items-center">
                              {(n.startTime || n.endTime) && (
                                <div className="bg-neutral-800/70 rounded-l-sm px-1 py-0.5">
                                  <p className="font-normal whitespace-nowrap">
                                    {n.startTime && n.endTime
                                      ? `${n.startTime} - ${n.endTime}`
                                      : (n.startTime ?? n.endTime)}
                                  </p>
                                </div>
                              )}
                              <p className="font-normal truncate grow pr-1">{n.name}</p>
                            </div>
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              const fullBooking = getAllBookings?.find(b => b.id === n.id);
                              if (fullBooking) {
                                setReschedulingBookingId(n.id);
                                setReschedulingBooking(fullBooking);
                              }
                            }}
                          >
                            <CalendarClock className="mr-2 h-4 w-4" />
                            Reschedule
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
                  {items.length > 3 && (
                    <div className="text-[10px] text-slate-600">+{items.length - 3} more</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    ));
  }, [year, selectedMonth, handleDayClick, bookingsByDay, pavilionColorMap, selectedDate]);

  useEffect(() => {
    // No-op: observer/scroll not needed for single-month view.
  }, []);

  return (
    <div className="flex flex-col h-full w-full text-slate-800 text-sm">
      <div className="sticky top-0 z-10 w-full bg-white px-5 pt-7 pb-2 flex-shrink-0 border-gray-200">
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrevMonth}
              className="rounded-md border border-foreground/20 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <MoveLeft className="size-4 text-slate-800" />
            </button>
            <Select value={`${selectedMonth}`} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[140px] ">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[40]">
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleNextMonth}
              className="rounded-md border border-foreground/20 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <MoveRight className="size-4 text-slate-800" />
            </button>
            <Select value={year.toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[40]">
                {yearOptions.map(year => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              onClick={handleTodayClick}
              type="button"
              className="text-md rounded-md border border-foreground/20 bg-white px-2 py-2 font-medium text-gray-900 hover:bg-gray-100"
            >
              Today
            </button>
            {statusFilter && <div className="ml-2">{statusFilter}</div>}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" className="text-md">
              <Inbox className="opacity-60 sm:-ms-1" size={16} aria-hidden="true" />
              <span className="max-[479px]:sr-only">Manage</span>
            </Button>

            <CheckScheduleDialog
              selectedDay={selectedDate}
              selectedDates={selectedDates}
              dateRange={dateRange}
              pavilions={pavilions ?? []}
              bookings={getAllBookings}
              onNoDateAlert={onNoDateAlert}
              onNoPavilionAlert={onNoPavilionAlert}
              reschedulingBooking={reschedulingBooking}
              onRescheduleComplete={() => {
                setReschedulingBookingId(null);
                setReschedulingBooking(null);
                setSelectedDate(undefined);
                setSelectedDates([]);
                setDateRange(undefined);
              }}
            />

            {reschedulingBookingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setReschedulingBookingId(null);
                  setReschedulingBooking(null);
                  setSelectedDate(undefined);
                  setSelectedDates([]);
                  setDateRange(undefined);
                }}
              >
                <X size={16} className="opacity-60 sm:-ms-1" />
                Cancel
              </Button>
            )}

            {(selectedDate || dateRange) && !reschedulingBookingId && (
              <Button
                variant={"outline"}
                className="items-center"
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedDates([]);
                  setDateRange(undefined);
                }}
              >
                <X size={16} className="opacity-60 sm:-ms-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500 rounded-b-md">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="w-full border-foreground/20 py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 w-full overflow-y-auto no-scrollbar">
        <div className="flex flex-col h-full">{generateCalendar}</div>
      </div>
    </div>
  );
};

export interface CustomSelectProps {
  name: string;
  value: string;
  label?: string;
  options: { name: string; value: string }[];
  onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const CustomSelect = ({
  name,
  value,
  label,
  options = [],
  onChange,
  className,
}: CustomSelectProps) => (
  <div className={`relative ${className}`}>
    {label && (
      <label htmlFor={name} className="mb-2 block font-medium text-slate-800">
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="cursor-pointer rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-6 font-medium text-gray-900 hover:bg-gray-100 sm:py-2.5"
      required
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);
