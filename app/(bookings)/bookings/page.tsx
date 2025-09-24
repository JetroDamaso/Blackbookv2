import BookingsPageClient from "@/components/(Bookings)/page";
import { getAllBookings } from "@/server/Booking/pullActions";

export default async function BookingsPage() {
  const bookings = await getAllBookings();
  return <BookingsPageClient bookings={bookings} />;
  
}
