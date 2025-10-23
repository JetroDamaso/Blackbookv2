"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorPicker } from "@/components/ui/shadcn-io/color-picker";
import { Textarea } from "@/components/ui/textarea";
import { createPavilion } from "@/server/Pavilions/Actions/pushActions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CirclePlus, Loader2, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AddPavilionDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6"); // Default blue color
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const createPavilionMutation = useMutation({
    mutationFn: async () => {
      // Validate fields
      const newErrors: Record<string, string> = {};

      if (!name.trim()) {
        newErrors.name = "Pavilion name is required";
      }

      if (!maxCapacity || parseInt(maxCapacity) <= 0) {
        newErrors.maxCapacity = "Max capacity must be greater than 0";
      }

      if (!description.trim()) {
        newErrors.description = "Description is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        // Don't close dialog, don't proceed
        return { success: false, error: "Validation failed" };
      }

      const parsedMaxPax = parseInt(maxCapacity, 10);

      // Ensure color is a string hex
      const safeColor = typeof color === "string" ? color : "#ffffff";
      const result = await createPavilion(
        name.trim(),

        isNaN(parsedMaxPax) ? 0 : parsedMaxPax,

        description.trim(),

        safeColor
      );

      console.log("createPavilion result", result);

      return result;
    },
    onSuccess: result => {
      if (result.success) {
        toast.success("Pavilion created successfully!");
        queryClient.invalidateQueries({ queryKey: ["allPavilions"] });
        handleReset();
        setOpen(false);
      } else {
        // Show error and keep dialog open
        setErrors(prev => ({
          ...prev,
          name: result.error?.includes("exists") ? result.error : prev.name,
        }));
        toast.error(result.error || "Failed to create pavilion");
      }
    },
    onError: error => {
      toast.error(error.message || "Failed to create pavilion");
    },
  });

  const handleReset = () => {
    setName("");
    setMaxCapacity("");
    setDescription("");
    setColor("#3b82f6");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPavilionMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Update the field value
    switch (field) {
      case "name":
        setName(value);
        break;
      case "maxCapacity":
        // Only allow numbers
        if (/^\d*$/.test(value)) {
          setMaxCapacity(value);
        }
        break;
      case "description":
        setDescription(value);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CirclePlus className="h-4 w-4 mr-2" />
          Add New Pavilion
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Pavilion</DialogTitle>
            <DialogDescription>
              Create a new pavilion venue for bookings. Fill in the details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Pavilion Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Grand Pavilion"
                value={name}
                onChange={e => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                disabled={createPavilionMutation.isPending}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="maxCapacity">
                Max Capacity (pax) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxCapacity"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 150"
                value={maxCapacity}
                onChange={e => handleInputChange("maxCapacity", e.target.value)}
                className={errors.maxCapacity ? "border-red-500" : ""}
                disabled={createPavilionMutation.isPending}
              />
              {errors.maxCapacity && (
                <span className="text-xs text-red-500">{errors.maxCapacity}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the pavilion features, amenities, etc."
                value={description}
                onChange={e => handleInputChange("description", e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                rows={3}
                disabled={createPavilionMutation.isPending}
              />
              {errors.description && (
                <span className="text-xs text-red-500">{errors.description}</span>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Theme Color</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                      disabled={createPavilionMutation.isPending}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className="h-5 w-5 rounded border border-gray-300"
                          style={{ backgroundColor: color }}
                        />
                        <span className="flex-1 text-left">{color}</span>
                        <Palette className="h-4 w-4 ml-auto opacity-50" />
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <ColorPicker
                      value={color}
                      onChange={value => {
                        <ColorPicker
                          value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#3b82f6"}
                          onChange={value => {
                            let hex = "#3b82f6";
                            if (Array.isArray(value)) {
                              hex =
                                "#" +
                                value
                                  .slice(0, 3)
                                  .map(x => {
                                    const v = Math.max(0, Math.min(255, Number(x) || 0));
                                    return v.toString(16).padStart(2, "0");
                                  })
                                  .join("");
                            } else if (
                              typeof value === "string" &&
                              /^#[0-9a-fA-F]{6}$/.test(value)
                            ) {
                              hex = value;
                            }
                            setColor(hex);
                          }}
                        />;
                      }}
                    />
                    <div className="mt-2">
                      <Label className="text-xs">Quick Colors</Label>
                      <div className="grid grid-cols-8 gap-1 mt-1">
                        {[
                          "#ef4444", // red
                          "#f97316", // orange
                          "#f59e0b", // amber
                          "#eab308", // yellow
                          "#84cc16", // lime
                          "#22c55e", // green
                          "#10b981", // emerald
                          "#14b8a6", // teal
                          "#06b6d4", // cyan
                          "#0ea5e9", // sky
                          "#3b82f6", // blue
                          "#6366f1", // indigo
                          "#8b5cf6", // violet
                          "#a855f7", // purple
                          "#d946ef", // fuchsia
                          "#ec4899", // pink
                        ].map(presetColor => (
                          <button
                            key={presetColor}
                            type="button"
                            className="h-6 w-6 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                            style={{ backgroundColor: presetColor }}
                            onClick={() => setColor(presetColor)}
                          />
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <p className="text-xs text-muted-foreground">
                This color will be used to identify the pavilion in calendars and charts
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={createPavilionMutation.isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={createPavilionMutation.isPending}>
              {createPavilionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CirclePlus className="mr-2 h-4 w-4" />
                  Create Pavilion
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
