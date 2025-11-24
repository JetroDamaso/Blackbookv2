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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEmployeeProfile, updateEmployeePassword } from "@/server/employee/pushActions";
import { getEmployeeById } from "@/server/employee/pullActions";
import { getAllRoles } from "@/server/role/pullActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface EditEmployeeDialogProps {
  employeeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmployeeDialog({ employeeId, open, onOpenChange }: EditEmployeeDialogProps) {
  const { data: session } = useSession();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [empId, setEmpId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Check if user can edit password (Owner or Manager)
  const canEditPassword = session?.user?.role === "Owner" || session?.user?.role === "Manager";

  // Fetch employee data when dialog opens
  const { data: employeeData, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: () => getEmployeeById(employeeId!),
    enabled: open && employeeId !== null,
  });

  // Fetch roles for dropdown
  const { data: roles } = useQuery({
    queryKey: ["allRoles"],
    queryFn: () => getAllRoles(),
    enabled: open,
  });

  // Populate form when employee data is loaded
  useEffect(() => {
    if (employeeData) {
      setFirstName(employeeData.firstName || "");
      setLastName(employeeData.lastName || "");
      setEmpId(employeeData.empId || "");
      setRoleId(employeeData.roleId?.toString() || "");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
    }
  }, [employeeData]);

  const updateEmployeeMutation = useMutation({
    mutationFn: async () => {
      if (!employeeId) return;

      // Validate fields
      const newErrors: Record<string, string> = {};

      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
      }

      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }

      if (!roleId) {
        newErrors.roleId = "Role is required";
      }

      // Validate password if provided
      if (password.trim()) {
        if (password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        }
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match";
        }
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error("Validation failed");
      }

      // Update employee profile
      await updateEmployeeProfile(employeeId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        empId: empId.trim() || undefined,
        roleId: parseInt(roleId),
      });

      // Update password if provided
      if (password.trim()) {
        await updateEmployeePassword(employeeId, password.trim());
      }
    },
    onSuccess: () => {
      toast.success("Employee updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update employee");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployeeMutation.mutate();
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
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "empId":
        setEmpId(value);
        break;
      case "roleId":
        setRoleId(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-empId">Employee ID</Label>
                <Input
                  id="edit-empId"
                  placeholder="e.g., EMP001"
                  value={empId}
                  onChange={e => handleInputChange("empId", e.target.value)}
                  disabled={updateEmployeeMutation.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-firstName"
                  placeholder="e.g., Juan"
                  value={firstName}
                  onChange={e => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                  disabled={updateEmployeeMutation.isPending}
                />
                {errors.firstName && (
                  <span className="text-xs text-red-500">{errors.firstName}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-lastName"
                  placeholder="e.g., Dela Cruz"
                  value={lastName}
                  onChange={e => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                  disabled={updateEmployeeMutation.isPending}
                />
                {errors.lastName && (
                  <span className="text-xs text-red-500">{errors.lastName}</span>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={roleId}
                  onValueChange={value => handleInputChange("roleId", value)}
                  disabled={updateEmployeeMutation.isPending}
                >
                  <SelectTrigger className={errors.roleId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map(role => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roleId && <span className="text-xs text-red-500">{errors.roleId}</span>}
              </div>

              {canEditPassword && (
                <>
                  <div className="border-t pt-4 mt-2">
                    <p className="text-sm font-medium mb-3">Change Password (Optional)</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="edit-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 6 characters)"
                        value={password}
                        onChange={e => handleInputChange("password", e.target.value)}
                        className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                        disabled={updateEmployeeMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={updateEmployeeMutation.isPending}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-xs text-red-500">{errors.password}</span>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="edit-confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={e => handleInputChange("confirmPassword", e.target.value)}
                        className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                        disabled={updateEmployeeMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        disabled={updateEmployeeMutation.isPending}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-xs text-red-500">{errors.confirmPassword}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateEmployeeMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateEmployeeMutation.isPending || isLoading}>
              {updateEmployeeMutation.isPending ? (
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
