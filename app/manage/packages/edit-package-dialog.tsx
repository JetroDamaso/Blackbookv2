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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { updatePackage } from "@/server/Packages/pushActions";
import { getPackagesById } from "@/server/Packages/pullActions";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditPackageDialogProps {
  packageId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPackageDialog({ packageId, open, onOpenChange }: EditPackageDialogProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [pavilionId, setPavilionId] = useState("");
  const [includePool, setIncludePool] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch package data when dialog opens
  const { data: packageData, isLoading } = useQuery({
    queryKey: ["package", packageId],
    queryFn: () => getPackagesById(packageId!),
    enabled: open && packageId !== null,
  });

  // Fetch pavilions for dropdown
  const { data: pavilions } = useQuery({
    queryKey: ["allPavilions"],
    queryFn: () => getAllPavilions(),
    enabled: open,
  });

  // Populate form when package data is loaded
  useEffect(() => {
    if (packageData) {
      setName(packageData.name || "");
      setPrice(packageData.price?.toString() || "");
      setDescription(packageData.description || "");
      setPavilionId(packageData.pavilionId?.toString() || "");
      setIncludePool(packageData.includePool || false);
      setErrors({});
    }
  }, [packageData]);

  const updatePackageMutation = useMutation({
    mutationFn: async () => {
      if (!packageId) return;

      // Validate fields
      const newErrors: Record<string, string> = {};

      if (!name.trim()) {
        newErrors.name = "Package name is required";
      }

      if (!price || parseFloat(price) <= 0) {
        newErrors.price = "Price must be greater than 0";
      }

      if (!description.trim()) {
        newErrors.description = "Description is required";
      }

      if (!pavilionId) {
        newErrors.pavilionId = "Pavilion is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Validation failed");
      }

      await updatePackage(
        packageId,
        name.trim(),
        parseFloat(price),
        description.trim(),
        parseInt(pavilionId),
        includePool
      );
    },
    onSuccess: () => {
      toast.success("Package updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allPackages"] });
      queryClient.invalidateQueries({ queryKey: ["package", packageId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update package");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePackageMutation.mutate();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    switch (field) {
      case "name":
        setName(value as string);
        break;
      case "price":
        if (typeof value === "string" && /^\d*\.?\d*$/.test(value)) {
          setPrice(value);
        }
        break;
      case "description":
        setDescription(value as string);
        break;
      case "pavilionId":
        setPavilionId(value as string);
        break;
      case "includePool":
        setIncludePool(value as boolean);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update the package details. Click save when you're done.
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
                  Package Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Premium Package"
                  value={name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={updatePackageMutation.isPending}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-pavilion">
                  Pavilion <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={pavilionId}
                  onValueChange={value => handleInputChange("pavilionId", value)}
                  disabled={updatePackageMutation.isPending}
                >
                  <SelectTrigger className={errors.pavilionId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a pavilion" />
                  </SelectTrigger>
                  <SelectContent>
                    {pavilions?.map(pavilion => (
                      <SelectItem key={pavilion.id} value={pavilion.id.toString()}>
                        {pavilion.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pavilionId && (
                  <span className="text-xs text-red-500">{errors.pavilionId}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-price">
                  Price <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-price"
                  type="text"
                  inputMode="decimal"
                  placeholder="e.g., 15000"
                  value={price}
                  onChange={e => handleInputChange("price", e.target.value)}
                  className={errors.price ? "border-red-500" : ""}
                  disabled={updatePackageMutation.isPending}
                />
                {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder="Describe the package features, inclusions, etc."
                  value={description}
                  onChange={e => handleInputChange("description", e.target.value)}
                  className={errors.description ? "border-red-500" : ""}
                  rows={3}
                  disabled={updatePackageMutation.isPending}
                />
                {errors.description && (
                  <span className="text-xs text-red-500">{errors.description}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-includePool"
                  checked={includePool}
                  onCheckedChange={(checked) => handleInputChange("includePool", !!checked)}
                  disabled={updatePackageMutation.isPending}
                />
                <Label
                  htmlFor="edit-includePool"
                  className="text-sm font-normal cursor-pointer"
                >
                  Include pool access
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updatePackageMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updatePackageMutation.isPending || isLoading}>
              {updatePackageMutation.isPending ? (
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
