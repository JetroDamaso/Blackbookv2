"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { getInventoryCategories } from "@/server/Inventory/Actions/pullActions";
import {
  createInventoryCategory,
  updateInventoryCategory,
  deleteInventoryCategory,
} from "@/server/Inventory/Actions/pushActions";
import { Loader2, Trash2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ManageCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManageCategoriesDialog({ open, onClose, onSuccess }: ManageCategoriesDialogProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, refetch } = useQuery({
    queryKey: ["inventoryCategories"],
    queryFn: getInventoryCategories,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsSubmitting(true);

    try {
      await createInventoryCategory(newCategoryName.trim());
      toast.success("Category created successfully");
      setNewCategoryName("");
      refetch();
      onSuccess();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateInventoryCategory(id, editingName.trim());
      toast.success("Category updated successfully");
      setEditingId(null);
      setEditingName("");
      refetch();
      onSuccess();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await deleteInventoryCategory(id);
      toast.success("Category deleted successfully");
      refetch();
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.message || "Failed to delete category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Inventory Categories</DialogTitle>
          <DialogDescription>
            Create, edit, or delete inventory categories. Categories help organize your inventory
            items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Category Form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="New category name..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </form>

          {/* Categories List */}
          <div className="border rounded-lg divide-y max-h-[400px] overflow-y-auto">
            {categories && categories.length > 0 ? (
              categories.map(category => (
                <div key={category.id} className="p-3 flex items-center gap-2">
                  {editingId === category.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(category.id)}
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isSubmitting}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <p className="font-medium">{category.name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(category.id, category.name)}
                        disabled={isSubmitting}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No categories yet. Create your first category above.
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
