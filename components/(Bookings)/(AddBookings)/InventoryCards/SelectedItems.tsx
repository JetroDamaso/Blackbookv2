import { Button } from "@/components/ui/button";
import {
  XIcon,
  Beef,
  Ham,
  Drumstick,
  Fish,
  Carrot,
  CookingPot,
  IceCream,
  GlassWater,
  Ellipsis,
} from "lucide-react";
import type { InventoryItem } from "@/generated/prisma";

type SelectedInventoryItem = InventoryItem & { quantity: number };

type InventorySelectedItemsProps = {
  selectedItems: SelectedInventoryItem[];
  onRemoveItem: (itemId: number) => void;
};

export default function InventorySelectedItems({
  selectedItems,
  onRemoveItem,
}: InventorySelectedItemsProps) {
  const InventoryIcon = ({ categoryId }: { categoryId: number }) => {
    const categoryID = categoryId || "";
    if (categoryID == 1)
      return <Beef size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 2)
      return <Ham size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 3)
      return <Drumstick size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 4)
      return <Fish size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 5)
      return <Carrot size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 6)
      return <CookingPot size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 7)
      return <IceCream size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 8)
      return <GlassWater size={16} className="shrink-0 max-md:mt-0.5" />;
    if (categoryID == 9)
      return <Ellipsis size={16} className="shrink-0 max-md:mt-0.5" />;
    return null;
  };
  return (
    <div className="ml-2 flex-1">
      <p>Selected Inventory:</p>
      <div className="w-full">
        {selectedItems.length === 0 ? (
          <p className="text-muted-foreground px-4 py-3 text-sm">
            No inventory selected
          </p>
        ) : (
          selectedItems.map((item) => (
            <div
              key={item.id}
              className={`
                text-foreground px-4 py-3 md:py-2 mb-1 w-full
                border rounded-md`}
            >
              <div className="flex gap-2 md:items-center">
                <div className="flex grow gap-3 md:items-center">
                  <InventoryIcon categoryId={item.categoryId} />
                  <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="flex gap-2 max-md:flex-wrap">
                      {item.quantity > 1 && (
                        <span className="text-xs text-muted-foreground">
                          Qty: {item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Remove inventory item"
                >
                  <XIcon
                    size={16}
                    className="opacity-60 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
