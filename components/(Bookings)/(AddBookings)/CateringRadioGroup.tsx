"use client";

import React, { useCallback, memo } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, Truck, Layers, MinusCircle } from "lucide-react";

interface CateringRadioGroupProps {
  value: string;
  hasError?: boolean;
  onChange: (value: string) => void;
}

const CateringRadioGroup = memo(({
  value,
  hasError = false,
  onChange
}: CateringRadioGroupProps) => {

  const id = React.useId();

  // Stable onChange handler
  const handleChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);

  return (
    <div className="mt-2">
      <RadioGroup
        className="grid grid-cols-4"
        value={value}
        orientation="horizontal"
        onValueChange={handleChange}
      >
        {/* Radio card #1 */}
        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none min-h-[100px]">
          <RadioGroupItem
            value="1"
            id={`${id}-1`}
            aria-describedby={`${id}-1-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="flex flex-col grow gap-2 justify-start items-baseline">
            <Label htmlFor={`${id}-1`} className="flex items-center">
              <Users className="mr-1" size={20} />
              {"Susing and Rufins Catering"}
              <span className="text-muted-foreground text-xs leading-[inherit] font-normal"></span>
            </Label>
            <div id={`${id}-1-description`} className="text-muted-foreground text-xs">
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Use the in-house catering.</li>
                <li>Menu, staff, and setup are handled internally.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Radio card #2 */}
        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
          <RadioGroupItem
            value="2"
            id={`${id}-2`}
            aria-describedby={`${id}-2-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="flex flex-col grow gap-2 justify-start items-baseline">
            <Label htmlFor={`${id}-2`} className="flex items-center">
              <Truck className="mr-1" size={20} />
              {"3rd Party Catering"}
              <span className=" ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
            </Label>
            <div id={`${id}-2-description`} className="text-muted-foreground text-xs">
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Client brings an external caterer.</li>
                <li>All food, equipment, and utensils are provided by the caterer.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Radio card #3 */}
        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
          <RadioGroupItem
            value="3"
            id={`${id}-3`}
            aria-describedby={`${id}-3-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="flex flex-col grow gap-2">
            <Label htmlFor={`${id}-3`} className="flex items-center">
              <Layers className="mr-1" size={20} />
              {"Hybrid Service"}
              <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
            </Label>
            <div id={`${id}-3-description`} className="text-muted-foreground text-xs">
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>Client provides an external caterer.</li>
                <li>Susing and Rufins staff handle serving, table setup, and cleanup.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Radio card #4 */}
        <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
          <RadioGroupItem
            value="4"
            id={`${id}-4`}
            aria-describedby={`${id}-4-description`}
            className="order-1 after:absolute after:inset-0"
          />
          <div className="flex flex-col grow gap-2">
            <Label htmlFor={`${id}-4`} className="flex items-center">
              <MinusCircle className="mr-1" size={20} />
              {"None"}
              <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
            </Label>
            <div id={`${id}-4-description`} className="text-muted-foreground text-xs">
              <ul className="list-disc list-inside space-y-1 mb-2">
                <li>No catering service included.</li>
                <li>No food or beverage arrangements are needed.</li>
              </ul>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
});

CateringRadioGroup.displayName = "CateringRadioGroup";

export default CateringRadioGroup;
