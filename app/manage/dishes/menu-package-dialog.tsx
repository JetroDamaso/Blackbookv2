"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createMenuPackage,
  updateMenuPackage,
  deleteMenuPackage,
} from "@/server/menuPackages/pushActions";
import { getMenuPackageById } from "@/server/menuPackages/pullActions";
import { getDishCategories } from "@/server/Dishes/Actions/pullActions";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MenuPackageDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageId: number | null;
}

export function MenuPackageDialog({
  open,
  onClose,
  onSuccess,
  packageId,
}: MenuPackageDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    allowedCategoryIds: [] as number[],
  });

  const isEditMode = packageId !== null;

  // Fetch package data if editing
  const { data: packageData } = useQuery({
    queryKey: ["menuPackage", packageId],
    queryFn: () => getMenuPackageById(packageId!),
    enabled: isEditMode && open,
  });

  // Fetch all dish categories
  const { data: categoriesData } = useQuery({
    queryKey: ["dishCategories"],
    queryFn: () => getDishCategories(),
    enabled: open,
  });

  // Load package data when editing
  useEffect(() => {
    if (packageData && isEditMode) {
      setFormData({
        name: packageData.name || "",
        price: packageData.price?.toString() || "",
        description: packageData.description || "",
        allowedCategoryIds: packageData.allowedCategories?.map((cat: any) => cat.id) || [],
      });
    }
  }, [packageData, isEditMode]);

  // Reset form when dialog closes or opens for new package
  useEffect(() => {
    if (!open || !isEditMode) {
      setFormData({
        name: "",
        price: "",
        description: "",
        allowedCategoryIds: [],
      });
    }
  }, [open, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      createMenuPackage(
        data.name,
        parseFloat(data.price),
        data.allowedCategoryIds.length, // maxDishes = number of selected categories
        data.allowedCategoryIds,
        data.description || undefined
      ),
    onSuccess: () => {
      toast.success("Menu package created successfully!");
      queryClient.invalidateQueries({ queryKey: ["menuPackages"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create menu package");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      updateMenuPackage(
        packageId!,
        data.name,
        parseFloat(data.price),
        data.allowedCategoryIds.length, // maxDishes = number of selected categories
        data.allowedCategoryIds,
        data.description || undefined
      ),
    onSuccess: () => {
      toast.success("Menu package updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["menuPackages"] });
      queryClient.invalidateQueries({ queryKey: ["menuPackage", packageId] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update menu package");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteMenuPackage(packageId!),
    onSuccess: () => {
      toast.success("Menu package deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["menuPackages"] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete menu package");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter a package name");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (formData.allowedCategoryIds.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this menu package?")) {
      deleteMutation.mutate();
    }
  };

  const toggleCategory = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      allowedCategoryIds: prev.allowedCategoryIds.includes(categoryId)
        ? prev.allowedCategoryIds.filter(id => id !== categoryId)
        : [...prev.allowedCategoryIds, categoryId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Menu Package" : "Create Menu Package"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the menu package details below."
              : "Create a new menu package with allowed dish categories and limits."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium Menu Package"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (₱) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Package details..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Allowed Categories *</Label>
              <p className="text-sm text-muted-foreground">
                Select which dish categories are included in this package. Max dishes will be set to the number of categories selected ({formData.allowedCategoryIds.length} {formData.allowedCategoryIds.length === 1 ? 'dish' : 'dishes'}).
              </p>
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-3">
                  {categoriesData?.map((category: any) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={formData.allowedCategoryIds.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {isEditMode && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditMode
                  ? "Update"
                  : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
