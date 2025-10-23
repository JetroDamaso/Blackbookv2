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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronFirstIcon, ChevronLastIcon, CirclePlus, SearchIcon, Trash } from "lucide-react";
import React, { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdditionalCharge } from "@/server/additionalcharge/pushActions";
import { toast } from "sonner";

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
  const [formData, setFormData] = React.useState({
    name: "",
    amount: "",
    description: "",
    note: "",
  });

  const queryClient = useQueryClient();

  const { mutate: createAdditionalChargeMutation, isPending } = useMutation({
    mutationFn: createAdditionalCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allAdditionalCharges"] });
      toast.success("Additional charge created successfully!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        amount: "",
        description: "",
        note: "",
      });
    },
    onError: error => {
      toast.error("Failed to create additional charge: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    createAdditionalChargeMutation({
      name: formData.name,
      amount: parseFloat(formData.amount),
      description: formData.description || undefined,
      note: formData.note || undefined,
    });
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

        <Button variant={"outline"}>
          <Trash /> Delete
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger>
            <Button>
              <CirclePlus /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-4">Add Additional Charge</DialogTitle>
              <DialogDescription>
                <div className="grid gap-4">
                  <div className="grid items-center gap-3">
                    <Label htmlFor="name" className="font-normal">
                      Charge Name
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="Service fee, Equipment rental, etc."
                      value={formData.name}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="amount" className="font-normal">
                      Amount
                    </Label>
                    <Input
                      type="number"
                      id="amount"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.amount}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="description" className="font-normal">
                      Description (Optional)
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Description of the additional charge..."
                      rows={3}
                      value={formData.description}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="note" className="font-normal">
                      Note (Optional)
                    </Label>
                    <Textarea
                      id="note"
                      placeholder="Additional notes..."
                      rows={2}
                      value={formData.note}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="mt-4 w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Additional Charge"}
                </Button>
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
    </div>
  );
}
