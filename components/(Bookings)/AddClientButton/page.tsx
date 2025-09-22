"use client";

import { useId } from "react";
import { Calendar, CreditCardIcon, Plus, User, WalletIcon } from "lucide-react";
import { usePaymentInputs } from "react-payment-inputs";
import images, { type CardImages } from "react-payment-inputs/images";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DatePickerComponent from "../TimeDatePicker/multiDatePicker";
import MultiDatePickerComponent from "../TimeDatePicker/multiDatePicker";
import TimeStartPickerComponent from "../TimeDatePicker/timeStartPicker";
import TimeEndPickerComponent from "../TimeDatePicker/timeEndPicker";

export default function AddClientButton() {
  const id = useId();
  const {
    meta,
    getCardNumberProps,
    getExpiryDateProps,
    getCVCProps,
    getCardImageProps,
  } = usePaymentInputs();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#EF5350] hover:bg-[#EA6362]">
          <Plus color="white" size={16} />
          <p className="text-white">Add Booking</p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="flex flex-col gap-2">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
            aria-hidden="true"
          >
            <Calendar className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">Create Booking</DialogTitle>
            <DialogDescription className="text-left">
              Select the date and time for the booking.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <div className="space-y-4">
            <div className="w-full">
              <p className="text-muted-foreground p-4text-xs">
                <div className="justify-start">
                  <MultiDatePickerComponent />
                  <div className="w-full mt-4 flex gap-4">
                    <div className="w-full">
                      <TimeStartPickerComponent />
                    </div>
                    <div className="w-full">
                      <TimeEndPickerComponent />
                    </div>
                  </div>
                </div>
              </p>
            </div>

            <div className="flex gap-4"></div>
          </div>

          <Button type="button" className="w-full bg-[#EF5350] hover:bg-[#EA6362]">
            Check Schedule
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
