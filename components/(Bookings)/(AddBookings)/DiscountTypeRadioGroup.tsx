"use client";

import React, { memo, useCallback } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DiscountTypeRadioGroupProps {
  value: "predefined" | "custom" | "none";
  onChange: (value: "predefined" | "custom" | "none") => void;
}

const DiscountTypeRadioGroup = memo(({ value, onChange }: DiscountTypeRadioGroupProps) => {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange(newValue as "predefined" | "custom" | "none");
    },
    [onChange]
  );

  return (
    <RadioGroup value={value} onValueChange={handleChange} className="grid grid-cols-3">
      <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
        <RadioGroupItem
          value="predefined"
          id="predefined"
          className="after:absolute after:inset-0 after:cursor-pointer"
        />
        <Label htmlFor="predefined" className="font-normal cursor-pointer">
          Predefined Discount
        </Label>
      </div>
      <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
        <RadioGroupItem
          value="custom"
          id="custom"
          className="after:absolute after:inset-0 after:cursor-pointer"
        />
        <Label htmlFor="custom" className="font-normal cursor-pointer">
          Custom Discount
        </Label>
      </div>
      <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
        <RadioGroupItem
          value="none"
          id="none"
          className="after:absolute after:inset-0 after:cursor-pointer"
        />
        <Label htmlFor="none" className="font-normal cursor-pointer">
          None
        </Label>
      </div>
    </RadioGroup>
  );
});

DiscountTypeRadioGroup.displayName = "DiscountTypeRadioGroup";

export default DiscountTypeRadioGroup;
