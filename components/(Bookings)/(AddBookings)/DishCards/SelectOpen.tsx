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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Input } from "@/components/ui/input";

export default function SelectOpenComponent() {
  return (
    <div className="w-50">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <div className="">
            <div className="text-muted-foreground text-xs py-1 px-1 h-full">
              <div className="border-input relative flex h-full w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none hover:bg-black/3">
                <div className="grid grow gap-2">
                  <Label className="flex items-center">{"Gold Utensils"}</Label>
                  <div id={``} className="text-muted-foreground text-xs">
                    <p className="select-none">Gold plated spoon & fork</p>
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
                <AlertDialogTitle>Gold Utensils</AlertDialogTitle>
                <AlertDialogDescription>
                  Gold plated spoon & fork
                </AlertDialogDescription>
              </div>
              <div className="h-full">
                <div className="flex rounded-md shadow-xs h-full">
                  <span className="border-input bg-background text-muted-foreground -z-10 inline-flex items-center rounded-s-md border px-3 text-sm">
                    Qty
                  </span>
                  <Input
                    className="-ms-px rounded-s-none shadow-none h-full"
                    type="text"
                    placeholder="000"
                  />
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-3 pb-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white">
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
