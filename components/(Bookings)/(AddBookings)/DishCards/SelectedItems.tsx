import { Button } from "@/components/ui/button";
import {
  Beef,
  Carrot,
  CookingPot,
  Drumstick,
  Ellipsis,
  Fish,
  GlassWater,
  Ham,
  IceCream,
  XIcon,
} from "lucide-react";
import React from "react";
import type { Dish, DishCategory } from "@/generated/prisma";

type SelectedDish = Dish & { quantity: number };
type SelectedItemsProps = {
  selectedDishes: SelectedDish[];
  onRemoveDish: (dishId: number) => void;
  dishCategories: DishCategory[];
};
const SelectedItems = ({ selectedDishes, onRemoveDish, dishCategories }: SelectedItemsProps) => {
  // Small helper: choose which icon to render for a dish.
  type SelectedItemsProps = {
    selectedDishes: Dish[];
    onRemoveDish: (dishId: number) => void;
    dishCategories: DishCategory[];
  };
  // Currently returns an empty fragment so you can add the real icons later.
  const DishIcon = ({ categoryId }: { categoryId: number }) => {
    const categoryID = categoryId || "";

    if (categoryID == 1) {
      return (
        <>
          <Beef size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    }
    if (categoryID == 2)
      return (
        <>
          <Ham size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );

    if (categoryID == 3)
      return (
        <>
          <Drumstick size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 4)
      return (
        <>
          <Fish size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 5)
      return (
        <>
          <Carrot size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 6)
      return (
        <>
          <CookingPot size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 7)
      return (
        <>
          <IceCream size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 8)
      return (
        <>
          <GlassWater size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 9)
      return (
        <>
          <Ellipsis size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );

    return <></>;
  };

  return (
    <div className="ml-2 flex-1">
      <p>Selected:</p>
      <div className="w-full">
        {selectedDishes.length === 0 ? (
          <p className="text-muted-foreground px-4 py-3 text-sm">No dishes selected</p>
        ) : (
          selectedDishes.map((dish: SelectedDish, idx: number) => (
            <div
              key={`${dish.id}`}
              className={`
                text-foreground px-4 py-3 md:py-2 mb-1 w-full
                border border-l-4
                ${
                  dish.categoryId === 1
                    ? "border-l-red-500"
                    : dish.categoryId === 2
                      ? "border-l-pink-500"
                      : dish.categoryId === 3
                        ? "border-l-yellow-500"
                        : dish.categoryId === 4
                          ? "border-l-blue-500"
                          : dish.categoryId === 5
                            ? "border-l-green-500"
                            : dish.categoryId === 6
                              ? "border-l-amber-500"
                              : dish.categoryId === 7
                                ? "border-l-purple-500"
                                : dish.categoryId === 8
                                  ? "border-l-cyan-500"
                                  : dish.categoryId === 9
                                    ? "border-l-gray-500"
                                    : "border-input"
                }
                rounded-md`}
            >
              <div className="flex gap-2 md:items-center">
                <div className="flex grow gap-3 md:items-center">
                  <DishIcon categoryId={dish.categoryId ?? 0} />

                  <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
                    <p className="text-sm font-medium">{dish.name}</p>
                    <div className="flex gap-2 max-md:flex-wrap">
                      {dish.quantity > 1 && (
                        <span className="text-xs text-muted-foreground">Qty: {dish.quantity}</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                  onClick={() => onRemoveDish(dish.id)}
                  aria-label="Remove dish"
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
};

export default SelectedItems;
