import AddBookingsPageClient from "@/components/(Bookings)/(AddBookings)/page";
import {
  getAllDiscount,
  getModeOfPayments,
} from "@/server/Billing & Payments/pullActions";
import { getEventTypes } from "@/server/Booking/pullActions";
import {
  getAllDishes,
  getDishCategories,
} from "@/server/Dishes/Actions/pullActions";
import {
  getAllInventory,
  getInventoryCategories,
} from "@/server/Inventory/Actions/pullActions";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { getAllServices, getServicesCategory } from "@/server/Services/pullActions";
import React from "react";

const CreateBookingsPage = async () => {
  const getDishes = await getAllDishes();
  const getDishCategory = await getDishCategories();
  const inventoryItems = await getAllInventory();
  const inventoryCategories = await getInventoryCategories();
  const pavilions = await getAllPavilions();
  const eventTypes = await getEventTypes();
  const getAllDiscounts = await getAllDiscount();
  const getAllModeOfPayments = await getModeOfPayments();
  const getAllServicesCategory = await getServicesCategory();
  const getServices = await getAllServices();
  // const getInventory = await getAllDishes();

  return (
    <div className="">
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
      />
    </div>
  );
};

export default CreateBookingsPage;
