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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronFirstIcon, ChevronLastIcon, SearchIcon, Trash, Filter } from "lucide-react";
import React, { useMemo, useState } from "react";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { useQuery } from "@tanstack/react-query";
import { getAllPackages } from "@/server/Packages/pullActions";
import { deletePackage } from "@/server/Packages/pushActions";
import AddPackageDialog from "@/components/(Packages)/AddPackageDialog";
import { useRouter } from "next/navigation";

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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deletedFilter, setDeletedFilter] = React.useState<string>("active");
  const router = useRouter();

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
    let filtered = packagesData || [];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((pkg: any) =>
        pkg.name?.toLowerCase().includes(query) ||
        pkg.price?.toString().includes(query)
      );
    }

    // Filter by pavilion
    if (pavilionFilter !== "all") {
      filtered = filtered.filter(pkg => pkg.pavilionId === parseInt(pavilionFilter));
    }

    // Filter by deleted status
    if (deletedFilter !== "all") {
      filtered = filtered.filter((pkg: any) => {
        const isDeleted = pkg.isDeleted === true;
        return deletedFilter === "deleted" ? isDeleted : !isDeleted;
      });
    }

    return filtered;
  }, [packagesData, pavilionFilter, deletedFilter, searchQuery]);

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

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedRows.map(row => {
          const pkg = row.original as { id: number };
          return deletePackage(pkg.id);
        })
      );

      setRowSelection({});
      setShowDeleteDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete packages:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Main controls row */}
      <div className="flex gap-2 items-center mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Show Items</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={deletedFilter} onValueChange={setDeletedFilter}>
              <DropdownMenuRadioItem value="active">Active</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="deleted">Deleted</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

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
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>

        <Button
          variant={"outline"}
          onClick={() => {
            setSearchQuery("");
            setColumnFilters([]);
            setPavilionFilter("all");
          }}
        >
          Clear Filters
        </Button>

        <Button
          variant={"outline"}
          disabled={!hasSelection}
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash /> Delete ({selectedRows.length})
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
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest('button') ||
                      target.closest('[role="checkbox"]') ||
                      target.closest('input') ||
                      target.closest('a')
                    ) {
                      return;
                    }
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete {selectedRows.length} package{selectedRows.length > 1 ? "s" : ""}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
