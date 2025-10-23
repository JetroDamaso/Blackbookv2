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
import { getBillingSummary, getModeOfPayments } from "@/server/Billing & Payments/pullActions";
import { createPayment } from "@/server/Billing & Payments/pushActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, HandCoins } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type AddPaymentDialogProps = {
  billingId: number;
  clientId: number;
};

const AddPaymentDialog = ({ billingId, clientId }: AddPaymentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modeOfPayment, setModeOfPayment] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [orNumber, setOrNumber] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<string>("pending");

  const queryClient = useQueryClient();

  const { data: mopData } = useQuery({
    queryKey: ["modeOfPayments"],
    queryFn: () => getModeOfPayments(),
  });

  const { data: billingSummary } = useQuery({
    queryKey: ["billingSummary", billingId],
    queryFn: () => getBillingSummary(billingId),
    enabled: isOpen, // Only fetch when dialog is open
  });

  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: {
      billingId: number;
      clientId: number;
      amount: number;
      orNumber?: string;
      status: string;
      date: Date;
      notes?: string;
    }) =>
      createPayment(
        paymentData.billingId,
        paymentData.clientId,
        paymentData.amount,
        paymentData.status,
        paymentData.date,
        paymentData.notes,
        paymentData.orNumber
      ),
    onSuccess: () => {
      toast.success("Payment added successfully!");
      // Invalidate all payment-related queries
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      queryClient.invalidateQueries({
        queryKey: ["paymentsByBilling", billingId],
      });
      queryClient.invalidateQueries({
        queryKey: ["billingSummary", billingId],
      });
      // Also invalidate billing data to update totals in BookingDialog
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      handleClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to add payment: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
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

    // Check if payment amount exceeds the remaining balance
    if (billingSummary && numericAmount > billingSummary.balance) {
      toast.error(
        `Payment amount (₱${numericAmount.toLocaleString("en-PH", {
          minimumFractionDigits: 2,
        })}) cannot exceed the remaining balance (₱${billingSummary.balance.toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
          }
        )})`
      );
      return;
    }

    createPaymentMutation.mutate({
      billingId,
      clientId,
      amount: numericAmount,
      orNumber: orNumber.trim() || undefined,
      status,
      date,
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setModeOfPayment("");
    setAmount("");
    setOrNumber("");
    setDate(new Date());
    setNotes("");
    setStatus("pending");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex grow">
          <HandCoins /> Add Payment
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-[199]" />
        <DialogContent className="z-[200]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="mb-4">Add Payment</DialogTitle>
              {billingSummary && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Remaining Balance: </span>₱
                    {billingSummary.balance.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              )}
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
                        billingSummary && amount && parseFloat(amount) > billingSummary.balance
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
                  {billingSummary && amount && parseFloat(amount) > billingSummary.balance && (
                    <p className="text-xs text-red-500 mt-1">
                      Amount exceeds remaining balance of ₱
                      {billingSummary.balance.toLocaleString("en-PH", {
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

                <div className="flex flex-col gap-2">
                  <Label className="font-normal">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment status" />
                    </SelectTrigger>
                    <SelectContent className="z-[201]">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 gap-2 flex flex-col">
                  <Label className="font-normal">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Optional notes about this payment..."
                  />
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createPaymentMutation.isPending ||
                  Boolean(billingSummary && amount && parseFloat(amount) > billingSummary.balance)
                }
              >
                {createPaymentMutation.isPending ? "Adding..." : "Add Payment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default AddPaymentDialog;
