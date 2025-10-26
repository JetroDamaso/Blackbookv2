"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Role = "OWNER" | "MANAGER" | "FRONT_DESK";

interface EmployeeRoleSelectProps {
  value: Role;
  onChange: (value: Role) => void;
  disabled?: boolean;
}

export function EmployeeRoleSelect({ value, onChange, disabled }: EmployeeRoleSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <Select value={value} onValueChange={(val: Role) => onChange(val)} disabled={disabled}>
        <SelectTrigger id="role">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="OWNER">Owner</SelectItem>
          <SelectItem value="MANAGER">Manager</SelectItem>
          <SelectItem value="FRONT_DESK">Front Desk Staff</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">Only Owners can assign roles to employees.</p>
    </div>
  );
}
