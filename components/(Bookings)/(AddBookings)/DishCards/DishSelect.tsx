"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import type { Dish } from "@/generated/prisma";

type DishSelectProps = {
  dishes: Dish[];
  onAddDish: (dish: Dish) => void;
};

function DishDialog({
  dish,
  onAddDish,
}: {
  dish: Dish;
  onAddDish: (dish: Dish) => void;
}) {
  const handleAdd = () => {
    onAddDish(dish);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="w-50">
          <div className="text-muted-foreground text-xs py-1 px-1 h-full">
            <div
              className={`
                border
                border-l-4
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
                relative flex h-full w-full items-start gap-2 rounded-md p-4 shadow-xs outline-none hover:bg-black/3`}
            >
              <div className="grid grow gap-2">
                <Label className="flex items-center">{dish.name}</Label>
                <div id={``} className="text-muted-foreground text-xs">
                  <p className="select-none">{dish.description}</p>
                </div>
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
              <AlertDialogTitle>{dish.name}</AlertDialogTitle>
              <AlertDialogDescription>
                {dish.description}
              </AlertDialogDescription>
            </div>
            {/* Quantity input removed */}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="px-3 pb-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={handleAdd}
          >
            Add
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function DishSelectComponent({
  dishes,
  onAddDish,
}: DishSelectProps) {
  return (
    <div className="grid grid-cols-3 gap-1 p-2">
      {dishes.map((dish) => (
        <DishDialog key={dish.id} dish={dish} onAddDish={onAddDish} />
      ))}
    </div>
  );
}
