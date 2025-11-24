"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateModeOfPayment } from "@/server/modeofpayment/pushActions";
import { getModeOfPaymentById } from "@/server/modeofpayment/pullActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditModeOfPaymentDialogProps {
  paymentMethodId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModeOfPaymentDialog({ paymentMethodId, open, onOpenChange }: EditModeOfPaymentDialogProps) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const { data: paymentMethodData, isLoading } = useQuery({
    queryKey: ["modeOfPayment", paymentMethodId],
    queryFn: () => getModeOfPaymentById(paymentMethodId!),
    enabled: open && paymentMethodId !== null,
  });

  useEffect(() => {
    if (paymentMethodData) {
      setName(paymentMethodData.name || "");
      setErrors({});
    }
  }, [paymentMethodData]);

  const updatePaymentMethodMutation = useMutation({
    mutationFn: async () => {
      if (!paymentMethodId) return;

      if (!name.trim()) {
        setErrors({ name: "Payment method name is required" });
        throw new Error("Validation failed");
      }

      await updateModeOfPayment(paymentMethodId, name.trim());
    },
    onSuccess: () => {
      toast.success("Payment method updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allModeOfPayments"] });
      queryClient.invalidateQueries({ queryKey: ["modeOfPayment", paymentMethodId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update payment method");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentMethodMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>
              Update the payment method name. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  Payment Method Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Cash"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.name;
                        return newErrors;
                      });
                    }
                  }}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={updatePaymentMethodMutation.isPending}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePaymentMethodMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePaymentMethodMutation.isPending || isLoading}>
              {updatePaymentMethodMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
