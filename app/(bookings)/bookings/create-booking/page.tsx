import NewAddBookings from "@/components/(Bookings)/(AddBookings)/NewAddBookings";
import AddBookingsPageClient from "@/components/(Bookings)/(AddBookings)/page";
import {
    getAllDiscount,
    getModeOfPayments,
} from "@/server/Billing & Payments/pullActions";
import { getAllEventTypes } from "@/server/Booking/pullActions";
import { getAllBookings } from "@/server/Booking/pullActions";
import {
    getAllDishes,
    getDishCategories,
} from "@/server/Dishes/Actions/pullActions";
import {
    getAllInventory,
    getInventoryCategories,
} from "@/server/Inventory/Actions/pullActions";
import { getAllPackages } from "@/server/Packages/pullActions";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import {
    getAllServices,
    getServicesCategory,
} from "@/server/Services/pullActions";
import React from "react";

const CreateBookingsPage = async ({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
    // Await the searchParams in Next.js 15+
    const params = await searchParams;



    const getDishes = await getAllDishes();
    const getDishCategory = await getDishCategories();
    const inventoryItems = await getAllInventory();
    const inventoryCategories = await getInventoryCategories();
    const pavilions = await getAllPavilions();
    const eventTypes = await getAllEventTypes();
    const getAllDiscounts = await getAllDiscount();
    const getAllModeOfPayments = await getModeOfPayments();
    const getAllServicesCategory = await getServicesCategory();
    const getServices = await getAllServices();
    const getPackages = await getAllPackages();
    const bookings = await getAllBookings();
    // const getInventory = await getAllDishes();

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
                    discounts={getAllDiscounts}
                    modeOfPayments={getAllModeOfPayments}
                    servicesCategory={getAllServicesCategory}
                    services={getServices}
                    preSelectedStartDate={params.startDate as string}
                    preSelectedEndDate={params.endDate as string}
                    preSelectedPavilionId={params.pavilionId as string}
                    packages={getPackages}
                    bookings={bookings
                        .filter((b) => b.startAt && b.endAt)
                        .map((b) => ({
                            startAt: b.startAt as Date,
                            endAt: b.endAt as Date,
                            pavilionId: b.pavilionId ?? null,
                        }))}
                />
            </div>
        </div>
    );
};

export default CreateBookingsPage;
