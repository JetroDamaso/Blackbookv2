"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInventoryCategories, getAllInventory } from "@/server/Inventory/Actions/pullActions";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/server/Inventory/Actions/pushActions";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AddInventoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inventoryId?: number | null;
}

export function AddInventoryDialog({
  open,
  onClose,
  onSuccess,
  inventoryId,
}: AddInventoryDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!inventoryId;

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["inventoryCategories"],
    queryFn: getInventoryCategories,
  });

  // Fetch inventory details if editing
  const { data: inventoryItems } = useQuery({
    queryKey: ["allInventory"],
    queryFn: getAllInventory,
    enabled: isEditMode,
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && inventoryItems) {
      const item = inventoryItems.find(i => i.id === inventoryId);
      if (item) {
        setName(item.name);
        setCategoryId(item.categoryId ? item.categoryId.toString() : "");
        setQuantity(item.quantity.toString());
      }
    } else {
      // Reset form for new item
      setName("");
      setCategoryId("");
      setQuantity("");
    }
  }, [isEditMode, inventoryId, inventoryItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !quantity.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && inventoryId) {
        await updateInventoryItem(
          inventoryId,
          name.trim(),
          categoryId ? parseInt(categoryId) : null,
          quantityNum
        );
        toast.success("Inventory item updated successfully");
      } else {
        await createInventoryItem(
          name.trim(),
          categoryId ? parseInt(categoryId) : null,
          quantityNum
        );
        toast.success("Inventory item created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      toast.error(isEditMode ? "Failed to update item" : "Failed to create item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!inventoryId) return;

    setIsDeleting(true);

    try {
      await deleteInventoryItem(inventoryId);
      toast.success("Inventory item deleted successfully");
      setShowDeleteConfirm(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting inventory item:", error);
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Inventory Item" : "Add New Inventory Item"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the inventory item information below."
              : "Fill in the details to create a new inventory item."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Chairs, Tables, Linens"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Category</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                placeholder="e.g., 100"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEditMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting || isSubmitting}
                className="mr-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditMode ? "Update Item" : "Create Item"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this inventory item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
