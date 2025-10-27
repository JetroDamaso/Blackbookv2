"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  VisibilityState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
import { Button } from "@/components/ui/button";
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  CirclePlus,
  SearchIcon,
  Trash,
  Filter,
} from "lucide-react";
import React from "react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDiscount, deleteDiscount } from "@/server/discount/pushActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (id: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();
  const [formData, setFormData] = React.useState({
    name: "",
    type: "percentage", // "percentage" or "amount"
    value: "",
  });

  const queryClient = useQueryClient();

  const createDiscountMutation = useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDiscounts"] });
      toast.success("Discount created successfully!");
      setIsDialogOpen(false);
      setFormData({ name: "", type: "percentage", value: "" });
    },
    onError: error => {
      toast.error("Failed to create discount: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.value) {
      toast.error("Please fill in all fields");
      return;
    }

    const discountData: any = {
      name: formData.name,
    };

    if (formData.type === "percentage") {
      discountData.percent = parseFloat(formData.value);
    } else {
      discountData.amount = parseFloat(formData.value);
    }

    createDiscountMutation.mutate(discountData);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.all(
        selectedRows.map(row => {
          const discount = row.original as { id: number };
          return deleteDiscount(discount.id);
        })
      );

      setRowSelection({});
      setShowDeleteDialog(false);
      router.refresh();
      toast.success("Discounts deleted successfully!");
    } catch (error) {
      console.error("Failed to delete discounts:", error);
      toast.error("Failed to delete discounts");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 items-center mb-2">
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

        <InputGroup className="bg-white flex-1">
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
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash /> Delete ({selectedRows.length})
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button>
              <CirclePlus /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-4">Add Discount</DialogTitle>
              <DialogDescription>
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid items-center gap-3">
                    <Label htmlFor="name" className="font-normal">
                      Discount Name
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="Senior Citizen, PWD, etc."
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="type" className="font-normal">
                      Discount Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="amount">Fixed Amount (₱)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="value" className="font-normal">
                      {formData.type === "percentage" ? "Percentage" : "Amount"}
                    </Label>
                    <Input
                      type="number"
                      id="value"
                      placeholder={formData.type === "percentage" ? "20" : "500"}
                      step="0.01"
                      max={formData.type === "percentage" ? "100" : undefined}
                      min="0"
                      value={formData.value}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createDiscountMutation.isPending}>
                      {createDiscountMutation.isPending ? "Creating..." : "Create Discount"}
                    </Button>
                  </div>
                </form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
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
                      const item = row.original as { id: number };
                      onRowClick(item.id);
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
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
            {table.getFilteredRowModel().rows.length} total entries)
          </div>
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
              This will delete {selectedRows.length} discount{selectedRows.length > 1 ? "s" : ""}.
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
