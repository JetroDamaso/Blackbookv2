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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDishCategories, getAllDishes } from "@/server/Dishes/Actions/pullActions";
import { createDish, updateDish, deleteDish } from "@/server/Dishes/Actions/pushActions";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AddDishDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dishId?: number | null;
}

export function AddDishDialog({ open, onClose, onSuccess, dishId }: AddDishDialogProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [allergens, setAllergens] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!dishId;

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["dishCategories"],
    queryFn: getDishCategories,
  });

  // Fetch dish details if editing
  const { data: dishes } = useQuery({
    queryKey: ["allDishes"],
    queryFn: getAllDishes,
    enabled: isEditMode,
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && dishes) {
      const dish = dishes.find(d => d.id === dishId);
      if (dish) {
        setName(dish.name);
        setCategoryId(dish.categoryId ? dish.categoryId.toString() : "");
        setDescription(dish.description || "");
        setAllergens(dish.allergens || "");
      }
    } else {
      // Reset form for new dish
      setName("");
      setCategoryId("");
      setDescription("");
      setAllergens("");
    }
  }, [isEditMode, dishId, dishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && dishId) {
        await updateDish(
          dishId,
          name.trim(),
          parseInt(categoryId),
          description.trim() || undefined,
          allergens.trim() || undefined
        );
        toast.success("Dish updated successfully");
      } else {
        await createDish(
          name.trim(),
          parseInt(categoryId),
          description.trim() || undefined,
          allergens.trim() || undefined
        );
        toast.success("Dish created successfully");
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving dish:", error);
      toast.error(isEditMode ? "Failed to update dish" : "Failed to create dish");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!dishId) return;

    setIsDeleting(true);

    try {
      await deleteDish(dishId);
      toast.success("Dish deleted successfully");
      setShowDeleteConfirm(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting dish:", error);
      toast.error(error.message || "Failed to delete dish");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Dish" : "Add New Dish"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the dish information below."
              : "Fill in the details to create a new dish."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Dish Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Grilled Chicken"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the dish..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="allergens">Allergens</Label>
              <Input
                id="allergens"
                placeholder="e.g., Dairy, Nuts, Gluten"
                value={allergens}
                onChange={e => setAllergens(e.target.value)}
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
                <>{isEditMode ? "Update Dish" : "Create Dish"}</>
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
              This will permanently delete this dish. This action cannot be undone.
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
