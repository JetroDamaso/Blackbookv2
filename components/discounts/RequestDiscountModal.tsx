/**
 * Request Discount Modal
 * Modal for Manager/Front Desk to request discounts from Owner
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface RequestDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: number;
  originalAmount: number;
  onSuccess?: () => void;
}

export function RequestDiscountModal({
  open,
  onOpenChange,
  bookingId,
  originalAmount,
  onSuccess,
}: RequestDiscountModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [discountUnit, setDiscountUnit] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [justification, setJustification] = useState("");

  // Calculate final amount
  const calculateFinalAmount = () => {
    const value = parseFloat(discountValue) || 0;
    if (discountUnit === "PERCENTAGE") {
      return originalAmount - (originalAmount * value) / 100;
    } else {
      return originalAmount - value;
    }
  };

  const finalAmount = calculateFinalAmount();
  const discountAmount = originalAmount - finalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!discountValue || !justification) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const value = parseFloat(discountValue);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid discount value",
        variant: "destructive",
      });
      return;
    }

    if (discountUnit === "PERCENTAGE" && value > 100) {
      toast({
        title: "Error",
        description: "Percentage discount cannot exceed 100%",
        variant: "destructive",
      });
      return;
    }

    if (discountUnit === "FIXED" && value > originalAmount) {
      toast({
        title: "Error",
        description: "Fixed discount cannot exceed the original amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/discount-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          discountType: discountUnit === "PERCENTAGE" ? "percentage" : "fixed",
          discountValue: value,
          discountUnit,
          justification,
          originalAmount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create discount request");
      }

      toast({
        title: "Success",
        description: "Discount request submitted successfully. Awaiting Owner approval.",
      });

      onOpenChange(false);
      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error("Error submitting discount request:", error);
      toast({
        title: "Error",
        description: "Failed to submit discount request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Discount</DialogTitle>
          <DialogDescription>
            Submit a discount request for Owner approval. The Owner will be notified and can
            approve, reject, or modify your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Discount Type */}
            <div className="space-y-2">
              <Label htmlFor="discountUnit">Discount Type</Label>
              <Select
                value={discountUnit}
                onValueChange={value => setDiscountUnit(value as "PERCENTAGE" | "FIXED")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount (₱)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {discountUnit === "PERCENTAGE" ? "Percentage" : "Amount"}
              </Label>
              <Input
                id="discountValue"
                type="number"
                step="0.01"
                min="0"
                max={discountUnit === "PERCENTAGE" ? "100" : originalAmount.toString()}
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                placeholder={
                  discountUnit === "PERCENTAGE"
                    ? "Enter percentage (e.g., 15)"
                    : "Enter amount (e.g., 5000)"
                }
                required
              />
            </div>

            {/* Justification */}
            <div className="space-y-2">
              <Label htmlFor="justification">Justification *</Label>
              <Textarea
                id="justification"
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Explain why this discount is needed (e.g., Client is celebrating golden anniversary, loyal customer, etc.)"
                rows={4}
                required
              />
            </div>

            {/* Amount Summary */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-medium">₱{originalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount:</span>
                <span className="font-medium text-destructive">
                  -₱{discountAmount.toFixed(2)}
                  {discountUnit === "PERCENTAGE" && discountValue && (
                    <span className="text-muted-foreground ml-1">({discountValue}%)</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>Final Amount:</span>
                <span className="text-primary">₱{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
