"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define the dish type with relations
type DishWithRelations = Awaited<
  ReturnType<typeof import("@/server/Dishes/Actions/pullActions").getAllDishes>
>[number];

export const columns: ColumnDef<DishWithRelations>[] = [
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
          Dish Name
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
      return (
        <div>
          <Badge variant="outline">{row.original.category?.name ?? "No Category"}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return (
        <div className="max-w-[300px] truncate">
          {description || <span className="text-muted-foreground italic">No description</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "allergens",
    header: "Allergens",
    cell: ({ row }) => {
      const allergens = row.getValue("allergens") as string | null;
      return (
        <div className="max-w-[200px] truncate">
          {allergens ? (
            <Badge variant="secondary">{allergens}</Badge>
          ) : (
            <span className="text-muted-foreground italic">None</span>
          )}
        </div>
      );
    },
  },
];
