"use client";

import { useEffect } from "react";
import { updateAllBookingStatuses } from "@/server/Booking/pushActions";

/**
 * Component that automatically updates all booking statuses on app initialization
 * This ensures all booking statuses are current based on dates and payments
 */
export function BookingStatusInitializer() {
  useEffect(() => {
    const updateStatuses = async () => {
      try {
        console.log("🔄 Updating all booking statuses...");
        const result = await updateAllBookingStatuses();
        console.log(`✅ Updated ${result.updatedCount} booking status(es)`);
      } catch (error) {
        console.error("❌ Failed to update booking statuses:", error);
      }
    };

    // Run on mount
    updateStatuses();

    // Optionally, run every hour to keep statuses fresh
    const interval = setInterval(updateStatuses, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  return null; // This component doesn't render anything
}
