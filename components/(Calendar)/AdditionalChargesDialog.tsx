"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getAdditionalChargesByBookingId } from "@/server/additionalcharge/pullActions";
import {
  createAdditionalCharge,
  deleteAdditionalCharge,
} from "@/server/additionalcharge/pushActions";

interface AdditionalChargesDialogProps {
  bookingId: number;
}

export default function AdditionalChargesDialog({ bookingId }: AdditionalChargesDialogProps) {
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: charges = [], isLoading } = useQuery({
    queryKey: ["additionalCharges", bookingId],
    queryFn: () => getAdditionalChargesByBookingId(bookingId),
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error("Please fill in all required fields with valid values");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdditionalCharge({
        bookingId,
        name: name.trim(),
        amount: parseFloat(amount),
        note: note.trim() || undefined,
      });

      toast.success("Additional charge added successfully");

      // Reset form
      setName("");
      setAmount("");
      setNote("");
      setShowAddForm(false);

      // Refetch data
      queryClient.invalidateQueries({ queryKey: ["additionalCharges", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["billingSummary"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    } catch (error) {
      toast.error("Failed to add additional charge");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this charge?")) return;

    try {
      await deleteAdditionalCharge(id);
      toast.success("Additional charge deleted successfully");

      // Refetch data
      queryClient.invalidateQueries({ queryKey: ["additionalCharges", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["billingSummary"] });
      queryClient.invalidateQueries({ queryKey: ["billing"] });
    } catch (error) {
      toast.error("Failed to delete additional charge");
      console.error(error);
    }
  };

  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-center gap-2">
          <DollarSign className="w-4 h-4" />
          Additional Charges
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="z-[10099]" />
        <DialogContent className="z-[10100] max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Additional Charges</DialogTitle>
            <DialogDescription>
              Manage extra charges for broken items, damages, or other miscellaneous fees
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Summary */}
            {charges.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">
                    Total Additional Charges:
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    ₱{totalCharges.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Add New Charge Button */}
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)} className="w-full" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add New Charge
              </Button>
            )}

            {/* Add Form */}
            {showAddForm && (
              <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-gray-50 space-y-4">
                <h3 className="font-semibold text-sm">New Additional Charge</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="charge-name">
                      Item/Service Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="charge-name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., Broken glass, Extra service"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="charge-amount">
                      Amount (₱) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="charge-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="charge-note">Note (Optional)</Label>
                  <Textarea
                    id="charge-note"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Add any additional details..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setName("");
                      setAmount("");
                      setNote("");
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Charge"}
                  </Button>
                </div>
              </form>
            )}

            {/* Charges List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Existing Charges</h3>
              <ScrollArea className="max-h-[40vh] border rounded-lg">
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : charges.length === 0 ? (
                  <div className="text-center p-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No additional charges yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {charges.map(charge => (
                      <div key={charge.id} className="p-4 hover:bg-gray-50 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{charge.name}</h4>
                            </div>
                            {charge.note && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {charge.note}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-semibold text-sm whitespace-nowrap">
                              ₱{charge.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(charge.id)}
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
