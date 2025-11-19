import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getModeOfPayments } from "@/server/Billing & Payments/pullActions";
import { createBilling, createPayment } from "@/server/Billing & Payments/pushActions";
import { createBooking } from "@/server/Booking/pushActions";
import { createClient } from "@/server/clients/pushActions";
import { createMenuWithDishes } from "@/server/Menu/pushActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, CalendarPlus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type BookingData = {
  // Client data
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  region: string;
  province: string;
  municipality: string;
  barangay: string;

  // Booking data
  eventName: string;
  pavilionId: string;
  numPax: string;
  eventType: number;
  notes: string;
  startAt: Date;
  endAt: Date;
  serviceIds?: number[];
  packageId?: number;
  catering?: number;

  // Billing data
  originalPrice: number;
  discountedPrice: number;
  discountType: string;
  discountPercentage: number;
  balance: number;
  modeOfPaymentName: string;
  deposit: number;

  // Selected dishes for catering
  selectedDishes?: Array<{ id: number; quantity: number }>;
};

type CreateBookingAddPaymentProps = {
  bookingData: BookingData;
  totalAmount: number;
  onBookingCreated?: () => void;
  getFormData?: () => FormData | null; // Function to get current form data
};

const CreateBookingAddPayment = ({
  bookingData,
  totalAmount,
  onBookingCreated,
  getFormData,
}: CreateBookingAddPaymentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modeOfPayment, setModeOfPayment] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [orNumber, setOrNumber] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [paymentNotes, setPaymentNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("pending");

  const queryClient = useQueryClient();

  // Function to get complete booking data including form data
  const getCompleteBookingData = () => {
    const formData = getFormData?.();

    return {
      // Client data from form if available, otherwise from bookingData
      firstName: formData?.get("firstName")?.toString() || bookingData.firstName,
      lastName: formData?.get("lastName")?.toString() || bookingData.lastName,
      phoneNumber: formData?.get("phoneNumber")?.toString() || bookingData.phoneNumber,
      email: formData?.get("email")?.toString() || bookingData.email,
      region: bookingData.region,
      province: bookingData.province,
      municipality: bookingData.municipality,
      barangay: bookingData.barangay,

      // Booking data from form if available, otherwise from bookingData
      eventName: formData?.get("eventName")?.toString() || bookingData.eventName,
      pavilionId: String(bookingData.pavilionId),
      numPax: formData?.get("numPax")?.toString() || bookingData.numPax,
      eventType: Number(formData?.get("eventType")) || bookingData.eventType,
      notes: formData?.get("notes")?.toString() || bookingData.notes,
      startAt: bookingData.startAt,
      endAt: bookingData.endAt,
      serviceIds: bookingData.serviceIds,
      packageId: bookingData.packageId,
      catering: bookingData.catering,

      // Billing data
      originalPrice: bookingData.originalPrice,
      discountedPrice: bookingData.discountedPrice,
      discountType: bookingData.discountType,
      discountPercentage: bookingData.discountPercentage,
      balance: bookingData.balance,
      modeOfPaymentName: bookingData.modeOfPaymentName,
      deposit: bookingData.deposit,

      // Selected dishes
      selectedDishes: bookingData.selectedDishes,
    };
  };

  const { data: mopData } = useQuery({
    queryKey: ["modeOfPayments"],
    queryFn: () => getModeOfPayments(),
  });

  // Mutation for creating a complete booking with payment
  const createBookingWithPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      amount: number;
      orNumber?: string;
      modeOfPaymentId: string;
      paymentNotes?: string;
    }) => {
      const completeData = getCompleteBookingData();

      // Step 1: Create client
      const client = await createClient(
        completeData.firstName,
        completeData.lastName,
        completeData.region,
        completeData.province,
        completeData.municipality,
        completeData.barangay,
        completeData.phoneNumber,
        completeData.email
      );

      const clientId = Number(client?.id);

      // Step 2: Create booking
      const booking = await createBooking(
        completeData.eventName,
        clientId,
        completeData.pavilionId,
        completeData.numPax,
        completeData.eventType,
        completeData.notes,
        completeData.startAt,
        completeData.endAt,
        completeData.serviceIds,
        completeData.packageId,
        completeData.catering
      );

      const bookingId = Number(booking?.id);

      // Step 3: Create menu if catering is selected
      if (completeData.catering === 1 && completeData.selectedDishes && bookingId) {
        const dishIds = completeData.selectedDishes.flatMap(dish =>
          Array(dish.quantity).fill(dish.id)
        );
        await createMenuWithDishes(bookingId, dishIds);
      }

      // Step 4: Create billing
      const billing = await createBilling(
        bookingId,
        completeData.originalPrice,
        completeData.discountedPrice,
        completeData.discountType,
        completeData.discountPercentage,
        completeData.balance,
        completeData.modeOfPaymentName,
        1, // status
        completeData.deposit
      );

      const billingId = Number(billing?.id);

      // Step 5: Create payment
      const payment = await createPayment(
        billingId,
        clientId,
        paymentData.amount,
        status,
        date,
        paymentData.paymentNotes,
        paymentData.orNumber
      );

      return { booking, billing, payment };
    },
    onSuccess: () => {
      toast.success("Booking created successfully with payment!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-bookings"] }); // Refresh calendar
      onBookingCreated?.();
      handleClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });

  // Mutation for creating booking without payment
  const createBookingWithoutPaymentMutation = useMutation({
    mutationFn: async () => {
      const completeData = getCompleteBookingData();

      // Step 1: Create client
      const client = await createClient(
        completeData.firstName,
        completeData.lastName,
        completeData.region,
        completeData.province,
        completeData.municipality,
        completeData.barangay,
        completeData.phoneNumber,
        completeData.email
      );

      const clientId = Number(client?.id);

      // Step 2: Create booking
      const booking = await createBooking(
        completeData.eventName,
        clientId,
        completeData.pavilionId,
        completeData.numPax,
        completeData.eventType,
        completeData.notes,
        completeData.startAt,
        completeData.endAt,
        completeData.serviceIds,
        completeData.packageId,
        completeData.catering
      );

      const bookingId = Number(booking?.id);

      // Step 3: Create menu if catering is selected
      if (completeData.catering === 1 && completeData.selectedDishes && bookingId) {
        const dishIds = completeData.selectedDishes.flatMap(dish =>
          Array(dish.quantity).fill(dish.id)
        );
        await createMenuWithDishes(bookingId, dishIds);
      }

      // Step 4: Create billing
      const billing = await createBilling(
        bookingId,
        completeData.originalPrice,
        completeData.discountedPrice,
        completeData.discountType,
        completeData.discountPercentage,
        completeData.balance,
        completeData.modeOfPaymentName,
        1, // status
        completeData.deposit
      );

      return { booking, billing };
    },
    onSuccess: () => {
      toast.success("Booking created successfully!");
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-bookings"] }); // Refresh calendar
      onBookingCreated?.();
      handleClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to create booking: " + error.message);
    },
  });

  const handleSubmitWithPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !modeOfPayment) {
      toast.error("Please fill in all required fields");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if payment amount exceeds the total amount
    if (numericAmount > totalAmount) {
      toast.error(
        `Payment amount (₱${numericAmount.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}) cannot exceed the total amount (₱${totalAmount.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })})`
      );
      return;
    }

    createBookingWithPaymentMutation.mutate({
      amount: numericAmount,
      orNumber: orNumber.trim() || undefined,
      modeOfPaymentId: modeOfPayment,
      paymentNotes: paymentNotes.trim() || undefined,
    });
  };

  const handleSubmitWithoutPayment = () => {
    createBookingWithoutPaymentMutation.mutate();
  };

  const handleClose = () => {
    setIsOpen(false);
    setModeOfPayment("");
    setAmount("");
    setOrNumber("");
    setDate(new Date());
    setPaymentNotes("");
    setStatus("pending");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-full flex grow">
        <Button className="grow">
          <CalendarPlus /> Create Booking
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-[199]" />
        <DialogContent className="z-[200]">
          <form onSubmit={handleSubmitWithPayment}>
            <DialogHeader>
              <DialogTitle className="mb-2">Create Booking with Payment</DialogTitle>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Booking Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₱
                    {totalAmount.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
              <DialogDescription className="grid grid-cols-2 gap-4">
                <div className="gap-2 flex flex-col">
                  <Label className="font-normal">Mode of payment *</Label>
                  <Select value={modeOfPayment} onValueChange={setModeOfPayment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mode of payment" />
                    </SelectTrigger>
                    <SelectContent className="z-[201]">
                      {mopData?.map(mop => (
                        <SelectItem key={mop.id} value={mop.id.toString()}>
                          {mop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="gap-2 flex flex-col">
                  <Label className="font-normal">Amount *</Label>
                  <InputGroup>
                    <InputGroupAddon>
                      <InputGroupText>₱</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      className={
                        amount && parseFloat(amount) > totalAmount
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }
                      onKeyDown={e => {
                        if (
                          [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                          // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                          (e.keyCode === 65 && e.ctrlKey === true) ||
                          (e.keyCode === 67 && e.ctrlKey === true) ||
                          (e.keyCode === 86 && e.ctrlKey === true) ||
                          (e.keyCode === 88 && e.ctrlKey === true)
                        ) {
                          return;
                        }

                        if (
                          (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                          (e.keyCode < 96 || e.keyCode > 105) &&
                          e.keyCode !== 190 &&
                          e.keyCode !== 110
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>PHP</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {amount && parseFloat(amount) > totalAmount && (
                    <p className="text-xs text-red-500 mt-1">
                      Amount exceeds total booking amount of ₱
                      {totalAmount.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>

                <div className="gap-2 flex flex-col">
                  <Label className="font-normal">OR Number</Label>
                  <Input
                    placeholder="Official Receipt Number"
                    value={orNumber}
                    onChange={e => setOrNumber(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="font-normal">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon />
                        {format(date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[201]">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={selectedDate => setDate(selectedDate || new Date())}
                        required
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="col-span-2 gap-2 flex flex-col">
                  <Label className="font-normal">Payment Notes</Label>
                  <Textarea
                    value={paymentNotes}
                    onChange={e => setPaymentNotes(e.target.value)}
                    placeholder="Optional notes about this payment..."
                  />
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitWithoutPayment}
                disabled={createBookingWithoutPaymentMutation.isPending}
              >
                {createBookingWithoutPaymentMutation.isPending
                  ? "Creating..."
                  : "Create without payment"}
              </Button>
              <Button
                type="submit"
                disabled={
                  createBookingWithPaymentMutation.isPending ||
                  Boolean(amount && parseFloat(amount) > totalAmount)
                }
              >
                {createBookingWithPaymentMutation.isPending ? "Creating..." : "Create Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default CreateBookingAddPayment;
