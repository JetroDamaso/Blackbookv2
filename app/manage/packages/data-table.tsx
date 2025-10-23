"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronFirstIcon, ChevronLastIcon, SearchIcon, Trash } from "lucide-react";
import React, { useMemo, useState } from "react";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { useQuery } from "@tanstack/react-query";
import { getAllPackages } from "@/server/Packages/pullActions";
import AddPackageDialog from "@/components/(Packages)/AddPackageDialog";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (clientId: number) => void;
  selectedPavilion?: string;
}


export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  selectedPavilion = "all",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [pavilionFilter, setPavilionFilter] = useState<string>(selectedPavilion);

  const { data: pavilionsData } = useQuery({
    queryKey: ["allPavilions"],
    queryFn: () => getAllPavilions(),
  });

  const { data: packagesData } = useQuery({
    queryKey: ["allPackages"],
    queryFn: () => getAllPackages(),
  });

  // Update pavilion filter when prop changes
  React.useEffect(() => {
    setPavilionFilter(selectedPavilion);
  }, [selectedPavilion]);

  const filteredPackages = useMemo(() => {
    if (pavilionFilter === "all") {
      return packagesData || [];
    }
    return packagesData?.filter(pkg => pkg.pavilionId === parseInt(pavilionFilter)) || [];
  }, [packagesData, pavilionFilter]);

  const table = useReactTable({
    data: filteredPackages as TData[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
  });


  return (
    <div className="flex flex-col">
      {/* Main controls row */}
      <div className="flex gap-2 items-center mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter(column => column.getCanHide())
              .map(column => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={pavilionFilter} onValueChange={setPavilionFilter}>
          <SelectTrigger className="w-[350px] bg-background">
            <SelectValue placeholder="Select pavilion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pavilions</SelectItem>
            {pavilionsData?.map(pavilion => (
              <SelectItem key={pavilion.id} value={pavilion.id.toString()}>
                {pavilion.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <InputGroup className="bg-white">
          <InputGroupInput
            placeholder="Search packages..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        <Button
          variant={"outline"}
          onClick={() => {
            setGlobalFilter("");
            setColumnFilters([]);
            setPavilionFilter("all");
          }}
        >
          Clear Filters
        </Button>

        <Button variant={"outline"}>
          <Trash /> Delete
        </Button>

        <AddPackageDialog />
      </div>

      {/* Filter controls */}

      {/* Filter status */}
      {(globalFilter || columnFilters.length > 0 || pavilionFilter !== "all") && (
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <span>
            Showing {table.getFilteredRowModel().rows.length} of {data.length} packages
            {globalFilter && ` (filtered by "${globalFilter}")`}
            {pavilionFilter !== "all" &&
              ` (pavilion: ${pavilionsData?.find(p => p.id.toString() === pavilionFilter)?.name || "Unknown"})`}
          </span>
        </div>
      )}

      <div className="overflow-hidden rounded-md border h-fit bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => {
                    if (onRowClick) {
                      // Get the client ID from the row data
                      const client = row.original as { id: number };
                      onRowClick(client.id);
                    }
                  }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between py-4 px-4">
          {/* Page info */}
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
            {table.getFilteredRowModel().rows.length} total entries)
          </div>
          {/* Pagination controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronFirstIcon className="h-4 w-4" />
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLastIcon className="h-4 w-4" />
              Last
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
