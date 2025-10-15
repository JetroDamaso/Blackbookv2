"use client";
import React, { useState, useEffect } from "react";
import { ContinuousCalendar } from "../ContinuousCalendar";
import type { Booking } from "@/generated/prisma";
import BookingDialogComponent from "./BookingDialog";
import { Calendar } from "../ui/calendar";
import { ScrollArea } from "../ui/scroll-area";
import { ArrowRight, Castle, ChefHat, Package, UsersRound, WavesLadder } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Textarea } from "../ui/textarea";
import NoDateSelectedAlert from "./NoDateSelectedAlert";
import NoPavilionSelectedAlert from "./NoPavilionSelectedAlert";
import { useQuery } from "@tanstack/react-query";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";

const CalendarClient = (props: { getAllBookings: Booking[] }) => {
    const { getAllBookings } = props;
    const [bookingId, setBookingId] = React.useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);

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
    const [calendarDateRange, setCalendarDateRange] = useState<{ from: Date; to?: Date } | undefined>(undefined);

    // Alert state for no date selected
    const [showAlert, setShowAlert] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);

    // Alert state for no pavilion selected
    const [showPavilionAlert, setShowPavilionAlert] = useState(false);
    const [pavilionAlertVisible, setPavilionAlertVisible] = useState(false);

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
        <div className="w-full flex flex-1 justify-center">
            <div className="border-r-1 min-w-[249px] max-w-[249px] overflow-y-auto left-0 flex flex-col">
                <Calendar
                    mode="range"
                    className="text-x origin-top border-b-1"
                    month={new Date(currentYear, currentMonth)}
                    onMonthChange={(date) => {
                        setCurrentYear(date.getFullYear());
                        setCurrentMonth(date.getMonth());
                    }}
                    selected={calendarDateRange}
                    onSelect={(range) => {
                        if (range?.from && range?.to) {
                            setCalendarDateRange({ from: range.from, to: range.to });
                            // Generate array of dates in range
                            const dates: Date[] = [];
                            const currentDate = new Date(range.from);
                            while (currentDate <= range.to) {
                                dates.push(new Date(currentDate));
                                currentDate.setDate(currentDate.getDate() + 1);
                            }
                            setSelectedDates(dates);
                            // Navigate big calendar to the selected month if needed
                            const selectedYear = range.from.getFullYear();
                            const selectedMonth = range.from.getMonth();
                            if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
                                setCurrentYear(selectedYear);
                                setCurrentMonth(selectedMonth);
                            }
                        } else if (range?.from && !range?.to) {
                            setCalendarDateRange({ from: range.from });
                            setSelectedDates([range.from]);
                            // Navigate big calendar to the selected month if needed
                            const selectedYear = range.from.getFullYear();
                            const selectedMonth = range.from.getMonth();
                            if (selectedYear !== currentYear || selectedMonth !== currentMonth) {
                                setCurrentYear(selectedYear);
                                setCurrentMonth(selectedMonth);
                            }
                        } else {
                            setCalendarDateRange(undefined);
                            setSelectedDates([]);
                        }
                    }}
                />
                <p className="pt-8 pb-1 px-3 text-sm text-neutral-500 border-b-1">
                    Upcoming bookings{" "}
                </p>
                <ScrollArea className="flex-1">
                    <div className="px-3 pt-2 space-y-4">
                        {(() => {
                            // Filter and organize upcoming bookings
                            const today = new Date();
                            const upcomingBookings = getAllBookings
                                .filter(booking => {
                                    const bookingDate = booking.startAt || booking.foodTastingAt;
                                    return bookingDate && new Date(bookingDate) >= today;
                                })
                                .sort((a, b) => {
                                    const dateA = new Date(a.startAt || a.foodTastingAt || 0);
                                    const dateB = new Date(b.startAt || b.foodTastingAt || 0);
                                    return dateA.getTime() - dateB.getTime();
                                });

                            // Group by month and year
                            const groupedBookings = upcomingBookings.reduce((acc, booking) => {
                                const bookingDate = new Date(booking.startAt || booking.foodTastingAt || 0);
                                const monthYear = `${bookingDate.toLocaleString('default', { month: 'long' })} ${bookingDate.getFullYear()}`;

                                if (!acc[monthYear]) {
                                    acc[monthYear] = [];
                                }
                                acc[monthYear].push(booking);
                                return acc;
                            }, {} as Record<string, typeof upcomingBookings>);

                            if (Object.keys(groupedBookings).length === 0) {
                                return (
                                    <p className="text-xs text-neutral-400 py-4">
                                        No upcoming bookings
                                    </p>
                                );
                            }

                            return Object.entries(groupedBookings).map(([monthYear, bookings]) => (
                                <div key={monthYear} className="space-y-2">
                                    <h4 className="text-xs font-medium text-neutral-600 sticky top-0 bg-white py-1">
                                        {monthYear}
                                    </h4>
                                    <ul className="space-y-2">
                                        {bookings.map((booking) => {
                                            const bookingDate = new Date(booking.startAt || booking.foodTastingAt || 0);
                                            const pavilion = pavilions?.find(p => p.id === booking.pavilionId);

                                            // Get pavilion color - handle different color formats
                                            let pavilionColor = pavilion?.color || '#ef4444';

                                            // Handle Tailwind color names and convert to hex
                                            const colorMap: Record<string, string> = {
                                                // Standard colors
                                                'red': '#ef4444',
                                                'green': '#22c55e',
                                                'pink': '#ec4899',
                                                'blue': '#3b82f6',
                                                'yellow': '#eab308',
                                                'purple': '#a855f7',
                                                'orange': '#f97316',
                                                'indigo': '#6366f1',
                                                'cyan': '#06b6d4',
                                                'teal': '#14b8a6',
                                                // Tailwind variants
                                                'red-500': '#ef4444',
                                                'green-500': '#22c55e',
                                                'pink-500': '#ec4899',
                                                'blue-500': '#3b82f6',
                                                // Pavilion specific mappings
                                                'palacio de victoria': '#ef4444', // red
                                                'grand pavilion': '#22c55e',      // green
                                                'mini pavilion': '#ec4899'        // pink
                                            };

                                            // Check if it's a Tailwind color name or pavilion name
                                            if (pavilionColor && colorMap[pavilionColor.toLowerCase()]) {
                                                pavilionColor = colorMap[pavilionColor.toLowerCase()];
                                            } else if (pavilion?.name && colorMap[pavilion.name.toLowerCase()]) {
                                                // Fallback: check by pavilion name if color mapping fails
                                                pavilionColor = colorMap[pavilion.name.toLowerCase()];
                                            }

                                            // Validate hex color format
                                            const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(pavilionColor);
                                            const finalColor = isValidHex ? pavilionColor : '#ef4444';

                                            // Debug: Log pavilion colors (remove this later)
                                            console.log(`Booking: ${booking.eventName}, Pavilion: ${pavilion?.name}, Original Color: ${pavilion?.color}, Final Color: ${finalColor}`);

                                            return (
                                                <li key={booking.id} className="flex rounded-l-md items-center">
                                                    <div
                                                        className="w-4 h-4 rounded-sm aspect-square"
                                                        style={{ backgroundColor: finalColor }}
                                                    />
                                                    <p className="pr-1 rounded-l-md h-fit px-1 py-1 whitespace-nowrap font-medium select-none text-xs">
                                                        {bookingDate.toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <p className="p-1 truncate select-none text-xs">
                                                        {booking.eventName || 'Untitled Event'}
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
            </div>
            <div className="flex-1 -ml-[0.5px]">
                <ContinuousCalendar
                    onClick={(day, month, year, bookingId) => {
                        console.log(day, month, year, bookingId);
                        if (bookingId != null) {
                            setBookingId(bookingId);
                            setDialogOpen(true);
                        }
                    }}
                    getAllBookings={getAllBookings}
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
                />
                {bookingId != null && (
                    <BookingDialogComponent
                        bookingId={bookingId}
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                    />
                )}
            </div>
            {/* Right Booking Summary */}
            {/* Event is opened*/}
            {isEventOpen && (
                <div className="min-w-[249px] max-w-[249px] border-l-1">
                    <div className="border-b-1 ">
                        <p className="px-3 py-3 pb-1 font-medium">
                            Event details
                        </p>
                    </div>
                    {/* <p className="pt-4 px-3 pb-1 text-xs text-neutral-500">No event selected.</p> */}


                    {/* selected is single date */}
                    {!isSelectedMultiDate && (
                        <div>
                            <p className="pt-4 px-3 text-xs text-neutral-500 ">Date </p>
                            <div className="px-3 flex justify-between items-center border-b-1 pb-2">
                                <div className="flex flex-col">
                                    <p className="text-xl">September 26</p>
                                    <p className="text-xs">2025</p>
                                </div>

                            </div>
                        </div>
                    )}

                    {isSelectedMultiDate && (
                        <div>
                            <p className="pt-4 px-3 text-xs text-neutral-500 ">Date </p>
                            <div className="px-3 flex justify-between items-center border-b-1 pb-2">
                                <div className="flex flex-col">
                                    <p className="text-xl">Sep 26</p>
                                    <p className="text-xs">2025</p>
                                </div>
                                <ArrowRight size={18} aria-hidden="true" />
                                <div className="flex flex-col">
                                    <p className="text-xl">Sep 26</p>
                                    <p className="text-xs">2025</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="border-l-4 border-l-red-500">
                        <p className="pt-2 px-3 text-sm font-medium border-b-1 pb-2">
                            <p className="">Grand Pavilion</p>
                        </p>
                    </div>


                    <div>
                        <ScrollArea className="w-full h-auto">
                            <div className="pb-2">
                                <p className="pt-6 px-3 text-xs text-neutral-500">Details </p>
                                <div className="px-3 flex items-center">
                                    <UsersRound size={14} aria-hidden="true" />
                                    <p className="pl-2 pt-1 text-sm">200 pax</p>
                                </div>
                                <div className="px-3 flex items-center">
                                    <Castle size={14} aria-hidden="true" />
                                    <p className="pl-2 pt-1 text-sm">Grand Pavilion</p>
                                </div>
                                <div className="px-3 flex items-center">
                                    <Package size={14} aria-hidden="true" />
                                    <p className="pl-2 pt-1 text-sm">Full Blast</p>
                                </div>
                                <div className="px-3 flex items-center">
                                    <ChefHat size={14} aria-hidden="true" />
                                    <p className="pl-2 pt-1 text-sm">Catering</p>
                                </div>
                                <div className="px-3 flex items-center">
                                    <WavesLadder size={14} aria-hidden="true" />
                                    <p className="pl-2 pt-1 text-sm">Pool</p>
                                </div>
                                <p className="pt-4 px-3 text-xs text-neutral-500">Package </p>
                                <ul className="px-4 list-inside list-disc text-xs mt-1">
                                    <li>Stage setup & backdrop ceiling design</li>
                                    <li>Tunnel setup for entrance, stage, and backdrop design</li>
                                    <li>Centerpiece</li>
                                </ul>
                                <Accordion type="single" collapsible className="px-3">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="text-xs font-normal text-neutral-500 -mb-4">
                                            3rd party services
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="list-inside list-disc text-xs mt-1">
                                                <li>James photography</li>
                                                <li>Hapi-pax Photobooth</li>
                                                <li>Kotse ni Sir Alvin</li>
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <p className="mb-2 pt-4 px-3 text-xs text-neutral-500">Notes </p>
                                <div className="px-3 text-xs w-full min-w-0">
                                    <Textarea
                                        className="resize-none border-0 bg-muted"
                                        placeholder="No notes available."
                                    />
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            )}

            {/* Bottom Right Alert with Animation - No Date Selected */}
            {showAlert && (
                <div
                    className={`fixed bottom-4 right-4 z-[100] transition-all duration-500 ease-in-out transform ${alertVisible
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-full opacity-0 scale-95'
                        }`}
                >
                    <NoDateSelectedAlert />
                </div>
            )}

            {/* Bottom Right Alert with Animation - No Pavilion Selected */}
            {showPavilionAlert && (
                <div
                    className={`fixed bottom-4 right-4 z-[100] transition-all duration-500 ease-in-out transform ${pavilionAlertVisible
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-full opacity-0 scale-95'
                        }`}
                >
                    <NoPavilionSelectedAlert />
                </div>
            )}        </div>
    );
};

export default CalendarClient;
