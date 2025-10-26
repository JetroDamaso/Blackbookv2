import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Castle, ForkKnife, User } from "lucide-react";

const PrintBookingPage = () => {
  return (
    <div className="flex flex-col gap-2 m-12 border-1 p-6 border-foreground">
      {/* HEADER */}
      <div className="flex gap-4 w-full">
        <Image src={"/susings_and_rufins_logo.png"} alt="Logo" height={50} width={70} />
        <h1 className="font-bold text-4xl">Susings & Rufins Farm</h1>
      </div>

      {/* BODY */}
      <div className="border-t-1 w-full mt-2 pt-4 border-foreground">
        <p className="font-bold text-2xl flex gap-2 items-center text-foreground mb-2">
          Ninong Ry's Birthday
          <Badge className="flex gap-2 items-center">
            <Castle size={16} /> Grand Pavilion
          </Badge>
        </p>

        <p className="font-medium">
          Event Type: <span className="font-normal ml-2">Birthday</span>
        </p>

        <p className="gap-4 font-medium">
          Date & Time: <span className="font-normal">November 1</span>
          <span className="border-l-2 border-foreground pl-2 ml-2 font-normal">
            10:00 am - 4:00 pm
          </span>
        </p>

        <p className="font-medium">
          Total pax:
          <span className="font-normal">200</span>
        </p>

        {/* Client Information */}

        <div className="w-full border-t pt-4 pb-4 mt-4 border-foreground flex flex-col">
          <p className="font-medium mb-2 gap-2 flex items-center">
            <User /> Client:
          </p>
          <div className="grid grid-cols-2">
            <div>
              <p className="font-medium">
                Full Name: <span className="font-normal ml-2">Jetro Damaso</span>
              </p>
              <p className="font-medium">
                Address:{" "}
                <span className="font-normal ml-2">
                  Poblacion 1, Gerona, Tarlac, Central Luzon, Philippines
                </span>
              </p>
            </div>
            <p className="font-medium">
              Contact Number: <span className="font-normal ml-2">09157579017</span>
            </p>
          </div>
        </div>

        {/* Catering Information */}
        <div className="w-full border-t pt-4 pb-4 mt-4 border-foreground flex flex-col">
          <p className="font-medium mb-2 gap-2 flex items-center">
            <ForkKnife /> Catering:
          </p>

          <div className="grid grid-cols-2">
            <p className="font-medium">
              Provider: <span className="font-normal ml-2">Susing's & Rufins Catering</span>
            </p>
            <p className="font-medium">
              Price per pax: <span className="font-normal ml-2">200</span>
            </p>
          </div>
          <p>table here</p>

          <p className="font-medium mb-2 gap-2 flex items-center">
            <ForkKnife /> Inventory:
          </p>

          <p>table here</p>

          <p className="font-medium mb-2 gap-2 flex items-center">
            <ForkKnife /> 3rd Party Services:
          </p>

          <p>table here</p>
        </div>

        <p className="font-medium mb-2 gap-2 flex items-center">
          <ForkKnife /> Billing:
        </p>

        <div className="grid grid-cols-2">
          <p className="font-medium">
            Amount: <span className="font-normal ml-2">50,000.00</span>
          </p>
          <p className="font-medium">
            Discount Type:
            <span className="font-normal ml-2">Senior Citizen</span>
          </p>
          <p className="font-medium">
            Discount Amount:
            <span className="font-normal ml-2">12% </span>
          </p>

          <p className="font-medium">
            Contact Number: <span className="font-normal ml-2">09157579017</span>
          </p>
        </div>
        <p className="font-medium mb-2 gap-2 flex items-center">
          <ForkKnife /> Payments if available:
        </p>

        <p>table here</p>
      </div>

      <div className="w-full pt-4 mt-4 border-t">
        <p>Notes:</p>
      </div>

      <div className="w-full pt-4 mt-4 border-t text-endÏ">
        <p>Booked By: Employee Name</p>
      </div>
    </div>
  );
};

export default PrintBookingPage;
