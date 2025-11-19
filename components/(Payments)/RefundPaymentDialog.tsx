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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getPaymentsByBilling } from "@/server/Billing & Payments/pullActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Undo2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type RefundPaymentDialogProps = {
  billingId: number;
};

const RefundPaymentDialog = ({ billingId }: RefundPaymentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [refundReason, setRefundReason] = useState<string>("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payments", billingId],
    queryFn: async () => {
      // Fetch all payments by passing a large page size (1000 should be more than enough)
      const result = await getPaymentsByBilling(billingId, 1, 1000);
      return result?.data || [];
    },
    enabled: isOpen && !!billingId,
  });

  const payments = paymentsData || [];

  // Calculate total payment amount (only positive payments that aren't refunded)
  const totalPayments = payments
    .filter((p: any) => p.status !== "refunded" && p.amount > 0)
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  // Calculate total already refunded (absolute value of negative amounts)
  const totalRefunded = Math.abs(
    payments
      .filter((p: any) => p.status === "refund" && p.amount < 0)
      .reduce((sum: number, p: any) => sum + p.amount, 0)
  );

  // Net amount available for refund
  const totalPaymentAmount = totalPayments - totalRefunded;

  const refundPaymentMutation = useMutation({
    mutationFn: async (data: { billingId: number; reason: string; refundAmount?: number; isFullRefund: boolean }) => {
      const response = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to refund payment");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Payment refunded successfully");

      // Invalidate all payment and booking related queries
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["allPayments"] });
      queryClient.invalidateQueries({ queryKey: ["paymentsByBilling", billingId] });
      queryClient.invalidateQueries({ queryKey: ["billingSummary"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
      queryClient.invalidateQueries({ queryKey: ["booking"] }); // Refresh booking status
      queryClient.invalidateQueries({ queryKey: ["calendar-bookings"] }); // Refresh calendar

      handleClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to refund payment: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!refundReason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    if (refundType === "partial") {
      const refundAmountNum = parseFloat(refundAmount);

      if (!refundAmount || isNaN(refundAmountNum) || refundAmountNum <= 0) {
        toast.error("Please enter a valid refund amount");
        return;
      }

      if (refundAmountNum > totalPaymentAmount) {
        toast.error("Refund amount cannot exceed the total payment amount");
        return;
      }

      refundPaymentMutation.mutate({
        billingId: billingId,
        reason: refundReason.trim(),
        refundAmount: refundAmountNum,
        isFullRefund: false,
      });
    } else {
      // Full refund
      refundPaymentMutation.mutate({
        billingId: billingId,
        reason: refundReason.trim(),
        isFullRefund: true,
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setRefundReason("");
    setRefundType("full");
    setRefundAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full flex grow" variant="destructive">
          <Undo2 className="w-4 h-4 mr-2" />
          Refund Payment
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-[10099]" />
        <DialogContent className="z-[10100] max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="mb-4">Refund Payment</DialogTitle>
              <DialogDescription className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : totalPaymentAmount <= 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <p className="text-sm">No payments available to refund</p>
                  </div>
                ) : (
                  <>


                    <div className="space-y-2">

                      <RadioGroup value={refundType} onValueChange={(value: any) => setRefundType(value)} className="flex">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="full" id="full" />
                          <Label htmlFor="full" className="font-normal cursor-pointer">
                            Full Refund
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="partial" id="partial" />
                          <Label htmlFor="partial" className="font-normal cursor-pointer">
                            Partial Refund
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {refundType === "partial" && (
                      <div className="space-y-2">
                        <Label className="font-normal">
                          Refund Amount <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={totalPaymentAmount}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          placeholder="Enter amount to refund"
                          required={refundType === "partial"}
                        />
                        <p className="text-xs text-gray-500">
                          Maximum: ₱{totalPaymentAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="font-normal">
                        Reason for Refund <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={refundReason}
                        onChange={e => setRefundReason(e.target.value)}
                        placeholder="e.g., Event was canceled, Payment error, Customer request..."
                        rows={4}
                        required
                      />
                    </div>


                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {totalPaymentAmount > 0 && (
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={refundPaymentMutation.isPending}
                >
                  {refundPaymentMutation.isPending ? "Processing..." : "Refund Payment"}
                </Button>
              </DialogFooter>
            )}
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default RefundPaymentDialog;
