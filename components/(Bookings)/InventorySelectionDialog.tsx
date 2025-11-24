"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Plus, Trash2, SearchIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  getAllInventory,
  getInventoryCategories,
  getInventoryStatus,
} from "@/server/Inventory/Actions/pullActions";

interface InventorySelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: Array<{ id: number; quantity: number }>;
  onSave: (items: Array<{ id: number; quantity: number }>) => void;
  startDate: Date | null;
  endDate: Date | null;
  numPax?: string;
}

export function InventorySelectionDialog({
  isOpen,
  onClose,
  selectedItems,
  onSave,
  startDate,
  endDate,
  numPax = "0",
}: InventorySelectionDialogProps) {
  // Local state for this dialog
  const [localSelectedItems, setLocalSelectedItems] = useState<
    Array<{ id: number; quantity: number }>
  >([]);
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [selectedInventoryCategoryFilter, setSelectedInventoryCategoryFilter] = useState("all");
  const [selectedItemsSearchQuery, setSelectedItemsSearchQuery] = useState("");
  const [selectedItemsCategoryFilter, setSelectedItemsCategoryFilter] = useState("all");

  const queryClient = useQueryClient();

  // Initialize local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedItems([...selectedItems]);
    }
  }, [isOpen, selectedItems]);

  // Queries for inventory data
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["allInventory"],
    queryFn: () => getAllInventory(),
    enabled: isOpen,
  });

  const { data: inventoryCategoriesData = [] } = useQuery({
    queryKey: ["inventoryCategories"],
    queryFn: () => getInventoryCategories(),
    enabled: isOpen,
  });

  const { data: inventoryStatuses = [], refetch: refetchInventoryStatuses } = useQuery({
    queryKey: ["inventoryStatus"],
    queryFn: () => getInventoryStatus(),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: isOpen,
  });

  // Refetch inventory statuses when dialog opens
  useEffect(() => {
    if (isOpen && refetchInventoryStatuses) {
      console.log("Inventory dialog opened - refetching inventory statuses...");
      refetchInventoryStatuses();
    }
  }, [isOpen, refetchInventoryStatuses]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  // Local handlers
  const addInventoryItem = (inventoryId: number) => {
    const requestedQuantity = parseInt(numPax) || 1; // Use numPax, fallback to 1 if invalid

    // Get available quantity to cap the addition
    const inventory = inventoryItems.find((item: any) => item.id === inventoryId);
    if (!inventory) return;

    const selectedItem = localSelectedItems.find(item => item.id === inventoryId);
    const currentlySelected = selectedItem?.quantity || 0;

    // Calculate available stock based on whether dates are selected
    let availableStock: number;

    if (!startDate || !endDate) {
      // No dates selected, check against total stock
      availableStock = inventory.quantity - (inventory.out || 0);
    } else {
      // Dates selected, calculate based on overlapping bookings
      const totalUsedQuantity = (inventoryStatuses as any[])
        .filter((status: any) => {
          if (status.inventoryId !== inventoryId) return false;
          if (!status.booking?.startAt || !status.booking?.endAt) return false;
          if (status.booking.status === 6 || status.booking.status === 7) return false;

          const bookingStart = new Date(status.booking.startAt);
          const bookingEnd = new Date(status.booking.endAt);

          const normalizedBookingStart = new Date(
            bookingStart.getFullYear(),
            bookingStart.getMonth(),
            bookingStart.getDate()
          );
          const normalizedBookingEnd = new Date(
            bookingEnd.getFullYear(),
            bookingEnd.getMonth(),
            bookingEnd.getDate()
          );
          const normalizedStartDate = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate()
          );
          const normalizedEndDate = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate()
          );

          return (
            normalizedBookingStart <= normalizedEndDate && normalizedBookingEnd >= normalizedStartDate
          );
        })
        .reduce((sum: number, status: any) => sum + (status.quantity || 0), 0);

      availableStock = inventory.quantity - (inventory.out || 0) - totalUsedQuantity;
    }

    // Calculate how much we can actually add
    const maxCanAdd = Math.max(0, availableStock - currentlySelected);
    const quantityToAdd = Math.min(requestedQuantity, maxCanAdd);

    if (quantityToAdd <= 0) {
      toast.error(`No more ${inventory.name} available to add.`);
      return;
    }

    if (quantityToAdd < requestedQuantity) {
      toast.warning(`Only ${quantityToAdd} ${inventory.name} available. Adding maximum available.`);
    }

    setLocalSelectedItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === inventoryId);
      if (existingIndex !== -1) {
        return prev.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + quantityToAdd } : item
        );
      } else {
        return [...prev, { id: inventoryId, quantity: quantityToAdd }];
      }
    });
  };

  const removeInventoryItem = (inventoryId: number) => {
    setLocalSelectedItems(prev => prev.filter(item => item.id !== inventoryId));
  };

  const updateInventoryQuantity = (inventoryId: number, quantity: number) => {
    if (quantity <= 0) {
      removeInventoryItem(inventoryId);
      return;
    }
    setLocalSelectedItems(prev =>
      prev.map(item => (item.id === inventoryId ? { ...item, quantity } : item))
    );
  };

  const resetInventoryFilters = () => {
    setSelectedInventoryCategoryFilter("all");
    setInventorySearchQuery("");
  };

  const resetSelectedItemsFilters = () => {
    setSelectedItemsCategoryFilter("all");
    setSelectedItemsSearchQuery("");
  };

  const handleSave = () => {
    onSave(localSelectedItems);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedItems([...selectedItems]); // Reset to original
    onClose();
  };

  // Check inventory conflicts and stock levels
  const getInventoryConflicts = (
    inventoryId: number,
    requestedQuantity: number,
    isHypothetical: boolean = false
  ) => {
    const inventory = inventoryItems.find((item: any) => item.id === inventoryId);
    if (!inventory) return { conflicts: [], warnings: [] };

    const selectedItem = localSelectedItems.find(item => item.id === inventoryId);
    const actualSelectedQuantity = selectedItem?.quantity || 0;

    // If no dates selected, only check against total stock
    if (!startDate || !endDate) {
      const availableStock = inventory.quantity - (inventory.out || 0);
      if (requestedQuantity > availableStock) {
        return {
          conflicts: [],
          warnings: [`Insufficient stock: Only ${availableStock} items available.`],
        };
      }
      return { conflicts: [], warnings: [] };
    }

    const conflicts: string[] = [];
    const warnings: string[] = [];

    // Calculate total used inventory ONLY for overlapping dates
    const totalUsedQuantity = (inventoryStatuses as any[])
      .filter((status: any) => {
        if (status.inventoryId !== inventoryId) return false;
        if (!status.booking?.startAt || !status.booking?.endAt) return false;
        // Count inventory from all statuses except Canceled (6) and Archived (7)
        if (status.booking.status === 6 || status.booking.status === 7) return false;

        const bookingStart = new Date(status.booking.startAt);
        const bookingEnd = new Date(status.booking.endAt);

        const normalizedBookingStart = new Date(
          bookingStart.getFullYear(),
          bookingStart.getMonth(),
          bookingStart.getDate()
        );
        const normalizedBookingEnd = new Date(
          bookingEnd.getFullYear(),
          bookingEnd.getMonth(),
          bookingEnd.getDate()
        );
        const normalizedStartDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const normalizedEndDate = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate()
        );

        return (
          normalizedBookingStart <= normalizedEndDate && normalizedBookingEnd >= normalizedStartDate
        );
      })
      .reduce((sum: number, status: any) => sum + (status.quantity || 0), 0);

    const availableStock = inventory.quantity - (inventory.out || 0) - totalUsedQuantity;

    if (requestedQuantity > availableStock) {
      warnings.push(`Insufficient stock: Only ${availableStock} items available.`);
    }

    // Check for conflicts
    const conflictingStatuses = (inventoryStatuses as any[]).filter((status: any) => {
      if (status.inventoryId !== inventoryId) return false;
      if (!status.booking?.startAt || !status.booking?.endAt) return false;
      // Count inventory from all statuses except Canceled (6) and Archived (7)
      if (status.booking.status === 6 || status.booking.status === 7) return false;

      const bookingStart = new Date(status.booking.startAt);
      const bookingEnd = new Date(status.booking.endAt);

      const normalizedBookingStart = new Date(
        bookingStart.getFullYear(),
        bookingStart.getMonth(),
        bookingStart.getDate()
      );
      const normalizedBookingEnd = new Date(
        bookingEnd.getFullYear(),
        bookingEnd.getMonth(),
        bookingEnd.getDate()
      );
      const normalizedStartDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate()
      );
      const normalizedEndDate = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );

      return (
        normalizedBookingStart <= normalizedEndDate && normalizedBookingEnd >= normalizedStartDate
      );
    });

    if (conflictingStatuses.length > 0) {
      const conflictsByPavilion = new Map();
      conflictingStatuses.forEach((status: any) => {
        const pavilionName = status.pavilion?.name || `Pavilion ${status.pavilionId}`;
        const bookingName = status.booking?.eventName || "Unknown Event";
        const key = `${pavilionName} - ${bookingName}`;

        if (!conflictsByPavilion.has(key)) {
          conflictsByPavilion.set(key, 0);
        }
        conflictsByPavilion.set(key, conflictsByPavilion.get(key) + (status.quantity || 0));
      });

      conflictsByPavilion.forEach((quantity, conflictKey) => {
        conflicts.push(`Already reserved ${quantity} items for ${conflictKey}.`);
      });
    }

    const remainingStock = availableStock - requestedQuantity;
    if (remainingStock < 5 && remainingStock >= 0) {
      warnings.push(`Low stock warning: Only ${remainingStock} items will remain on this day.`);
    }

    return { conflicts, warnings };
  };

  // Filter inventory items
  const filteredInventoryItems = inventoryItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase());
    const matchesCategory =
      selectedInventoryCategoryFilter === "all" ||
      item.categoryId?.toString() === selectedInventoryCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-200"
        onClick={handleCancel}
      />

      {/* Dialog Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col transform transition-all duration-200 scale-100"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h2 className="text-xl font-semibold">Select Inventory Items</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose inventory items needed for this booking
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
              aria-label="Close dialog"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full grid grid-cols-2 gap-4">
              {/* LEFT COLUMN - Selected Items Table */}
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-lg font-medium">Selected Inventory Items</h3>
                </div>

                {/* Filter Controls for Selected Items */}
                <div className="flex gap-2">
                  <Select
                    value={selectedItemsCategoryFilter}
                    onValueChange={setSelectedItemsCategoryFilter}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {inventoryCategoriesData?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <InputGroup className="flex-1">
                    <InputGroupInput
                      placeholder="Search selected..."
                      value={selectedItemsSearchQuery}
                      onChange={e => setSelectedItemsSearchQuery(e.target.value)}
                    />
                    <InputGroupAddon>
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton type="button" onClick={resetSelectedItemsFilters}>
                        Clear
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                {/* Selected Items Table */}
                <div className="flex-1 border rounded-md overflow-hidden">
                  <ScrollArea className="h-[calc(90vh-280px)]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localSelectedItems.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-8 text-muted-foreground"
                            >
                              No items selected
                            </TableCell>
                          </TableRow>
                        ) : (
                          localSelectedItems
                            .filter(selectedItem => {
                              const item = inventoryItems.find(
                                (inv: any) => inv.id === selectedItem.id
                              );
                              if (!item) return false;

                              const matchesSearch = item.name
                                .toLowerCase()
                                .includes(selectedItemsSearchQuery.toLowerCase());
                              const matchesCategory =
                                selectedItemsCategoryFilter === "all" ||
                                item.categoryId?.toString() === selectedItemsCategoryFilter;
                              return matchesSearch && matchesCategory;
                            })
                            .map(selectedItem => {
                              const item = inventoryItems.find(
                                (inv: any) => inv.id === selectedItem.id
                              );
                              const category = inventoryCategoriesData?.find(
                                (c: any) => c.id === item?.categoryId
                              );
                              return (
                                <TableRow key={selectedItem.id}>
                                  <TableCell className="font-medium">
                                    {item?.name || "Unknown Item"}
                                  </TableCell>
                                  <TableCell>{category?.name || "—"}</TableCell>
                                  <TableCell>{selectedItem.quantity}</TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600"
                                      onClick={() => removeInventoryItem(selectedItem.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>

              {/* RIGHT COLUMN - Available Inventory Items List */}
              <div className="flex flex-col gap-2">
                <div>
                  <h3 className="text-lg font-medium">Available Inventory Items</h3>
                </div>

                {/* Filter Controls for Available Items */}
                <div className="flex gap-2">
                  <Select
                    value={selectedInventoryCategoryFilter}
                    onValueChange={setSelectedInventoryCategoryFilter}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="all">All Categories</SelectItem>
                      {inventoryCategoriesData?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <InputGroup className="flex-1">
                    <InputGroupInput
                      placeholder="Search available..."
                      value={inventorySearchQuery}
                      onChange={e => setInventorySearchQuery(e.target.value)}
                    />
                    <InputGroupAddon>
                      <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton type="button" onClick={resetInventoryFilters}>
                        Clear
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                {/* Inventory Items List */}
                <div className="flex-1 border rounded-md overflow-hidden">
                  <ScrollArea className="h-[calc(90vh-280px)]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Selected</TableHead>
                          <TableHead className="w-32">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventoryItems.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-8 text-muted-foreground"
                            >
                              {inventorySearchQuery.trim() !== "" ||
                              selectedInventoryCategoryFilter !== "all"
                                ? "No inventory items found matching your filters"
                                : "No inventory items available"}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredInventoryItems.map((item: any) => {
                            const selectedItem = localSelectedItems.find(si => si.id === item.id);
                            const selectedQuantity = selectedItem?.quantity || 0;
                            const paxQuantity = parseInt(numPax) || 1;
                            const conflicts = getInventoryConflicts(
                              item.id,
                              selectedQuantity + paxQuantity,
                              true
                            );
                            const category = inventoryCategoriesData?.find(
                              (c: any) => c.id === item.categoryId
                            );

                            // Calculate available quantity for this item
                            let totalUsedQuantity = 0;
                            let availableQuantity = item.quantity - (item.out || 0);

                            // If dates are selected, calculate used quantity for overlapping dates only
                            if (startDate && endDate) {
                              totalUsedQuantity = (inventoryStatuses as any[])
                                .filter((status: any) => {
                                  if (status.inventoryId !== item.id) return false;
                                  if (!status.booking?.startAt || !status.booking?.endAt)
                                    return false;
                                  // Count inventory from all statuses except Canceled (6) and Archived (7)
                                  if (status.booking.status === 6 || status.booking.status === 7)
                                    return false;

                                  const bookingStart = new Date(status.booking.startAt);
                                  const bookingEnd = new Date(status.booking.endAt);

                                  const normalizedBookingStart = new Date(
                                    bookingStart.getFullYear(),
                                    bookingStart.getMonth(),
                                    bookingStart.getDate()
                                  );
                                  const normalizedBookingEnd = new Date(
                                    bookingEnd.getFullYear(),
                                    bookingEnd.getMonth(),
                                    bookingEnd.getDate()
                                  );
                                  const normalizedStartDate = new Date(
                                    startDate.getFullYear(),
                                    startDate.getMonth(),
                                    startDate.getDate()
                                  );
                                  const normalizedEndDate = new Date(
                                    endDate.getFullYear(),
                                    endDate.getMonth(),
                                    endDate.getDate()
                                  );

                                  return (
                                    normalizedBookingStart <= normalizedEndDate &&
                                    normalizedBookingEnd >= normalizedStartDate
                                  );
                                })
                                .reduce(
                                  (sum: number, status: any) => sum + (status.quantity || 0),
                                  0
                                );

                              availableQuantity =
                                item.quantity - (item.out || 0) - totalUsedQuantity;
                            }

                            return (
                              <React.Fragment key={item.id}>
                                <TableRow className={selectedQuantity > 0 ? "bg-blue-50" : ""}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{category?.name || "—"}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span
                                        className={
                                          availableQuantity < 5 ? "text-orange-600 font-medium" : ""
                                        }
                                      >
                                        {availableQuantity}
                                        {availableQuantity < 5 && " (Low Stock)"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>{selectedQuantity}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addInventoryItem(item.id)}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>

                                {/* Warnings Row */}
                                {conflicts.warnings.length > 0 && (
                                  <TableRow key={`${item.id}-warnings`}>
                                    <TableCell colSpan={5} className="bg-orange-50/50 p-2">
                                      <div className="space-y-1">
                                        {conflicts.warnings.map((warning, idx) => (
                                          <div
                                            key={idx}
                                            className="text-xs text-orange-600 bg-orange-50 p-2 rounded-md border border-orange-200"
                                          >
                                            {warning}
                                          </div>
                                        ))}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}

                                {/* Conflicts/Errors Row */}
                                {conflicts.conflicts.length > 0 && (
                                  <TableRow key={`${item.id}-conflicts`}>
                                    <TableCell colSpan={5} className="bg-red-50/50 p-2">
                                      <div className="space-y-1">
                                        {conflicts.conflicts.map((conflict, idx) => (
                                          <div
                                            key={idx}
                                            className="text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200"
                                          >
                                            {conflict}
                                          </div>
                                        ))}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Selection
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
