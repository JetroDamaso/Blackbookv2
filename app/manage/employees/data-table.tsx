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
  const [searchQuery, setSearchQuery] = React.useState("");
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

    // Validate Employee ID
    if (!formData.empId.trim()) {
      toast.error("Employee ID is required");
      return;
    }

    if (formData.empId.trim().length < 2) {
      toast.error("Employee ID must be at least 2 characters");
      return;
    }

    if (formData.empId.trim().length > 50) {
      toast.error("Employee ID must not exceed 50 characters");
      return;
    }

    // Validate First Name
    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (formData.firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      return;
    }

    if (formData.firstName.trim().length > 50) {
      toast.error("First name must not exceed 50 characters");
      return;
    }

    // Validate Last Name
    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (formData.lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters");
      return;
    }

    if (formData.lastName.trim().length > 50) {
      toast.error("Last name must not exceed 50 characters");
      return;
    }

    // Validate Password
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (formData.password.length > 100) {
      toast.error("Password must not exceed 100 characters");
      return;
    }

    // Validate Date of Employment
    if (!formData.dateOfEmployment) {
      toast.error("Date of employment is required");
      return;
    }

    const employmentDate = new Date(formData.dateOfEmployment);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (employmentDate > today) {
      toast.error("Date of employment cannot be in the future");
      return;
    }

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);
    if (employmentDate < minDate) {
      toast.error("Date of employment is too far in the past");
      return;
    }

    createEmployeeMutation({
      empId: formData.empId.trim(),
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      password: formData.password,
      roleId: formData.roleId ? parseInt(formData.roleId) : undefined,
      dateOfEmployment: employmentDate,
    });
  };

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return data;
    }

    const query = searchQuery.toLowerCase();
    return data.filter((row: any) => {
      return (
        row.empId?.toLowerCase().includes(query) ||
        row.firstName?.toLowerCase().includes(query) ||
        row.lastName?.toLowerCase().includes(query) ||
        row.role?.name?.toLowerCase().includes(query)
      );
    });
  }, [data, searchQuery]);

  const table = useReactTable({
    data: filteredData,
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
          <InputGroupInput
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
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
                  onClick={(e) => {
                    // Don't trigger row click if clicking on interactive elements
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
