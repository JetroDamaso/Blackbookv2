import SingleDatePicker from "@/components/NewComponents/single-day";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import React from "react";

const NewAddBookings = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="flex flex-col p-4 rounded-md bg-white col-span-2">
        <p className="text-md">Pavilion</p>
        <p className="text-sm text-neutral-500">Select a pavilion that is in need for the client</p>
        <div className="border-1 border-gray-300 rounded-md p-4 flex justify-center items-center mt-4">
          <p className="m-4 text-sm">No pavilion selected.</p>
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-md p-3 flex justify-center items-center mt-2">
          <Plus size={12} className="text-neutral-500 mr-2" />
          <p className="text-sm">Select a pavilion.</p>
        </div>

        <p className="text-md mt-12">Package</p>
        <p className="text-sm text-neutral-500 mb-4">Select the package the client needs</p>
        {/* <PackageComboBox /> */}
        <div className="border-1 border-gray-300 rounded-md p-4 flex justify-center items-center">
          <p className="m-4 text-sm">Select a pavilion to view packages.</p>
        </div>

        <div className="flex w-full justify-between items-center mt-12">
          <p className="text-md ">Date & Time</p>
        </div>
        <p className="text-sm text-neutral-500 mb-4">Select the package the client needs</p>
        <Tabs defaultValue="tab-1" className="-mt-12 w-full grow">
          <TabsList className="ml-auto w-fit">
            <TabsTrigger value="tab-1" className="text-xs font-normal">
              Single-day
            </TabsTrigger>
            <TabsTrigger value="tab-2" className="text-xs font-normal">
              Multi-day
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab-1">
            <p className="text-muted-foreground text-xs">
              <SingleDatePicker />
            </p>
          </TabsContent>
          <TabsContent value="tab-2">
            <p className="text-muted-foreground text-xs">Content for Tab 2</p>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col p-4 rounded-md bg-white">
        <p className="font-medium text-md">Booking Details</p>
      </div>
    </div>
  );
};

export default NewAddBookings;
