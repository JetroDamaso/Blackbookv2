import React from "react";
import { OtherService } from "@/generated/prisma";
import {
  Command,
  // CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  // CommandSeparator,
  // CommandShortcut,
} from "@/components/ui/command";

const SearchService = ({
  services,
  setSelectedServices,
  onPick,
  onTypeChange,
  value,
}: {
  services: OtherService[];
  setSelectedServices?: (value: string) => void;
  onPick?: (value: string) => void;
  onTypeChange?: (value: string) => void;
  value?: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const [typedText, setTypedText] = React.useState(value ?? "");

  // selection handled inline via onSelect of CommandItem

  return (
    <div className="relative ">
      <Command className="rounded-md border shadow-2xs [--ring:var(--color-red-500)] in-[.dark]:[--ring:var(--color-red-500)] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] transition-[border-color,box-shadow] duration-200 ease-out [&_[data-slot=command-input-wrapper]]:border-b-0 [&_[data-slot=command-input-wrapper]_svg]:hidden [&_[data-slot=command-input-wrapper]]:gap-0">
        <CommandInput
          className="[--ring:var(--color-red-500)] in-[.dark]:[--ring:var(--color-red-500)]"
          value={typedText}
          onValueChange={v => {
            setTypedText(v);
            onTypeChange?.(v);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
        {open && (
          <CommandList className="absolute z-[300] mt-10 w-full max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg">
            <CommandEmpty>No results found.</CommandEmpty>
            {services.map(service => (
              <CommandGroup key={service.id}>
                <CommandItem
                  value={service.name ?? String(service.id)}
                  onMouseDown={e => e.preventDefault()}
                  onSelect={val => {
                    setTypedText(val);
                    setSelectedServices?.(val);
                    onPick?.(val);
                    onTypeChange?.(val);
                    setOpen(false);
                  }}
                >
                  {service.name}
                </CommandItem>
              </CommandGroup>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
};

export default SearchService;
