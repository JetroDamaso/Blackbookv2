import ManageMainPage from "@/components/(Manage)/ManageMainPage";
import BookingsPage from "../(bookings)/bookings/page";
import ManageBookings from "./bookings/page";

export default function ManagePage() {
  return (
    <div className="overflow-hidden bg-muted">
      <ManageBookings />
    </div>
  );
}
