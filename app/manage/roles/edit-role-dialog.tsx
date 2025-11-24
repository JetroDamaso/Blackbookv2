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
import { updateRole } from "@/server/role/pushActions";
import { getRoleById } from "@/server/role/pullActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditRoleDialogProps {
  roleId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleDialog({ roleId, open, onOpenChange }: EditRoleDialogProps) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const { data: roleData, isLoading } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => getRoleById(roleId!),
    enabled: open && roleId !== null,
  });

  useEffect(() => {
    if (roleData) {
      setName(roleData.name || "");
      setErrors({});
    }
  }, [roleData]);

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      if (!roleId) return;

      if (!name.trim()) {
        setErrors({ name: "Role name is required" });
        throw new Error("Validation failed");
      }

      await updateRole(roleId, name.trim());
    },
    onSuccess: () => {
      toast.success("Role updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allRoles"] });
      queryClient.invalidateQueries({ queryKey: ["role", roleId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRoleMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role name. Click save when you're done.
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
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Manager"
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
                  disabled={updateRoleMutation.isPending}
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
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateRoleMutation.isPending || isLoading}>
              {updateRoleMutation.isPending ? (
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
