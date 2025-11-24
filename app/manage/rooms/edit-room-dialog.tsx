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
import { updateRoom } from "@/server/rooms/pushActions";
import { getRoomById } from "@/server/rooms/pullActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditRoomDialogProps {
  roomId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoomDialog({ roomId, open, onOpenChange }: EditRoomDialogProps) {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Fetch room data when dialog opens
  const { data: roomData, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoomById(roomId!),
    enabled: open && roomId !== null,
  });

  // Populate form when room data is loaded
  useEffect(() => {
    if (roomData) {
      setName(roomData.name || "");
      setCapacity(roomData.capacity?.toString() || "");
      setErrors({});
    }
  }, [roomData]);

  const updateRoomMutation = useMutation({
    mutationFn: async () => {
      if (!roomId) return;

      // Validate fields
      const newErrors: Record<string, string> = {};

      if (!name.trim()) {
        newErrors.name = "Room name is required";
      }

      if (!capacity || parseInt(capacity) <= 0) {
        newErrors.capacity = "Capacity must be greater than 0";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Validation failed");
      }

      await updateRoom(roomId, name.trim(), parseInt(capacity));
    },
    onSuccess: () => {
      toast.success("Room updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allRooms"] });
      queryClient.invalidateQueries({ queryKey: ["room", roomId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update room");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoomMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "capacity":
        if (/^\d*$/.test(value)) {
          setCapacity(value);
        }
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
              Update the room details. Click save when you're done.
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
                  Room Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Bridal Room"
                  value={name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={updateRoomMutation.isPending}
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">
                  Capacity (people) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-capacity"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 10"
                  value={capacity}
                  onChange={e => handleInputChange("capacity", e.target.value)}
                  className={errors.capacity ? "border-red-500" : ""}
                  disabled={updateRoomMutation.isPending}
                />
                {errors.capacity && (
                  <span className="text-xs text-red-500">{errors.capacity}</span>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateRoomMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoomMutation.isPending || isLoading}>
              {updateRoomMutation.isPending ? (
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
