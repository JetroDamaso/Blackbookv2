"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  CirclePlus,
  SearchIcon,
  Archive,
  Filter,
} from "lucide-react";
import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { changeBookingsStatus } from "@/server/Booking/pushActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (bookingId: number) => void;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  pagination,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [showStatusDialog, setShowStatusDialog] = React.useState(false);
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<string>("1");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const router = useRouter();

  // Filter data based on status
  const filteredData = React.useMemo(() => {
    if (statusFilter === "all") {
      return data;
    }
    return data.filter((row: any) => {
      return row.status === parseInt(statusFilter);
    });
  }, [data, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    manualPagination: !!pagination,
    pageCount: pagination?.totalPages || -1,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: pagination
        ? {
            pageIndex: pagination.page - 1,
            pageSize: pagination.pageSize,
          }
        : undefined,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleStatusChange = async () => {
    setIsChangingStatus(true);
    try {
      const bookingIds = selectedRows.map(row => {
        const booking = row.original as { id: number };
        return booking.id;
      });

      await changeBookingsStatus(bookingIds, parseInt(selectedStatus));

      setRowSelection({});
      setShowStatusDialog(false);
      router.refresh();
      toast.success(`Booking status changed successfully!`);
    } catch (error) {
      console.error("Failed to change booking status:", error);
      toast.error("Failed to change booking status");
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <Filter className="mr-2 h-4 w-4" />
              Status Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
              <DropdownMenuRadioItem value="all">All Statuses</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="1">Pending</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="2">Confirmed</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="3">In Progress</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="4">Completed</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="5">Unpaid</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="6">Canceled</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="7">Archived</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="8">Draft</DropdownMenuRadioItem>
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

        <InputGroup className="mb-4 bg-white">
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Search</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <Button
          variant={"outline"}
          disabled={!hasSelection}
          onClick={() => setShowStatusDialog(true)}
        >
          <Archive /> Change Status ({selectedRows.length})
        </Button>

        <a href="/event_calendar">
          <Button>
            <CirclePlus /> Add new
          </Button>
        </a>
      </div>
      <div className="overflow-hidden rounded-md border bg-white h-fit">
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
                      // Get the booking ID from the row data
                      const booking = row.original as { id: number };
                      onRowClick(booking.id);
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
            {pagination ? (
              <>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total
                entries)
              </>
            ) : (
              <>
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
                {table.getFilteredRowModel().rows.length} total entries)
              </>
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex items-center space-x-2">
            {pagination && onPageChange ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronFirstIcon className="h-4 w-4" />
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronLastIcon className="h-4 w-4" />
                  Last
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Status Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Booking Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change status for {selectedRows.length} selected booking(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="status-select">Select New Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Pending</SelectItem>
                <SelectItem value="2">Confirmed</SelectItem>
                <SelectItem value="3">In Progress</SelectItem>
                <SelectItem value="4">Completed</SelectItem>
                <SelectItem value="5">Unpaid</SelectItem>
                <SelectItem value="6">Canceled</SelectItem>
                <SelectItem value="7">Archived</SelectItem>
                <SelectItem value="8">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} disabled={isChangingStatus}>
              {isChangingStatus ? "Changing..." : "Change Status"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
