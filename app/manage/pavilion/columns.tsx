"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define the pavilion type with relations
type PavilionWithRelations = Awaited<
  ReturnType<
    typeof import("@/server/Pavilions/Actions/pullActions").getAllPavilions
  >
>[number];

export const columns: ColumnDef<PavilionWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pavilion Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const pavilion = row.original;
      return (
        <div className="flex items-center gap-2">
          {pavilion.color && (
            <div
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: pavilion.color }}
            />
          )}
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "maxPax",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Max Capacity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Badge variant="outline" className="flex items-center gap-1 w-fit">
            <Users size={12} />
            {row.getValue("maxPax")} pax
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(price);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div
          className="max-w-[200px] truncate text-sm text-muted-foreground"
          title={description}
        >
          {description}
        </div>
      );
    },
  },
  {
    id: "totalBookings",
    accessorFn: (row) => row.bookings?.length ?? 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Bookings
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const totalBookings = row.original.bookings?.length ?? 0;
      return (
        <div className="text-center">
          <Badge variant="outline">{totalBookings}</Badge>
        </div>
      );
    },
  },
  {
    id: "activeBookings",
    accessorFn: (row) =>
      row.bookings?.filter(
        (booking) =>
          booking.bookingStatus?.name === "Active" || booking.status === 1
      ).length ?? 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Active Bookings
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const activeBookings =
        row.original.bookings?.filter(
          (booking) =>
            booking.bookingStatus?.name === "Active" || booking.status === 1
        ).length ?? 0;
      return (
        <div className="text-center">
          <Badge variant={activeBookings > 0 ? "default" : "secondary"}>
            {activeBookings}
          </Badge>
        </div>
      );
    },
  },
];
