"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define the inventory type with relations
type InventoryWithRelations = Awaited<
  ReturnType<typeof import("@/server/Inventory/Actions/pullActions").getAllInventory>
>[number];

export const columns: ColumnDef<InventoryWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
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
          Item Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    id: "category",
    accessorFn: row => row.category?.name ?? "No Category",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Category
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div>{row.original.category?.name ?? "No Category"}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Badge variant="outline">{row.getValue("quantity")}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "out",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Out
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <Badge variant="secondary">{row.getValue("out")}</Badge>
        </div>
      );
    },
  },
  {
    id: "available",
    accessorFn: row => row.quantity - row.out,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Available
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const available = row.original.quantity - row.original.out;
      return (
        <div className="text-center">
          <Badge variant={available > 0 ? "default" : "destructive"}>{available}</Badge>
        </div>
      );
    },
  },
  {
    id: "status",
    accessorFn: row => {
      const available = row.quantity - row.out;
      if (available <= 0) return "Out of Stock";
      if (available <= 5) return "Low Stock";
      return "In Stock";
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const available = row.original.quantity - row.original.out;
      let status = "In Stock";
      let variant: "default" | "secondary" | "destructive" = "default";

      if (available <= 0) {
        status = "Out of Stock";
        variant = "destructive";
      } else if (available <= 5) {
        status = "Low Stock";
        variant = "secondary";
      }

      return (
        <div className="text-center">
          <Badge variant={variant}>{status}</Badge>
        </div>
      );
    },
  },
];
