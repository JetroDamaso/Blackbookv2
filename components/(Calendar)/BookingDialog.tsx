import React, { useId } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StartDatePickerForm } from "../(Bookings)/(AddBookings)/TimeDatePicker/startDatePicker";
import { EndDatePickerForm } from "../(Bookings)/(AddBookings)/TimeDatePicker/endDatePicker";
import TimeStartPickerCreateBookingComponent from "../(Bookings)/(AddBookings)/TimeDatePicker/timeStartPicker";
import TimeEndPickerCreateBookingComponent from "../(Bookings)/(AddBookings)/TimeDatePicker/timeEndPicker";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "../ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { getBookingsById } from "@/server/Booking/pullActions";
import { getClientsById } from "@/server/clients/pullActions";
import {
  getBillingById,
  getEventTypeById,
} from "@/server/Billing & Payments/pullActions";
import {
  getMenuByBookingId,
  getDishesByMenuId,
} from "@/server/Menu/pullActions";
import {
  getServicesByBooking,
  getServicesCategory,
} from "@/server/Services/pullActions";
import { getPavilionsById } from "@/server/Pavilions/Actions/pullActions";
import { getPackagesById } from "@/server/Packages/pullActions";
import AddPaymentDialog from "../(Payments)/AddPaymentDialog";
import ViewPaymentDialog from "../(Payments)/ViewPaymentDialog";

// Removed placeholder items; real data queried below

