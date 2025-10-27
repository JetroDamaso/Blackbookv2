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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createEmployee } from "@/server/employee/pushActions";
import { getAllRoles } from "@/server/role/pullActions";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    empId: "",
    firstName: "",
    lastName: "",
    password: "",
    roleId: "",
    dateOfEmployment: "",
  });

  const queryClient = useQueryClient();

  const { data: roles } = useQuery({
    queryKey: ["allRoles"],
    queryFn: () => getAllRoles(),
  });

  const { mutate: createEmployeeMutation, isPending } = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEmployees"] });
      toast.success("Employee created successfully!");
      setIsDialogOpen(false);
      setFormData({
        empId: "",
        firstName: "",
        lastName: "",
        password: "",
        roleId: "",
        dateOfEmployment: "",
      });
    },
    onError: error => {
      toast.error("Failed to create employee: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.empId ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.password ||
      !formData.dateOfEmployment
    ) {
      toast.error("Please fill in all required fields");
      return;
    }
    createEmployeeMutation({
      empId: formData.empId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      password: formData.password,
      roleId: formData.roleId ? parseInt(formData.roleId) : undefined,
      dateOfEmployment: new Date(formData.dateOfEmployment),
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

        <InputGroup className="bg-white">
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

        <Dialog>
          <DialogTrigger>
            <Button>
              <CirclePlus /> Add New
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="mb-4">Add Employee</DialogTitle>
              <DialogDescription>
                <div className="grid gap-4">
                  <div className="grid items-center gap-3">
                    <Label htmlFor="empId" className="font-normal">
                      Employee ID
                    </Label>
                    <Input
                      type="text"
                      id="empId"
                      placeholder="EMP001"
                      value={formData.empId}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          empId: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid items-center gap-3">
                      <Label htmlFor="firstName" className="font-normal">
                        First Name
                      </Label>
                      <Input
                        type="text"
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid items-center gap-3">
                      <Label htmlFor="lastName" className="font-normal">
                        Last Name
                      </Label>
                      <Input
                        type="text"
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="password" className="font-normal">
                      Password
                    </Label>
                    <Input
                      type="password"
                      id="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="roleId" className="font-normal">
                      Role
                    </Label>
                    <Select
                      value={formData.roleId}
                      onValueChange={value => setFormData(prev => ({ ...prev, roleId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles?.map(role => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid items-center gap-3">
                    <Label htmlFor="dateOfEmployment" className="font-normal">
                      Employment Date
                    </Label>
                    <Input
                      type="date"
                      id="dateOfEmployment"
                      value={formData.dateOfEmployment}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          dateOfEmployment: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleSubmit} className="mt-4 w-full" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Employee"}
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
