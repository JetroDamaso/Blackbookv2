import NewAddBookings from "@/components/(Bookings)/(AddBookings)/NewAddBookings";
import AddBookingsPageClient from "@/components/(Bookings)/(AddBookings)/page";
import { getAllDiscount, getModeOfPayments } from "@/server/Billing & Payments/pullActions";
import { getAllDiscounts } from "@/server/discount/pullActions";
import { getAllEventTypes } from "@/server/Booking/pullActions";
import { getAllBookings } from "@/server/Booking/pullActions";
import { getAllDishes, getDishCategories } from "@/server/Dishes/Actions/pullActions";
import { getAllInventory, getInventoryCategories } from "@/server/Inventory/Actions/pullActions";
import { getAllPackages } from "@/server/Packages/pullActions";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { getAllServices, getServicesCategory } from "@/server/Services/pullActions";
import React from "react";

const CreateBookingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  // Await the searchParams in Next.js 15+
  const params = await searchParams;

  const getDishes = await getAllDishes();
  const getDishCategory = await getDishCategories();
  const inventoryItems = await getAllInventory();
  const inventoryCategories = await getInventoryCategories();
  const pavilions = await getAllPavilions();
  const eventTypes = await getAllEventTypes();
  const getActiveDiscounts = await getAllDiscounts();
  const getAllModeOfPayments = await getModeOfPayments();
  const getAllServicesCategory = await getServicesCategory();
  const getServices = await getAllServices();
  const getPackages = await getAllPackages();
  const bookings = await getAllBookings();
  // const getInventory = await getAllDishes();

  // Process bookings data once to avoid creating new array reference on every render
  const processedBookings = bookings
    .filter(b => b.startAt && b.endAt)
    .map(b => ({
      startAt: b.startAt as Date,
      endAt: b.endAt as Date,
      pavilionId: b.pavilionId ?? null,
    }));

  return (
    <div className="min-h-full flex justify-center items-center bg-muted">
      <div className="flex flex-col gap-4 p-4 w-full max-w-300">
        {/* <NewAddBookings /> */}

        <AddBookingsPageClient
          allDishes={getDishes}
          dishCategories={getDishCategory}
          allInventory={inventoryItems}
          inventoryCategories={inventoryCategories}
          pavilions={pavilions}
          eventTypes={eventTypes}
          discounts={getActiveDiscounts}
          modeOfPayments={getAllModeOfPayments}
          servicesCategory={getAllServicesCategory}
          services={getServices}
          preSelectedStartDate={params.startDate as string}
          preSelectedEndDate={params.endDate as string}
          preSelectedPavilionId={params.pavilionId as string}
          preSelectedStartHour={params.startHour as string}
          preSelectedStartMinute={params.startMinute as string}
          preSelectedEndHour={params.endHour as string}
          preSelectedEndMinute={params.endMinute as string}
          preSelectedPax={params.pax as string}
          preSelectedEventName={params.eventName as string}
          preSelectedEventTypeId={params.eventTypeId as string}
          packages={getPackages}
          bookings={processedBookings}
        />
      </div>
    </div>
  );
};

export default CreateBookingsPage;