export default function BookingDialogComponent({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: bookingData, isPending: bookingLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingsById(bookingId),
  });

  const booking = bookingData?.[0];

  const { data: clientData, isPending: clientLoading } = useQuery({
    queryKey: ["client", bookingId],
    queryFn: () => getClientsById(Number(booking?.clientId)),
    enabled: !!booking?.clientId,
  });

  const { data: eventTypeData, isPending: eventTypeLoading } = useQuery({
    queryKey: ["eventType", bookingId],
    queryFn: () => getEventTypeById(Number(booking?.eventType)),
    enabled: !!booking?.eventType,
  });

  const eventType = eventTypeData?.[0];

  const { data: pavilionData, isPending: pavilionLoading } = useQuery({
    queryKey: ["pavilion", bookingId],
    queryFn: () => getPavilionsById(Number(booking?.pavilionId)),
    enabled: !!booking?.pavilionId,
  });

  const pavilion = pavilionData?.[0];

  const { data: packageData, isPending: packageLoading } = useQuery({
    queryKey: ["package", bookingId],
    queryFn: () => getPackagesById(Number(booking?.packageId)),
    enabled: !!booking?.packageId,
  });

  const packages = packageData?.[0];

  const { data: billingData, isPending: billingLoading } = useQuery({
    queryKey: ["billing", booking?.id],
    queryFn: () => getBillingById(Number(booking?.id)),
    enabled: !!booking?.id, // ← ✅ correct dependency
  });

  const billing = billingData?.[0];

  // (Other services categories not currently used for dishes table)

  // Query menu for this booking (assuming at most one active menu)
  const { data: menuData } = useQuery({
    queryKey: ["menu", booking?.id],
    queryFn: () => getMenuByBookingId(Number(booking?.id)),
    enabled: !!booking?.id,
  });

  const menu = menuData?.[0];

  // Query dishes belonging to the menu
  const { data: menuDishes } = useQuery({
    queryKey: ["menuDishes", menu?.id],
    queryFn: () => getDishesByMenuId(Number(menu?.id)),
    enabled: !!menu?.id,
  });

  interface DishRow {
    id: number;
    name: string;
    categoryName: string;
    quantity: number;
  }

  const dishesJoined: DishRow[] = (menuDishes || []).map(
    (dish: {
      id: number;
      name: string;
      categoryName?: string;
      quantity: number;
    }) => ({
      id: dish.id,
      name: dish.name,
      categoryName: dish.categoryName ?? "—",
      quantity: dish.quantity ?? 1,
    })
  );

  // Other services & their categories
  const { data: otherServicesData } = useQuery({
    queryKey: ["otherServices", booking?.id],
    queryFn: () => getServicesByBooking(Number(booking?.id)),
    enabled: !!booking?.id,
  });

  const { data: serviceCategoriesData } = useQuery({
    queryKey: ["serviceCategories"],
    queryFn: () => getServicesCategory(),
  });

  interface OtherServiceRow {
    id: number;
    name: string;
    categoryName: string;
  }

  const bookingOtherServices: OtherServiceRow[] = (otherServicesData || []).map(
    (srv: { id: number; name: string; categoryId?: number | null }) => {
      const category = serviceCategoriesData?.find(
        (c: { id: number; name: string }) => c.id === srv.categoryId
      );
      return {
        id: srv.id,
        name: srv.name,
        categoryName: category?.name ?? "—",
      };
    }
  );

  const id = useId();

  const handleClose = () => onOpenChange(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={handleClose} />
      <div
        className="relative w-auto h-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-[calc(100%-5rem)] max-h-[calc(100%-2rem)] sm:max-h-[calc(100%-3rem)] md:max-h-[calc(100%-5rem)] overflow-y-auto rounded-xl border bg-neutral-100 p-3 sm:p-4 shadow-lg"
        data-booking-id={String(bookingId)}
      >
        {clientLoading ||
        billingLoading ||
        bookingLoading ||
        packageLoading ||
        eventTypeLoading ||
        pavilionLoading ? (
          <p>loading</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 h-[70vh]">
            <div className="flex flex-col border-1 p-4 rounded-md bg-white min-h-0">
              <p className="text-md font-medium mb-2">{`Booking ID: ${bookingId}`}</p>
              <div className="min-w-30 max-w-40 [--ring:var(--color-indigo-300)] in-[.dark]:[--ring:var(--color-indigo-900)]">
                <Label className="mr-2 font-normal">Status</Label>
                <Select defaultValue="1">
                  <SelectTrigger id={id}>
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">React</SelectItem>
                    <SelectItem value="2">Next.js</SelectItem>
                    <SelectItem value="3">Astro</SelectItem>
                    <SelectItem value="4">Gatsby</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-md font-medium mt-4">Event Details: </p>
              <div className="flex gap-2 mt-4">
                <StartDatePickerForm
                  initialDate={
                    booking?.startAt
                      ? typeof booking.startAt === "string"
                        ? booking.startAt
                        : (booking.startAt as Date)
                      : null
                  }
                />
                <EndDatePickerForm
                  initialDate={
                    booking?.endAt
                      ? typeof booking.endAt === "string"
                        ? booking.endAt
                        : (booking.endAt as Date)
                      : null
                  }
                />
              </div>
              <div className="mt-4 flex w-full gap-2">
                <div className="flex-1 min-w-0">
                  <TimeStartPickerCreateBookingComponent
                    initialDateTime={
                      booking?.startAt
                        ? typeof booking.startAt === "string"
                          ? booking.startAt
                          : (booking.startAt as Date)
                        : null
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <TimeEndPickerCreateBookingComponent
                    initialDateTime={
                      booking?.endAt
                        ? typeof booking.endAt === "string"
                          ? booking.endAt
                          : (booking.endAt as Date)
                        : null
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="font-normal">Event Name</Label>
                <Input
                  className="mt-2"
                  placeholder="Event Name"
                  type="text"
                  defaultValue={booking?.eventName ?? ""}
                />
              </div>
              <div className="flex gap-2">
                <div className="mt-4 grow">
                  <Label className="font-normal">Event type</Label>
                  <Input
                    className="mt-2"
                    placeholder="Event type"
                    type="text"
                    defaultValue={eventType?.name ?? ""}
                  />
                </div>
                <div className="mt-4 grow">
                  <Label className="font-normal">No. of pax</Label>
                  <Input
                    className="mt-2"
                    placeholder="No. of pax"
                    type="text"
                    defaultValue={booking?.totalPax ?? ""}
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label className="font-normal">Notes</Label>
                <div className="*:not-first:mt-2">
                  <Textarea
                    name="notes"
                    placeholder="Leave a comment"
                    value={booking?.notes ?? ""}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col border-1 p-4 rounded-md bg-white min-h-0 overflow-hidden">
              <p className="text-md font-medium">Pavilion Details: </p>

              <div className="flex w-full gap-2">
                <div className="grow [--ring:var(--color-indigo-300)] in-[.dark]:[--ring:var(--color-indigo-900)]">
                  <Label className="mr-2 font-normal">Pavilion</Label>
                  <div className="">
                    <Input
                      className="mt-2"
                      placeholder="pavilion"
                      type="text"
                      defaultValue={pavilion?.name ?? ""}
                    />
                  </div>
                </div>
                <div className="grow [--ring:var(--color-indigo-300)] in-[.dark]:[--ring:var(--color-indigo-900)]">
                  <Label className="mr-2 font-normal">Package</Label>
                  <div className="">
                    <Input
                      className="mt-2"
                      placeholder="package"
                      type="text"
                      defaultValue={packages?.name ?? ""}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-md font-medium">Catering: </p>
                <Input className="mt-2" placeholder="Event Name" type="text" />
              </div>
              <div className="flex gap-2">
                <div className="w-full">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full -space-y-px"
                    defaultValue="3"
                  >
                    <AccordionItem
                      value="1"
                      className="mt-2 w-full grow bg-background has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative border px-3 outline-none first:rounded-t-md last:rounded-b-md last:border-b has-focus-visible:z-10 has-focus-visible:ring-[3px]"
                    >
                      <AccordionTrigger className="w-full grow py-2 text-[15px] hover:no-underline focus-visible:ring-0">
                        <p className="text-md font-normal">Dishes</p>
                      </AccordionTrigger>
                      <AccordionContent key={"1"} className="pb-2">
                        <div className="max-h-56 overflow-y-auto pr-1">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white shadow-sm">
                              <TableRow className="hover:bg-transparent">
                                <TableHead>Dish</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Quantity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dishesJoined.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={3} className="">
                                    No dishes/services recorded
                                  </TableCell>
                                </TableRow>
                              )}
                              {dishesJoined.map((dish) => (
                                <TableRow key={dish.id}>
                                  <TableCell className="font-medium">
                                    {dish.name}
                                  </TableCell>
                                  <TableCell>{dish.categoryName}</TableCell>
                                  <TableCell>{dish.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            <TableFooter className="bg-transparent"></TableFooter>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
              <p className="text-md font-medium mt-4">Other Services: </p>
              <div className="border-1 rounded-md mt-2 flex-grow min-h-0 overflow-y-auto pr-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>Service Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingOtherServices.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-muted-foreground"
                        >
                          No other services
                        </TableCell>
                      </TableRow>
                    )}
                    {bookingOtherServices.map((srv) => (
                      <TableRow key={srv.id}>
                        <TableCell className="font-medium">
                          {srv.name}
                        </TableCell>
                        <TableCell>{srv.categoryName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-transparent"></TableFooter>
                </Table>
              </div>
            </div>
            <div className="flex flex-col border-1 p-4 rounded-md bg-white">
              <p className="text-md font-medium">Client Info: </p>
              <div className="flex gap-2 mt-4">
                <div className=" grow">
                  <Label className="font-normal">First Name</Label>
                  <Input
                    className="mt-2"
                    placeholder="First Name"
                    type="text"
                    defaultValue={clientData?.firstName || ""}
                  />
                </div>
                <div className="grow">
                  <Label className="font-normal">Last Name</Label>
                  <Input
                    className="mt-2"
                    placeholder="Last Name"
                    type="text"
                    defaultValue={clientData?.lastName || ""}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="font-normal">Number</Label>
                <Input
                  className="mt-2"
                  placeholder="Number"
                  type="text"
                  defaultValue={clientData?.phoneNumber || ""}
                />
              </div>
              <div className="mt-4">
                <Label className="font-normal">Address</Label>
                <Input
                  className="mt-2"
                  placeholder="Last Name"
                  type="text"
                  defaultValue={`${clientData?.region}, ${clientData?.province}, ${clientData?.municipality}, ${clientData?.barangay}`}
                />
              </div>
              <div className="flex gap-2 w-full">
                <div className="mt-4 grow">
                  <Label className="font-normal">Mode of Payment</Label>
                  <Input
                    className="mt-2"
                    placeholder="Mode of Payment"
                    type="text"
                    defaultValue={billing?.modeOfPayment}
                  />
                </div>
                <div className="mt-4 grow">
                  <Label className="font-normal">Discount</Label>
                  <Input
                    className="mt-2"
                    placeholder="Discount"
                    type="text"
                    defaultValue={billing?.discountType}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="grid grid-cols-2 mt-2 divide-x divide-neutral-200">
                  <div className="w-full px-2">
                    <p className="text-md font-medium mb-2">Billing Info: </p>
                    <div className="gap-2 flex flex-col">
                      <div className="w-full grow flex-1">
                        <ViewPaymentDialog
                          billingId={billing?.id || 0}
                          clientId={booking?.clientId || 0}
                        />
                      </div>
                      <div className="w-full grow flex-1">
                        <AddPaymentDialog
                          billingId={billing?.id || 0}
                          clientId={booking?.clientId || 0}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full px-2">
                    <p className="text-md font-medium">Totals: </p>
                    <div className="">
                      <Label className="font-normal">Original Price</Label>
                      <Input
                        className="text-end"
                        placeholder="Original Price"
                        type="text"
                        defaultValue={billing?.originalPrice}
                      />
                    </div>
                    <div className="">
                      <Label className="font-normal">Discounted Price</Label>
                      <Input
                        className="text-end"
                        placeholder="Discounted Price"
                        type="text"
                        defaultValue={billing?.discountedPrice}
                      />
                    </div>
                    <div className="mt-1">
                      <Label className="font-normal">Downpayment</Label>
                      <Input
                        className="text-end"
                        placeholder="Downpayment"
                        type="text"
                        defaultValue={billing?.deposit}
                      />
                    </div>
                    <div className="mt-1">
                      <Label className="font-normal">Balance</Label>
                      <Input
                        className="text-end"
                        placeholder="Balance"
                        type="text"
                        defaultValue={billing?.balance}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Okay
          </button>
        </div>
      </div>
    </div>
  );
}

{
  /* <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        Choose a color
      </legend>
      <RadioGroup className="flex gap-1.5" defaultValue="blue">
        <RadioGroupItem
          value="blue"
          aria-label="Blue"
          className="size-6 border-blue-500 bg-blue-500 shadow-none data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
        />
        <RadioGroupItem
          value="indigo"
          aria-label="Indigo"
          className="size-6 border-indigo-500 bg-indigo-500 shadow-none data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
        />
        <RadioGroupItem
          value="pink"
          aria-label="Pink"
          className="size-6 border-pink-500 bg-pink-500 shadow-none data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-500"
        />
        <RadioGroupItem
          value="red"
          aria-label="red"
          className="size-6 border-red-500 bg-red-500 shadow-none data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
        />
        <RadioGroupItem
          value="orange"
          aria-label="orange"
          className="size-6 border-orange-500 bg-orange-500 shadow-none data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
        />
        <RadioGroupItem
          value="amber"
          aria-label="amber"
          className="size-6 border-amber-500 bg-amber-500 shadow-none data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
        />
        <RadioGroupItem
          value="emerald"
          aria-label="emerald"
          className="size-6 border-emerald-500 bg-emerald-500 shadow-none data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
        />
      </RadioGroup>
    </fieldset> */
}
