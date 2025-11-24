"use client";

import React, { memo, useCallback, useMemo } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Package {
  id: number;
  name: string;
  price: number;
  description?: string | null;
}

interface PackageRadioGroupProps {
  packages: Package[];
  value: string | undefined;
  onChange: (value: number) => void;
  selectedPavilionId: number | null;
  id: string;
}

const PackageRadioGroup = memo(
  ({ packages, value, onChange, selectedPavilionId, id }: PackageRadioGroupProps) => {
    const handleChange = useCallback(
      (val: string) => {
        onChange(Number(val));
      },
      [onChange]
    );

    const packageItems = useMemo(() => {
      return packages.map(pack => {
        const items = (pack.description ?? "")
          .split(".")
          .map(s => s.trim())
          .filter(Boolean);

        return (
          <div
            key={pack.id}
            className="border-input has-data-[state=checked]:border-primary has-data-[state=checked]:bg-accent relative flex w-full items-start gap-3 rounded-md border p-4 shadow-sm outline-none transition-colors cursor-pointer hover:bg-accent/50"
          >
            <RadioGroupItem
              value={`${pack.id}`}
              id={`${pack.id}`}
              aria-describedby={`${id}-package-${pack.id}-description`}
              className="mt-0.5"
            />
            <div className="grid grow gap-2">
              <Label className="flex items-center cursor-pointer" htmlFor={`${pack.id}`}>
                <span className="font-semibold">{pack.name}</span>
                <span className="ml-2 text-muted-foreground text-sm font-normal">
                  ₱{pack.price.toLocaleString()}
                </span>
              </Label>
              <div
                id={`${id}-package-${pack.id}-description`}
                className="text-muted-foreground text-sm"
              >
                <ul className="list-disc list-inside space-y-1">
                  {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      });
    }, [packages, id]);

    return (
      <RadioGroup name="package" className="flex flex-col gap-3" value={value} onValueChange={handleChange}>
        {selectedPavilionId === null && (
          <div className="text-sm text-muted-foreground text-center py-8">
            Select a pavilion to see its packages.
          </div>
        )}
        {selectedPavilionId !== null && packages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            No packages available for the selected pavilion.
          </div>
        )}
        {packageItems}
      </RadioGroup>
    );
  }
);

PackageRadioGroup.displayName = "PackageRadioGroup";

export default PackageRadioGroup;
