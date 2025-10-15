"use client"

// Component exports - Only exporting files that exist
export { EventCalendar } from "./event-calendar"
export { MonthView } from "./month-view"
export { WeekView } from "./week-view"

// Constants and utility exports
export * from "./constants"
export * from "./utils"

// Hook exports
export { useCurrentTimeIndicator } from "./use-current-time-indicator"
export { useEventVisibility } from "./use-event-visibility"

// Type exports
export type { CalendarEvent, CalendarView, EventColor } from "./types"
