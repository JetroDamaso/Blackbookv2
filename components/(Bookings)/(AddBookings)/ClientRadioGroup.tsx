"use client";

import React, { memo, useCallback, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Client {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phoneNumber: string | null;
  region: string | null;
  province: string | null;
  municipality: string | null;
  barangay: string | null;
}

interface ClientRadioGroupProps {
  clients: Client[];
  value: string | undefined;
  onChange: (value: number) => void;
  searchQuery: string;
}

const ClientRadioGroup = memo(
  ({ clients, value, onChange, searchQuery }: ClientRadioGroupProps) => {
    const handleChange = useCallback(
      (val: string) => {
        onChange(Number(val));
      },
      [onChange]
    );

    const filteredClients = useMemo(() => {
      return clients
        .filter(client => {
          if (!searchQuery) return true;
          const searchTerm = searchQuery.toLowerCase();
          return (
            client.firstName?.toLowerCase().includes(searchTerm) ||
            client.lastName?.toLowerCase().includes(searchTerm) ||
            client.email?.toLowerCase().includes(searchTerm) ||
            client.phoneNumber?.toLowerCase().includes(searchTerm) ||
            client.region?.toLowerCase().includes(searchTerm) ||
            client.province?.toLowerCase().includes(searchTerm) ||
            client.municipality?.toLowerCase().includes(searchTerm) ||
            client.barangay?.toLowerCase().includes(searchTerm)
          );
        })
        .slice(0, 20);
    }, [clients, searchQuery]);

    const clientItems = useMemo(() => {
      return filteredClients.map(client => (
        <div
          key={client.id}
          className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-3 shadow-xs outline-none mb-2"
        >
          <RadioGroupItem
            value={client.id.toString()}
            id={`client-${client.id}`}
            aria-describedby={`client-${client.id}-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="grid grow gap-1">
            <Label className="flex items-center font-medium" htmlFor={`client-${client.id}`}>
              {client.firstName} {client.lastName}
              <span className="ml-2 text-muted-foreground text-xs font-normal">
                {client.phoneNumber}
              </span>
            </Label>
            <div id={`client-${client.id}-description`} className="text-muted-foreground text-xs">
              <div className="mb-1">
                <strong>Email:</strong> {client.email || "N/A"}
              </div>
              <div>
                <strong>Address:</strong>{" "}
                {[client.barangay, client.municipality, client.province, client.region]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </div>
            </div>
          </div>
        </div>
      ));
    }, [filteredClients]);

    return (
      <RadioGroup value={value} onValueChange={handleChange} className="p-2">
        {clientItems}
      </RadioGroup>
    );
  }
);

ClientRadioGroup.displayName = "ClientRadioGroup";

export default ClientRadioGroup;
