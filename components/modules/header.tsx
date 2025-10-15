import { Bell, Calendar, SparklesIcon, UploadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import AppToggle from "../app-toggle";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const teams = ["Acme Inc.", "Origin UI", "Junon"];

export default function Header() {
  return (
    <header className="border-b px-4 md:px-6 overflow-hidden">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center">
          <Image
            src={"/susings_and_rufins_logo.png"}
            alt={"Susing & Rufins Logo"}
            width={54}
            height={54}
          />
        </div>
        {/* Middle area */}
        <AppToggle />
        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <Button
            size="sm"
            variant={"ghost"}
            className="flex items-center text-sm max-sm:aspect-square max-sm:p-0 bg-transparent"
          >
            <Bell className="opacity-60" size={16} />
          </Button>

          <div className="flex gap-1 items-center rounded-sm border-1 text-sm px-2 py-1 bg-muted text-neutral-500 cursor-pointer hover:bg-neutral-500/10 hover:shadow-xs">
            <Calendar size={12} />
            <p className="select-none">March 4, 2002</p>
          </div>

          <Avatar className="ml-1">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
