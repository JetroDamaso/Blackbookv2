"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { InventoryItem } from "@/generated/prisma";
import {
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

type InventorySelectProps = {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
};

function InventoryIcon({ categoryId }: { categoryId: number }) {
  const categoryID = categoryId || "";
  if (categoryID == 1) return <Beef size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 2) return <Ham size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 3) return <Drumstick size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 4) return <Fish size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 5) return <Carrot size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 6) return <CookingPot size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 7) return <IceCream size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 8) return <GlassWater size={16} className="shrink-0 max-md:mt-0.5" />;
  if (categoryID == 9) return <Ellipsis size={16} className="shrink-0 max-md:mt-0.5" />;
  return null;
}

function ItemDialog({
  item,
  onAddItem,
}: {
  item: InventoryItem;
  onAddItem: (item: InventoryItem) => void;
}) {
  const handleAdd = () => {
    onAddItem(item);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="w-50">
          <div className="text-muted-foreground text-xs py-1 px-1 h-full">
            <div
              className={`border relative flex h-full w-full items-start gap-2 rounded-md p-4 shadow-xs outline-none hover:bg-black/3`}
            >
              <InventoryIcon categoryId={item.categoryId ?? 0} />
              <div className="grid grow gap-2">
                <Label className="flex items-center gap-1">{item.name}</Label>
                {/* No description field on InventoryItem */}
              </div>
            </div>
          </div>
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent className="p-2">
        <AlertDialogHeader>
          <Image
            src={"/inventory-images/gold-utensil.jpg"}
            alt={""}
            className="object-cover rounded-md w-full h-fit mb-3"
            width={300}
            height={300}
          />
          <div className="grid grid-cols-3 w-full px-3">
            <div className=" col-span-2 flex flex-col justify-start items-start">
              <AlertDialogTitle>{item.name}</AlertDialogTitle>
              {/* No description field on InventoryItem */}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-3 pb-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={handleAdd}>
            Add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function InventorySelectComponent({ items, onAddItem }: InventorySelectProps) {
  return (
    <div className="grid grid-cols-3 gap-2 p-2">
      {items.map(item => (
        <ItemDialog key={item.id} item={item} onAddItem={onAddItem} />
      ))}
    </div>
  );
}
