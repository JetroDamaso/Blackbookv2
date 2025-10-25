"use client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Banknote,
  CalendarIcon,
  CalendarPlus,
  Check,
  Edit,
  Layers,
  MinusCircle,
  Pen,
  Pencil,
  PersonStanding,
  Plus,
  SearchIcon,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useId, useState } from "react";
import { InventorySelectionDialog } from "@/components/(Bookings)/InventorySelectionDialog";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// removed unused Carousel imports
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// removed unused next/image import
import { Badge } from "@/components/ui/badge";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Discount,
  Dish,
  DishCategory,
  EventTypes,
  InventoryCategory,
  InventoryItem,
  ModeOfPayment,
  OtherService,
  OtherServiceCategory,
  Package,
  Pavilion,
} from "@/generated/prisma";
import RegionComboBoxComponent from "./ComboBox/RegionComboBox";
import TimeEndPickerCreateBookingComponent from "./TimeDatePicker/timeEndPicker";
import TimeStartPickerCreateBookingComponent from "./TimeDatePicker/timeStartPicker";
// removed unused psgc helpers
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/server/Booking/pushActions";
import { createClient } from "@/server/clients/pushActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EndDatePickerForm } from "./TimeDatePicker/endDatePicker";
import { StartDatePickerForm } from "./TimeDatePicker/startDatePicker";
// import MultipleSelector from "@/components/ui/multiselect";
import {
  createNewService,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
} from "@/server/Services/pushActions";
// Removed unused Command imports and Autocomplete
import SearchService from "@/components/searchService";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAllDishes,
  useCreateDish,
  useDeleteDish,
  useDishCategories,
  useUpdateDish,
} from "@/hooks/useDishes";
import { getDiscountById } from "@/server/Billing & Payments/pullActions";
import { createBilling, createPayment } from "@/server/Billing & Payments/pushActions";
import { getAllClients } from "@/server/clients/pullActions";
import { createDiscount } from "@/server/discount/pushActions";
import {
  getAllInventory,
  getInventoryCategories,
  getInventoryStatus,
} from "@/server/Inventory/Actions/pullActions";
import { createInventoryStatus } from "@/server/Inventory/Actions/pushActions";
import { createMenuWithDishes } from "@/server/Menu/pushActions";
// Removed server-side imports from client component

type SelectedDish = Dish & { quantity: number };
// Removed unused SelectedInventory type

const AddBookingsPageClient = (props: {
  allDishes: Dish[];
  dishCategories: DishCategory[];
  allInventory?: InventoryItem[];
  inventoryCategories?: InventoryCategory[];
  preSelectedStartDate?: string;
  preSelectedEndDate?: string;
  preSelectedPavilionId?: string;
  pavilions: Pavilion[];
  eventTypes: EventTypes[];
  discounts: Discount[];
  modeOfPayments: ModeOfPayment[];
  servicesCategory?: OtherServiceCategory[];
  services?: OtherService[];
  packages?: Package[];
  bookings?: { startAt: Date; endAt: Date; pavilionId: number | null }[];
}) => {
  const id = useId();

  // Enable inventory-related props for inventory block
  const allInventory = props.allInventory ?? [];
  const pavilions = props.pavilions ?? [];
  const eventTypes = props.eventTypes ?? [];
  const discounts = props.discounts ?? [];
  const modeOfPayments = props.modeOfPayments ?? [];
  const allServices = props.services ?? [];
  const [servicesCategory, setServicesCategory] = useState(props.servicesCategory ?? []);
  const packages = props.packages ?? [];
  const preSelectedStartDate = props.preSelectedStartDate;
  const preSelectedEndDate = props.preSelectedEndDate;
  const preSelectedPavilionId = props.preSelectedPavilionId;

  const bookingsRef = React.useRef(props.bookings ?? []);
  // if prop changes (should be static for page load) update ref
  React.useEffect(() => {
    bookingsRef.current = props.bookings ?? [];
  }, [props.bookings]);
  const [isVisible] = useState(true);
  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]);

  // Dish Management State
  const [isDishesDialogOpen, setIsDishesDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedDishCategoryFilter, setSelectedDishCategoryFilter] = useState("all");
  const [dishSearchQuery, setDishSearchQuery] = useState("");

  // Selected Dishes Filter State
  const [selectedDishesSearchQuery, setSelectedDishesSearchQuery] = useState("");
  const [selectedDishesCategoryFilter, setSelectedDishesCategoryFilter] = useState("all");

  // Inventory Selection State
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<
    Array<{ id: number; quantity: number }>
  >([]);

  // Inventory Conflict Dialog State
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{
    inventoryItem: any;
    conflictingBookings: Array<{
      bookingId: number;
      eventName: string;
      pavilionName: string;
      quantity: number;
      startAt: Date;
      endAt: Date;
    }>;
    requestedQuantity: number;
    selectedStartDate: Date;
    selectedEndDate: Date;
  } | null>(null);
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [selectedInventoryCategoryFilter, setSelectedInventoryCategoryFilter] = useState("all");
  const [selectedItemsSearchQuery, setSelectedItemsSearchQuery] = useState("");
  const [selectedItemsCategoryFilter, setSelectedItemsCategoryFilter] = useState("all");
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  // Handle ESC key for closing inventory dialog
  React.useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isInventoryDialogOpen) {
        setIsInventoryDialogOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isInventoryDialogOpen]);

  // Service Category Management State
  const [isServiceCategoryDialogOpen, setIsServiceCategoryDialogOpen] = useState(false);
  const [newServiceCategoryName, setNewServiceCategoryName] = useState("");

  // Client Selection State
  const [clientSelectionMode, setClientSelectionMode] = useState<"new" | "existing">("new");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  // Map simple Tailwind color tokens to their 500 shade hex values for inline left border coloring.
  const COLOR_TOKEN_TO_HEX: Record<string, string> = {
    emerald: "#10b981",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
    orange: "#f97316",
    yellow: "#eab308",
    indigo: "#6366f1",
    violet: "#8b5cf6",
    purple: "#a855f7",
    pink: "#ec4899",
    rose: "#f43f5e",
    teal: "#14b8a6",
    cyan: "#06b6d4",
    sky: "#0ea5e9",
    lime: "#84cc16",
    amber: "#f59e0b",
    zinc: "#71717a",
    slate: "#64748b",
    stone: "#78716c",
  };
  // Removed unused selectedInventory state

  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [region, setRegion] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");
  const [barangay, setBarangay] = useState<string>("");
  const [selectedServiceIdsByCategory, setSelectedServiceIdsByCategory] = useState<
    Record<number, number[]>
  >({});
  const [typedServiceByCategory, setTypedServiceByCategory] = useState<Record<number, string>>({});
  // Discount selection state
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  const [discountName, setDiscountName] = useState("");
  // New enhanced discount state
  const [discountType, setDiscountType] = useState<"predefined" | "custom" | "none">("none");
  const [customDiscountName, setCustomDiscountName] = useState("");
  const [customDiscountType, setCustomDiscountType] = useState<"percent" | "amount">("percent");
  const [customDiscountValue, setCustomDiscountValue] = useState<number>(0);
  const [customDiscountDescription, setCustomDiscountDescription] = useState("");
  const [isCustomDiscountDialogOpen, setIsCustomDiscountDialogOpen] = useState(false);
  const [isLoadingCustomDiscount, setIsLoadingCustomDiscount] = useState(false);

  // Service dialog state
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [selectedCategoryForService, setSelectedCategoryForService] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newServiceName, setNewServiceName] = useState<string>("");
  const [newServiceCategory, setNewServiceCategory] = useState<string>("");

  // Removed unused pavilion/hour pricing interim states (reintroduce if needed)
  const [selectedCatering, setSelectedCatering] = useState<string>("1");

  // Queries for dish management using custom hooks
  const allDishesQuery = useAllDishes();
  const dishCategoriesQuery = useDishCategories();

  // Query for all clients
  const { data: allClients = [] } = useQuery({
    queryKey: ["allClients"],
    queryFn: () => getAllClients(),
  });

  // Queries for inventory
  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["allInventory"],
    queryFn: () => getAllInventory(),
  });

  const { data: inventoryCategoriesData = [] } = useQuery({
    queryKey: ["inventoryCategories"],
    queryFn: () => getInventoryCategories(),
  });

  // State declarations first
  const [selectedPavilionId, setSelectedPavilionId] = useState<number | null>(
    preSelectedPavilionId ? parseInt(preSelectedPavilionId, 10) : null
  );
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  // Removed unused bookingTotalPrice state
  const [downPayment, setDownPayment] = useState<number>(0);

  const [startDate, setStartDate] = useState<Date | null>(
    preSelectedStartDate ? new Date(preSelectedStartDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    preSelectedEndDate ? new Date(preSelectedEndDate) : null
  );

  // State for start and end time
  const [startTime, setStartTime] = useState<{
    hour: number;
    minute: number;
    second?: number;
  } | null>(null);

  const [endTime, setEndTime] = useState<{
    hour: number;
    minute: number;
    second?: number;
  } | null>(null);

  // Sync dates and times with preselected props and set defaults
  useEffect(() => {
    // Set start date from preselected if available
    if (preSelectedStartDate && !startDate) {
      setStartDate(new Date(preSelectedStartDate));
    }

    // Don't set default start time - let user select it manually

    // Set end date from preselected if available, otherwise default to start date
    if (preSelectedEndDate && !endDate) {
      setEndDate(new Date(preSelectedEndDate));
    } else if (!endDate && startDate) {
      // If no end date is selected, default to start date
      setEndDate(new Date(startDate));
    }

    // Don't set default end time - let user select it manually
  }, [preSelectedStartDate, preSelectedEndDate, startDate, endDate, startTime, endTime]);

  const { data: inventoryStatuses = [], refetch: refetchInventoryStatuses } = useQuery({
    queryKey: ["inventoryStatus"],
    queryFn: () => getInventoryStatus(),
    staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Refetch inventory statuses when dialog opens to ensure fresh data
  React.useEffect(() => {
    if (isInventoryDialogOpen && refetchInventoryStatuses) {
      console.log("Inventory dialog opened - refetching inventory statuses...");
      refetchInventoryStatuses();
    }
  }, [isInventoryDialogOpen, refetchInventoryStatuses]);

  // Use useEffect for debugging instead of onSuccess
  useEffect(() => {
    if (inventoryStatuses.length > 0) {
      console.log("Inventory statuses fetched:", inventoryStatuses.length, "records");
      const activeBookings = inventoryStatuses.filter((s: any) => s.booking?.status === 1);
      console.log("Active booking inventory statuses:", activeBookings.length);

      // Debug: Show all inventory statuses with details
      inventoryStatuses.forEach((status: any) => {
        if (status.booking?.status === 1) {
          console.log(
            `InventoryStatus: Item ${status.inventoryId}, Pavilion ${status.pavilionId}, Booking ${status.bookingId}, Quantity ${status.quantity}, Event: ${status.booking?.eventName}, Dates: ${status.booking?.startAt} to ${status.booking?.endAt}`
          );
        }
      });
    }
  }, [inventoryStatuses]);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Debug tracking for selectedInventoryItems
  useEffect(() => {
    console.log("selectedInventoryItems changed:", selectedInventoryItems);
    const total = selectedInventoryItems.reduce((sum, item) => {
      console.log(`Item ${item.id}: quantity ${item.quantity}`);
      return sum + item.quantity;
    }, 0);
    console.log(`Total calculated: ${total}`);
  }, [selectedInventoryItems]);

  // Mutations for dish management using custom hooks
  const createDishMutation = useCreateDish();
  const updateDishMutation = useUpdateDish();
  const deleteDishMutation = useDeleteDish();

  // Service category mutation
  const createServiceCategoryMutation = useMutation({
    mutationFn: (categoryName: string) => createServiceCategory(categoryName),
    onSuccess: newCategory => {
      setNewServiceCategoryName("");
      setIsServiceCategoryDialogOpen(false);
      // Update local state with the new category
      setServicesCategory(prev => [...prev, newCategory]);
    },
  });

  const updateServiceCategoryMutation = useMutation({
    mutationFn: ({ categoryId, categoryName }: { categoryId: number; categoryName: string }) =>
      updateServiceCategory(categoryId, categoryName),
    onSuccess: updatedCategory => {
      setServicesCategory(prev =>
        prev.map(cat => (cat.id === updatedCategory.id ? updatedCategory : cat))
      );
      setEditingCategoryId(null);
      setEditingCategoryName("");
    },
  });

  const deleteServiceCategoryMutation = useMutation({
    mutationFn: (categoryId: number) => deleteServiceCategory(categoryId),
    onSuccess: (_, categoryId) => {
      setServicesCategory(prev => prev.filter(cat => cat.id !== categoryId));
    },
  });

  // Dialog state for booking success
  const [showBookingSuccessDialog, setShowBookingSuccessDialog] = useState<boolean>(false);

  // Pre-compute a set of booked calendar days (date-only) for quick disable lookup
  const bookedDaySet = React.useMemo(() => {
    if (selectedPavilionId == null) return new Set<string>();
    const set = new Set<string>();
    bookingsRef.current
      .filter(b => b.pavilionId === selectedPavilionId)
      .forEach(b => {
        const start = new Date(b.startAt);
        const end = new Date(b.endAt);
        let cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        while (cursor <= last) {
          set.add(cursor.toISOString().slice(0, 10));
          cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
        }
      });
    return set;
  }, [selectedPavilionId]);

  // Track which service categories are enabled (checkbox checked)
  // Removed unused enabledServiceCategories state

  const startAt =
    startDate && startTime
      ? new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          startTime.hour ?? 0,
          startTime.minute ?? 0,
          startTime.second ?? 0
        )
      : null;
  const endAt =
    endDate && endTime
      ? new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          endTime.hour ?? 0,
          endTime.minute ?? 0,
          endTime.second ?? 0
        )
      : null;

  // Discount percentage now set directly when discountId changes in Select

  const createClientMutation = useMutation({
    mutationKey: ["create-client"],
    mutationFn: (data: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      region: string;
      province: string;
      municipality: string;
      barangay: string;
    }) =>
      createClient(
        data.firstName,
        data.lastName,
        data.region,
        data.province,
        data.municipality,
        data.barangay,
        data.phoneNumber,
        data.email
      ),
  });

  const createServiceMutation = useMutation({
    mutationKey: ["create-service"],
    mutationFn: (data: { serviceName: string; categoryId: number }) =>
      createNewService(data.serviceName, data.categoryId),
    onSuccess: newService => {
      queryClient.invalidateQueries({ queryKey: ["allServices"] });

      // Auto-add the newly created service to the selected services
      if (newService?.id && newServiceCategory) {
        const categoryId = parseInt(newServiceCategory);
        setSelectedServiceIdsByCategory(prev => ({
          ...prev,
          [categoryId]: [...(prev[categoryId] || []), newService.id],
        }));
      }

      setNewServiceName("");
      setNewServiceCategory("");
    },
  });

  const createBookingMutation = useMutation({
    mutationKey: ["create-bookings"],
    mutationFn: async (data: {
      eventName: string;
      clientID: number;
      pavilionID: string;
      pax: string;
      eventType: number;
      notes: string;
      startAt: Date;
      endAt: Date;
      serviceIds?: number[];
      packageId?: number;
      catering?: number;
    }) => {
      const result = await createBooking(
        data.eventName,
        data.clientID,
        data.pavilionID,
        data.pax,
        data.eventType,
        data.notes,
        data.startAt,
        data.endAt,
        data.serviceIds,
        data.packageId,
        data.catering
      );
      return result;
    },
    onSuccess: () => {
      // Invalidate inventory status query to refresh the data
      queryClient.invalidateQueries({ queryKey: ["inventoryStatus"] });
    },
  });

  const createBillingMutation = useMutation({
    mutationKey: ["create-billings"],
    mutationFn: (data: {
      bookingId: number;
      originalPrice: number;
      discountedPrice: number;
      discountType: string;
      discountPercentage: number;
      balance: number;
      modeOfPayment: string;
      status: number;
      deposit: number;
      discountAmount?: number;
      discountId?: number;
      isCustomDiscount?: boolean;
      catering?: number;
      cateringPerPaxAmount?: number;
    }) =>
      createBilling(
        data.bookingId,
        data.originalPrice,
        data.discountedPrice,
        data.discountType,
        data.discountPercentage,
        data.balance,
        data.modeOfPayment,
        data.status,
        data.deposit,
        undefined,
        undefined,
        data.discountAmount,
        data.discountId,
        data.isCustomDiscount,
        data.catering,
        data.cateringPerPaxAmount
      ),
  });

  // Add dish: increment quantity if exists, else add with quantity 1
  const addDish = (dish: Dish) => {
    setSelectedDishes(prev => {
      const idx = prev.findIndex(d => d.id === dish.id);
      if (idx !== -1) {
        // Already exists, increment quantity
        return prev.map((d, i) => (i === idx ? { ...d, quantity: d.quantity + 1 } : d));
      } else {
        // New dish, add with quantity 1
        return [...prev, { ...dish, quantity: 1 }];
      }
    });
  };

  // Inventory icon mapping (placeholder: copied from DishIcon)
  // Removed unused InventoryIcon component

  const removeDish = (dishId: number) => {
    setSelectedDishes(prev =>
      prev
        .map(d => (d.id === dishId ? { ...d, quantity: d.quantity - 1 } : d))
        .filter(d => d.quantity > 0)
    );
  };

  const resetDishFilters = () => {
    setSelectedDishCategoryFilter("all");
    setDishSearchQuery("");
  };

  const resetSelectedDishesFilters = () => {
    setSelectedDishesCategoryFilter("all");
    setSelectedDishesSearchQuery("");
  };

  // Filter available dishes - use query data first, fallback to props
  // Filter dishes based on search and category
  const dishesSource = allDishesQuery.data;
  const categoriesSource = dishCategoriesQuery.data;
  const filteredDishes =
    dishesSource?.filter((dish: any) => {
      const matchesSearch = dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase());
      const matchesCategory =
        selectedDishCategoryFilter === "all" ||
        dish.categoryId?.toString() === selectedDishCategoryFilter;
      return matchesSearch && matchesCategory;
    }) ?? [];

  // Filter selected dishes based on search and category
  const filteredSelectedDishes = selectedDishes.filter((dish: SelectedDish) => {
    const matchesSearch = dish.name.toLowerCase().includes(selectedDishesSearchQuery.toLowerCase());
    const matchesCategory =
      selectedDishesCategoryFilter === "all" ||
      dish.categoryId?.toString() === selectedDishesCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Inventory handlers
  const addInventoryItem = (inventoryId: number, quantity: number = 1) => {
    console.log(`addInventoryItem called: inventoryId=${inventoryId}, quantity=${quantity}`);
    setSelectedInventoryItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === inventoryId);
      console.log(`existingIndex: ${existingIndex}, prev items:`, prev);
      if (existingIndex !== -1) {
        const updated = prev.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
        console.log(`Updated existing item:`, updated);
        return updated;
      } else {
        const newItems = [...prev, { id: inventoryId, quantity }];
        console.log(`Added new item:`, newItems);
        return newItems;
      }
    });
  };

  const removeInventoryItem = (inventoryId: number) => {
    setSelectedInventoryItems(prev => prev.filter(item => item.id !== inventoryId));
  };

  const updateInventoryQuantity = (inventoryId: number, quantity: number) => {
    console.log(`updateInventoryQuantity called: inventoryId=${inventoryId}, quantity=${quantity}`);
    if (quantity <= 0) {
      removeInventoryItem(inventoryId);
      return;
    }
    setSelectedInventoryItems(prev => {
      const updated = prev.map(item => (item.id === inventoryId ? { ...item, quantity } : item));
      console.log(`Updated quantity:`, updated);
      return updated;
    });
  };

  // Check inventory conflicts and stock levels
  const getInventoryConflicts = (
    inventoryId: number,
    requestedQuantity: number,
    isHypothetical: boolean = false
  ) => {
    const inventory = inventoryItems.find(item => item.id === inventoryId);
    if (!inventory) return { conflicts: [], warnings: [] };

    // Get actual selected quantity for display purposes
    const selectedItem = selectedInventoryItems.find(item => item.id === inventoryId);
    const actualSelectedQuantity = selectedItem?.quantity || 0;
    const displayQuantity = isHypothetical ? actualSelectedQuantity : requestedQuantity;

    // If no dates selected, only check against total stock (no date-based conflicts)
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
    console.log(`\n=== Checking inventory ${inventoryId} (${inventory.name}) ===`);
    console.log(`Selected dates: ${startDate.toDateString()} to ${endDate.toDateString()}`);
    console.log(
      `All inventory statuses for item ${inventoryId}:`,
      (inventoryStatuses as any[]).filter((s: any) => s.inventoryId === inventoryId)
    );

    const totalUsedQuantity = (inventoryStatuses as any[])
      .filter((status: any) => {
        if (status.inventoryId !== inventoryId) return false;
        if (!status.booking?.startAt || !status.booking?.endAt) return false;
        // Count inventory from all statuses except Canceled (6) and Archived (7)
        if (status.booking.status === 6 || status.booking.status === 7) return false;

        // Check for date overlap with selected booking dates
        const bookingStart = new Date(status.booking.startAt);
        const bookingEnd = new Date(status.booking.endAt);

        // Normalize dates to start of day for comparison to avoid time component issues
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

        const hasOverlap =
          normalizedBookingStart <= normalizedEndDate &&
          normalizedBookingEnd >= normalizedStartDate;

        console.log(
          `Checking booking ${status.bookingId}: ${normalizedBookingStart.toDateString()} to ${normalizedBookingEnd.toDateString()}, Overlap: ${hasOverlap}, Quantity: ${status.quantity}, Pavilion: ${status.pavilionId}`
        );

        return hasOverlap;
      })
      .reduce((sum: number, status: any) => sum + (status.quantity || 0), 0);

    // Calculate available stock considering "out" items and used inventory on overlapping dates only
    const availableStock = inventory.quantity - (inventory.out || 0) - totalUsedQuantity;

    // Debug logging
    console.log(
      `RESULT: Inventory ${inventoryId} (${inventory.name}): Used on overlapping dates: ${totalUsedQuantity}, Available: ${availableStock} (${inventory.quantity} total - ${inventory.out || 0} out - ${totalUsedQuantity} used)`
    );
    console.log(`=== End check for inventory ${inventoryId} ===\n`);

    // Check if requesting more than available stock
    if (requestedQuantity > availableStock) {
      warnings.push(`Insufficient stock: Only ${availableStock} items available.`);
    }

    // Check for conflicts with overlapping dates
    const conflictingStatuses = (inventoryStatuses as any[]).filter((status: any) => {
      if (status.inventoryId !== inventoryId) return false;
      if (!status.booking?.startAt || !status.booking?.endAt) return false;
      // Count inventory from all statuses except Canceled (6) and Archived (7)
      if (status.booking.status === 6 || status.booking.status === 7) return false;

      // Check for date overlap with normalized dates
      const bookingStart = new Date(status.booking.startAt);
      const bookingEnd = new Date(status.booking.endAt);

      // Normalize dates to start of day for comparison
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

      const hasDateOverlap =
        normalizedBookingStart <= normalizedEndDate && normalizedBookingEnd >= normalizedStartDate;

      return hasDateOverlap;
    });

    if (conflictingStatuses.length > 0) {
      // Group by pavilion to show conflicts more clearly
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

    // Check if stock will be low after this booking
    const remainingStock = availableStock - requestedQuantity;

    if (remainingStock < 5 && remainingStock >= 0) {
      warnings.push(`Low stock warning: Only ${remainingStock} items will remain on this day.`);
    }

    return { conflicts, warnings };
  };

  // Handle conflict click to show detailed dialog
  const handleConflictClick = (inventoryId: number, requestedQuantity: number = 0) => {
    const inventory = inventoryItems.find(item => item.id === inventoryId);
    if (!inventory || !startDate || !endDate) return;

    const conflictingBookings = (inventoryStatuses as any[])
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
      .map((status: any) => ({
        bookingId: status.bookingId || 0,
        eventName: status.booking?.eventName || "Unknown Event",
        pavilionName: status.pavilion?.name || `Pavilion ${status.pavilionId}`,
        quantity: status.quantity || 0,
        startAt: new Date(status.booking!.startAt!),
        endAt: new Date(status.booking!.endAt!),
      }));

    setConflictData({
      inventoryItem: inventory,
      conflictingBookings,
      requestedQuantity,
      selectedStartDate: startDate,
      selectedEndDate: endDate,
    });
    setIsConflictDialogOpen(true);
  };

  // Filter inventory items
  const filteredInventoryItems = inventoryItems.filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(inventorySearchQuery.toLowerCase());
    const matchesCategory =
      selectedInventoryCategoryFilter === "all" ||
      item.categoryId?.toString() === selectedInventoryCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetInventoryFilters = () => {
    setSelectedInventoryCategoryFilter("all");
    setInventorySearchQuery("");
  };

  const resetSelectedItemsFilters = () => {
    setSelectedItemsCategoryFilter("all");
    setSelectedItemsSearchQuery("");
  };

  // Removed discountData query; discount name fetched directly on submit.

  // Fetch discount percent + name whenever selectedDiscountId changes
  useEffect(() => {
    let active = true;
    async function run() {
      if (selectedDiscountId == null) {
        if (active) {
          setDiscountPercentage(0);
          setDiscountName("");
        }
        return;
      }
      try {
        const data = await getDiscountById(selectedDiscountId);
        const rec = data?.[0];
        if (active) {
          setDiscountName(rec?.name || "");
          setDiscountPercentage(typeof rec?.percent === "number" ? rec.percent : 0);
        }
      } catch (e) {
        if (active) {
          setDiscountPercentage(0);
          setDiscountName("");
        }
      }
    }
    run();
    return () => {
      active = false;
    };
  }, [selectedDiscountId]);

  // Removed mop state & remote fetch; we derive selected mode of payment directly on submit

  // Handler for creating a new service
  const handleCreateService = () => {
    if (newServiceName.trim() && newServiceCategory) {
      createServiceMutation.mutate({
        serviceName: newServiceName.trim(),
        categoryId: parseInt(newServiceCategory),
      });
    }
  };

  const handleSubmitDraft = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields

    // Validate client selection
    if (clientSelectionMode === "existing" && !selectedClientId) {
      return;
    }

    // Additional validation for form fields
    const formData = new FormData(e.currentTarget);
    const eventName = formData.get("eventName");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");

    // Proceed with booking creation
    await handleCreateBooking(e);
  };

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const eventName = formData.get("eventName");
    const numberOfPax = formData.get("numPax");
    const eventType = formData.get("eventType");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const phoneNumber = formData.get("phoneNumber");
    const email = formData.get("email");
    const modeOfPayment = formData.get("modeOfPayment");
    const downpayment = formData.get("downpayment");
    const discount = formData.get("discount");
    const notes = formData.get("notes");

    const selectedModeOfPaymentId = Number(modeOfPayment);
    const selectedModeOfPayment = modeOfPayments.find(m => m.id === selectedModeOfPaymentId);

    const discountIdNum = Number(discount);
    if (!isNaN(discountIdNum) && discountIdNum > 0) {
      setSelectedDiscountId(discountIdNum);
    } else {
      setSelectedDiscountId(null);
    }
    // Merge any form-provided selections with state selections
    const mergedServiceIdsByCategory: Record<number, number[]> = {
      ...selectedServiceIdsByCategory,
    };
    for (const cat of servicesCategory) {
      const values = formData.getAll(`services[${cat.id}][]`).map(v => Number(v));
      if (values.length) {
        mergedServiceIdsByCategory[cat.id] = Array.from(
          new Set([...(mergedServiceIdsByCategory[cat.id] ?? []), ...values])
        );
        continue;
      }

      // If no IDs selected for this category but user typed something, create or reuse existing
      const typed = typedServiceByCategory[cat.id]?.trim();
      if (typed) {
        const existing = allServices.find(
          s => s.categoryId === cat.id && (s.name?.toLowerCase() ?? "") === typed.toLowerCase()
        );
        if (existing) {
          mergedServiceIdsByCategory[cat.id] = Array.from(
            new Set([...(mergedServiceIdsByCategory[cat.id] ?? []), existing.id])
          );
        } else {
          try {
            const created = await createServiceMutation.mutateAsync({
              serviceName: typed,
              categoryId: cat.id,
            });
            if (created?.id) {
              mergedServiceIdsByCategory[cat.id] = Array.from(
                new Set([...(mergedServiceIdsByCategory[cat.id] ?? []), created.id])
              );
            }
          } catch (err) {
            // Failed to create service on submit
          }
        }
      }
    }

    let clientID: number;

    if (clientSelectionMode === "existing" && selectedClientId) {
      // Use existing client
      clientID = selectedClientId;
    } else {
      // Create new client
      const client = await createClientMutation.mutateAsync({
        firstName: String(firstName ?? ""),
        lastName: String(lastName ?? ""),
        phoneNumber: String(phoneNumber ?? ""),
        email: String(email ?? ""),
        province: province ?? "",
        region: region ?? "",
        municipality: municipality ?? "",
        barangay: barangay ?? "",
      });

      clientID = Number(client?.id);

      if (!clientID || isNaN(clientID)) {
        throw new Error("Failed to create client or invalid client ID");
      }
    }

    const serviceIdsFlat = Object.values(mergedServiceIdsByCategory).flat();

    // Validate dates
    const validStartAt = startAt && !isNaN(startAt.getTime()) ? startAt : new Date();
    const validEndAt = endAt && !isNaN(endAt.getTime()) ? endAt : new Date();

    const booking = await createBookingMutation.mutateAsync({
      eventName: String(eventName ?? ""),
      clientID: clientID,
      pavilionID: String(selectedPavilionId),
      pax: String(numberOfPax ?? ""),
      eventType: Number(eventType ?? 0),
      notes: String(notes ?? ""),
      startAt: validStartAt,
      endAt: validEndAt,
      serviceIds: serviceIdsFlat.length ? serviceIdsFlat : undefined,
      packageId: selectedPackageId || undefined,
      catering: selectedCatering ? Number(selectedCatering) : undefined,
    });

    const bookingId = (booking as any)?.id ? Number((booking as any).id) : 0;

    // If in-house catering selected (value "1"), create a menu with selected dishes & their quantities
    if (selectedCatering === "1" && bookingId) {
      try {
        const dishIds = selectedDishes.flatMap(d => Array(d.quantity).fill(d.id));
        await createMenuWithDishes(bookingId, dishIds);
      } catch (err) {
        console.error("Error creating menu:", err);
      }
    }

    // Create inventory status entries for selected inventory items
    if (selectedInventoryItems.length > 0 && bookingId) {
      console.log("Creating inventory statuses for booking:", bookingId);
      console.log("Selected inventory items:", selectedInventoryItems);
      console.log("Selected pavilion ID:", selectedPavilionId);
      try {
        for (const item of selectedInventoryItems) {
          console.log(
            `Creating inventory status: Item ${item.id}, Quantity ${item.quantity}, Pavilion ${selectedPavilionId}, Booking ${bookingId}`
          );
          const result = await createInventoryStatus(
            item.id,
            selectedPavilionId,
            bookingId,
            item.quantity
          );
          console.log("Inventory status created:", result);
        }
        // Invalidate inventory status query to refresh the data immediately
        queryClient.invalidateQueries({ queryKey: ["inventoryStatus"] });

        // Force refetch after a small delay to ensure data is saved
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ["inventoryStatus"] });
          console.log("Forced refetch of inventory status data");
        }, 500);

        console.log("Inventory status query invalidated - should refresh data");
      } catch (err) {
        console.error("Error creating inventory status:", err);
      }
    } else {
      console.log("No inventory items to create status for:", {
        selectedInventoryItemsLength: selectedInventoryItems.length,
        bookingId,
      });
    }

    // Calculate original price for discount calculations
    const selectedPackage = selectedPackageId
      ? packages.find(p => p.id === selectedPackageId)
      : null;
    const basePackagePrice = selectedPackage?.price ?? 0;
    const hoursCount =
      startAt && endAt ? Math.round((endAt.getTime() - startAt.getTime()) / (60 * 60 * 1000)) : 0;
    const extraHours = Math.max(0, hoursCount - 5);
    const extraHoursFee = extraHours * 2000;

    // Calculate catering cost if in-house catering is selected
    const cateringCost =
      selectedCatering === "1" && cateringPax && pricePerPax
        ? parseFloat(cateringPax) * parseFloat(pricePerPax)
        : 0;

    const originalPrice = basePackagePrice + extraHoursFee + cateringCost;

    // Handle discount creation and calculation
    let finalDiscountId = selectedDiscountId;
    let finalDiscountType = "";
    let finalDiscountPercentage = 0;
    let finalDiscountAmount = 0;
    let finalIsCustomDiscount = false;

    // Calculate discount based on current state
    if (discountType === "predefined" && selectedDiscountId) {
      const selectedDiscount = discounts.find(d => d.id === selectedDiscountId);
      if (selectedDiscount) {
        finalDiscountType = selectedDiscount.name || "";
        if (selectedDiscount.percent) {
          finalDiscountPercentage = selectedDiscount.percent;
          finalDiscountAmount = originalPrice * (selectedDiscount.percent / 100);
        } else if (selectedDiscount.amount) {
          finalDiscountAmount = Math.min(selectedDiscount.amount, originalPrice);
          finalDiscountPercentage =
            originalPrice > 0 ? (finalDiscountAmount / originalPrice) * 100 : 0;
        }
      }
    } else if (discountType === "custom" && customDiscountValue > 0) {
      finalDiscountType = customDiscountName;
      if (customDiscountType === "percent") {
        finalDiscountPercentage = customDiscountValue;
        finalDiscountAmount = originalPrice * (customDiscountValue / 100);
      } else {
        finalDiscountAmount = Math.min(customDiscountValue, originalPrice);
        finalDiscountPercentage =
          originalPrice > 0 ? (finalDiscountAmount / originalPrice) * 100 : 0;
      }
    }

    // If custom discount is selected, create it first in the database
    if (discountType === "custom" && customDiscountName && customDiscountValue > 0) {
      try {
        const customDiscount = await createDiscount({
          name: customDiscountName,
          percent: customDiscountType === "percent" ? customDiscountValue : undefined,
          amount: customDiscountType === "amount" ? customDiscountValue : undefined,
          description: customDiscountDescription || undefined,
          isActive: true,
        });

        if (customDiscount?.id) {
          finalDiscountId = customDiscount.id;
          finalIsCustomDiscount = true;
        }
      } catch (err) {
        // Continue with no discount if creation fails
        finalDiscountId = null;
        finalDiscountType = "";
        finalDiscountPercentage = 0;
        finalDiscountAmount = 0;
      }
    }

    // Calculate final discounted price
    const finalDiscountedPrice = Math.max(0, originalPrice - finalDiscountAmount);

    const billing = await createBillingMutation.mutateAsync({
      bookingId: Number(bookingId ?? 0),
      originalPrice: Number(originalPrice || 0),
      discountedPrice: finalDiscountedPrice,
      discountType: finalDiscountType,
      discountPercentage: Number(finalDiscountPercentage),
      balance: Number(finalDiscountedPrice),
      modeOfPayment: selectedModeOfPayment?.name ?? "",
      deposit: Number(downpayment || 0),
      status: 1,
      discountAmount: finalDiscountAmount,
      discountId: finalDiscountId || undefined,
      isCustomDiscount: finalIsCustomDiscount,
      catering: selectedCatering === "1" && cateringCost > 0 ? cateringCost : undefined,
      cateringPerPaxAmount:
        selectedCatering === "1" && pricePerPax ? parseFloat(pricePerPax) : undefined,
    });

    // Show success dialog
    setShowBookingSuccessDialog(true);
  };

  const handlePavilionSelect = (e: string) => {
    // Handle pavilion selection
  };

  // Removed unused price change handlers (hours, pavilion, total) to satisfy lint; add back if needed where values are updated.

  const [numPax, setNumPax] = useState<string>("");

  // Catering pax and price per pax state
  const [cateringPax, setCateringPax] = useState<string>("");
  const [pricePerPax, setPricePerPax] = useState<string>("");

  // Auto-sync Event Pax to Catering Pax (one-way: event controls catering)
  useEffect(() => {
    if (numPax) {
      setCateringPax(numPax);
    }
  }, [numPax]);

  const getMonthName = (d: Date) => d.toLocaleString("en-US", { month: "long" });

  const getDayName = (d: Date) => d.toLocaleString("en-US", { weekday: "long" });

  const finalStartDay = startAt ? `${getDayName(startAt)},` : "";
  const finalStartDate = startAt
    ? `${getMonthName(startAt).slice(0, 3)} ${startAt.getDate()}, ${startAt.getFullYear()}`
    : "";
  const finalStartTime = startAt
    ? `${startAt.getHours() % 12 || 12}:${
        startAt.getMinutes() < 10 ? `0${startAt.getMinutes()}` : startAt.getMinutes()
      } ${startAt.getHours() >= 12 ? "PM" : "AM"}`
    : "";

  const finalEndDay = endAt ? `${getDayName(endAt)},` : "";
  const finalEndDate = endAt
    ? `${getMonthName(endAt).slice(0, 3)} ${endAt.getDate()}, ${endAt.getFullYear()}`
    : "";
  const finalEndTime = endAt
    ? `${endAt.getHours() % 12 || 12}:${
        endAt.getMinutes() < 10 ? `0${endAt.getMinutes()}` : endAt.getMinutes()
      } ${endAt.getHours() >= 12 ? "PM" : "AM"}`
    : "";

  const getDaysDifference = (start: Date, end: Date) => {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.round((end.getTime() - start.getTime()) / msInDay);
  };

  const getHoursDifference = (start: Date, end: Date) => {
    const msInHour = 60 * 60 * 1000;
    return Math.round((end.getTime() - start.getTime()) / msInHour);
  };

  const totalDays = startAt && endAt && endAt > startAt ? getDaysDifference(startAt, endAt) : "";
  const totalHours = startAt && endAt && endAt > startAt ? getHoursDifference(startAt, endAt) : "";

  const selectedPavilion =
    selectedPavilionId !== null ? (pavilions.find(p => p.id === selectedPavilionId) ?? null) : null;

  const filteredPackages = selectedPavilionId
    ? packages.filter(p => p.pavilionId === selectedPavilionId)
    : [];

  const selectedPackage = selectedPackageId
    ? (filteredPackages.find(p => p.id === selectedPackageId) ?? null)
    : null;
  const selectedPackageItems = (selectedPackage?.description ?? "")
    .split(".")
    .map(s => s.trim())
    .filter(Boolean);

  // Pricing calculations
  const formatCurrency = (n: number) => `₱ ${Math.max(0, Math.round(n)).toLocaleString()}`;
  const basePackagePrice = selectedPackage?.price ?? 0;
  const hoursCount = typeof totalHours === "number" ? totalHours : 0;
  const extraHours = Math.max(0, hoursCount - 5);
  const extraHoursFee = extraHours * 2000;

  // Calculate catering cost if in-house catering is selected
  const cateringCost =
    selectedCatering === "1" && cateringPax && pricePerPax
      ? parseFloat(cateringPax) * parseFloat(pricePerPax)
      : 0;

  const originalPrice = basePackagePrice + extraHoursFee + cateringCost; // before discount

  // Calculate discount amount based on type
  let discountAmount = 0;
  if (discountType === "predefined" && selectedDiscountId) {
    const selectedDiscount = discounts.find(d => d.id === selectedDiscountId);
    if (selectedDiscount) {
      if (selectedDiscount.percent) {
        discountAmount = originalPrice * (selectedDiscount.percent / 100);
      } else if (selectedDiscount.amount) {
        discountAmount = Math.min(selectedDiscount.amount, originalPrice); // Can't discount more than total
      }
    }
  } else if (discountType === "custom" && customDiscountValue > 0) {
    if (customDiscountType === "percent") {
      discountAmount = originalPrice * (customDiscountValue / 100);
    } else {
      discountAmount = Math.min(customDiscountValue, originalPrice); // Can't discount more than total
    }
  }

  const discountedPrice = Math.max(0, originalPrice - discountAmount);
  const finalBalance = discountedPrice;

  if (!isVisible) return null;
  return (
    <form
      id="booking-form"
      action="|"
      onSubmit={handleSubmitDraft}
      className="[--ring:var(--color-red-500)] in-[.dark]:[--ring:var(--color-red-500)]"
    >
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {/* === TABS HEADER === */}
          <div>
            <Tabs defaultValue="tab-1" className="justify-start">
              <TabsList>
                <TabsTrigger value="tab-1" className="text-xs">
                  Date & Time
                </TabsTrigger>
                <TabsTrigger value="tab-2" className="text-xs">
                  Pavilion
                </TabsTrigger>
                <TabsTrigger value="tab-3" className="text-xs">
                  Package
                </TabsTrigger>
                <TabsTrigger value="tab-4" className="text-xs">
                  Food & Catering
                </TabsTrigger>
                <TabsTrigger value="tab-5" className="text-xs">
                  Inventory
                </TabsTrigger>
                <TabsTrigger value="tab-6" className="text-xs">
                  Services
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* === PAVILIONS BLOCK === */}
          <div
            id="pavilion"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div className="">
              <div>
                <p className="font-bold text-lg mb-2">Pavilion</p>
                <div className="flex border-1 p-4 rounded-md justify-between items-center group">
                  <div className="flex items-center gap-4">
                    {selectedPavilion && (
                      <div
                        className="w-1 h-8 rounded-md"
                        style={{
                          backgroundColor: (() => {
                            const sanitized = selectedPavilion.color
                              ?.toLowerCase()
                              .replace(/[^a-z0-9-]/g, "")
                              .split(/-+/)[0];
                            let color: string = "#ef4444"; // fallback red-500
                            if (selectedPavilion.color) {
                              const trimmed = selectedPavilion.color.trim();
                              if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
                                color = trimmed;
                              } else if (sanitized && COLOR_TOKEN_TO_HEX[sanitized]) {
                                color = COLOR_TOKEN_TO_HEX[sanitized];
                              }
                            }
                            return color;
                          })(),
                        }}
                      />
                    )}
                    <div className="flex flex-col justify-start items-start ">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-md">
                          {selectedPavilion ? selectedPavilion.name : "Select a pavilion"}
                        </p>
                        {selectedPavilion && (
                          <Badge variant="secondary" className="text-xs">
                            <Users size={12} className="mr-1 opacity-60" />
                            {selectedPavilion.maxPax} pax
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-normal text-foreground/50">
                        {selectedPavilion
                          ? selectedPavilion.description || "No description available"
                          : "Choose a pavilion to see details"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <div className="mt-2">
                  <Dialog>
                    <DialogTrigger className="w-full">
                      <div className=" flex border-1 p-4 rounded-md justify-between  items-center">
                        <div className="flex flex-col justify-start items-start">
                          <p className="flex font-medium gap-2 items-center text-md">
                            {selectedPackage ? selectedPackage.name : "Select a package"}
                            {selectedPackage && (
                              <span className="text-xs font-normal">
                                (₱{selectedPackage.price.toLocaleString()})
                              </span>
                            )}
                          </p>
                          <p className="text-xs font-normal text-foreground/50">
                            {selectedPackage
                              ? selectedPackage.description || "No description available"
                              : "Choose a package to see details"}
                          </p>
                        </div>

                        <Pen size={18} />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Select a Package</DialogTitle>
                        <DialogDescription className="mt-4">
                          <div>
                            <RadioGroup
                              name="package"
                              className="flex flex-col"
                              onValueChange={val => setSelectedPackageId(Number(val))}
                            >
                              {selectedPavilionId === null && (
                                <div className="col-span-4 text-sm text-muted-foreground">
                                  Select a pavilion to see its packages.
                                </div>
                              )}
                              {selectedPavilionId !== null && filteredPackages.length === 0 && (
                                <div className="col-span-4 text-sm text-muted-foreground">
                                  No packages available for the selected pavilion.
                                </div>
                              )}
                              {filteredPackages.map(pack => {
                                const items = (pack.description ?? "")
                                  .split(".")
                                  .map(s => s.trim())
                                  .filter(Boolean);
                                return (
                                  <div
                                    key={pack.id}
                                    className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none"
                                  >
                                    <RadioGroupItem
                                      value={`${pack.id}`}
                                      id={`${pack.id}`}
                                      aria-describedby={`${id}-package-${pack.id}-description`}
                                      className="order-1 after:absolute after:inset-0"
                                    />
                                    <div className="grid grow gap-2">
                                      <Label className="flex items-center" htmlFor={`${pack.id}`}>
                                        {pack.name}
                                        <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal">
                                          {`(₱${pack.price.toLocaleString()})`}
                                        </span>
                                      </Label>
                                      <div
                                        id={`${id}-package-${pack.id}-description`}
                                        className="text-muted-foreground text-xs"
                                      >
                                        <ul className="list-disc list-inside space-y-1">
                                          {items.map((it, idx) => (
                                            <li key={idx}>{it}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </RadioGroup>
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* === CLIENT BLOCK === */}
          <div
            id="services"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg -mb-2">Client Details</p>

            {/* Client Selection Mode */}
            <div className="mt-5">
              <RadioGroup
                value={clientSelectionMode}
                onValueChange={(value: "new" | "existing") => {
                  setClientSelectionMode(value);
                  if (value === "new") {
                    setSelectedClientId(null);
                    setClientSearchQuery("");
                  }
                }}
                className="grid grid-cols-2 gap-4"
              >
                {/* New Client Radio Card */}
                <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-row flex-1 items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                  <div className="flex flex-col grow gap-2 justify-start items-baseline">
                    <Label htmlFor={`${id}-new-client`} className="flex items-center">
                      <Plus className="mr-2" size={20} />
                      New Client
                    </Label>
                  </div>
                  <RadioGroupItem
                    value="new"
                    id={`${id}-new-client`}
                    aria-describedby={`${id}-new-client-description`}
                    className="after:absolute after:inset-0"
                  />
                </div>

                {/* Existing Client Radio Card */}
                <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-row flex-1 items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                  <div className="flex flex-col grow gap-2 justify-start items-baseline">
                    <Label htmlFor={`${id}-existing-client`} className="flex items-center">
                      <Users className="mr-2" size={20} />
                      Existing Client
                    </Label>
                  </div>
                  <RadioGroupItem
                    value="existing"
                    id={`${id}-existing-client`}
                    aria-describedby={`${id}-existing-client-description`}
                    className="after:absolute after:inset-0"
                  />
                </div>
              </RadioGroup>
            </div>

            <div className="">
              <div className="mt-5">
                <div>
                  {clientSelectionMode === "existing" ? (
                    /* Existing Client Selection with Package Button Design */
                    <div className="space-y-4">
                      <Dialog>
                        <DialogTrigger className="w-full">
                          <div className="flex border-1 p-4 rounded-md justify-between items-center">
                            <div className="flex flex-col justify-start items-start">
                              <p className="flex font-medium gap-2 items-center text-md">
                                {selectedClientId
                                  ? (() => {
                                      const selectedClient = allClients.find(
                                        c => c.id === selectedClientId
                                      );
                                      return selectedClient
                                        ? `${selectedClient.firstName} ${selectedClient.lastName}`
                                        : "Select an existing client";
                                    })()
                                  : "Select an existing client"}
                                {selectedClientId &&
                                  (() => {
                                    const selectedClient = allClients.find(
                                      c => c.id === selectedClientId
                                    );
                                    return selectedClient?.phoneNumber ? (
                                      <span className="text-xs font-normal">
                                        ({selectedClient.phoneNumber})
                                      </span>
                                    ) : null;
                                  })()}
                              </p>
                              <p className="text-xs font-normal text-foreground/50 text-left">
                                {selectedClientId
                                  ? (() => {
                                      const selectedClient = allClients.find(
                                        c => c.id === selectedClientId
                                      );
                                      return selectedClient
                                        ? [
                                            selectedClient.region,
                                            selectedClient.province,
                                            selectedClient.municipality,
                                            selectedClient.barangay,
                                          ]
                                            .filter(Boolean)
                                            .join(", ") || "No address available"
                                        : "Choose a client to see details";
                                    })()
                                  : "Choose a client to see details"}
                              </p>
                            </div>
                            <Pen size={18} />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Select an Existing Client</DialogTitle>
                            <DialogDescription className="mt-4">
                              <div className="space-y-4">
                                <div>
                                  <Label className="font-normal text-foreground/50">
                                    Search Client
                                  </Label>
                                  <InputGroup className="mt-2">
                                    <InputGroupInput
                                      placeholder="Search by name, email, or phone..."
                                      value={clientSearchQuery}
                                      onChange={e => setClientSearchQuery(e.target.value)}
                                    />
                                    <InputGroupAddon>
                                      <SearchIcon />
                                    </InputGroupAddon>
                                    {clientSearchQuery && (
                                      <InputGroupAddon align="inline-end">
                                        <InputGroupButton
                                          type="button"
                                          onClick={() => setClientSearchQuery("")}
                                        >
                                          Clear
                                        </InputGroupButton>
                                      </InputGroupAddon>
                                    )}
                                  </InputGroup>
                                </div>

                                <div className="border rounded-md max-h-[300px] overflow-y-auto">
                                  <RadioGroup
                                    value={selectedClientId?.toString() || ""}
                                    onValueChange={val => setSelectedClientId(Number(val))}
                                    className="p-2"
                                  >
                                    {allClients
                                      .filter(client => {
                                        if (!clientSearchQuery) return true;
                                        const searchTerm = clientSearchQuery.toLowerCase();
                                        return (
                                          client.firstName?.toLowerCase().includes(searchTerm) ||
                                          client.lastName?.toLowerCase().includes(searchTerm) ||
                                          client.email?.toLowerCase().includes(searchTerm) ||
                                          client.phoneNumber?.toLowerCase().includes(searchTerm) ||
                                          client.region?.toLowerCase().includes(searchTerm) ||
                                          client.province?.toLowerCase().includes(searchTerm) ||
                                          client.municipality?.toLowerCase().includes(searchTerm) ||
                                          client.barangay?.toLowerCase().includes(searchTerm)
                                        );
                                      })
                                      .slice(0, 20)
                                      .map(client => (
                                        <div
                                          key={client.id}
                                          className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-3 shadow-xs outline-none mb-2"
                                        >
                                          <RadioGroupItem
                                            value={client.id.toString()}
                                            id={`client-${client.id}`}
                                            aria-describedby={`client-${client.id}-description`}
                                            className="order-1 after:absolute after:inset-0"
                                          />
                                          <div className="grid grow gap-1">
                                            <Label
                                              className="flex items-center font-medium"
                                              htmlFor={`client-${client.id}`}
                                            >
                                              {client.firstName} {client.lastName}
                                              <span className="ml-2 text-muted-foreground text-xs font-normal">
                                                {client.phoneNumber}
                                              </span>
                                            </Label>
                                            <div
                                              id={`client-${client.id}-description`}
                                              className="text-muted-foreground text-xs"
                                            >
                                              <div className="mb-1">
                                                {[
                                                  client.region,
                                                  client.province,
                                                  client.municipality,
                                                  client.barangay,
                                                ]
                                                  .filter(Boolean)
                                                  .join(", ") || "No address"}
                                              </div>
                                              {client.bookings && client.bookings.length > 0 && (
                                                <div className="text-blue-600">
                                                  {client.bookings.length} past booking(s) • Latest:{" "}
                                                  {client.bookings.sort((a, b) => {
                                                    if (!a.startAt || !b.startAt) return 0;
                                                    return (
                                                      new Date(b.startAt).getTime() -
                                                      new Date(a.startAt).getTime()
                                                    );
                                                  })[0]?.eventName || "Unknown"}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    {allClients.filter(client => {
                                      if (!clientSearchQuery) return true;
                                      const searchTerm = clientSearchQuery.toLowerCase();
                                      return (
                                        client.firstName?.toLowerCase().includes(searchTerm) ||
                                        client.lastName?.toLowerCase().includes(searchTerm) ||
                                        client.email?.toLowerCase().includes(searchTerm) ||
                                        client.phoneNumber?.toLowerCase().includes(searchTerm)
                                      );
                                    }).length === 0 && (
                                      <div className="text-center p-4 text-muted-foreground">
                                        {clientSearchQuery
                                          ? "No clients found matching your search"
                                          : "No clients available"}
                                      </div>
                                    )}
                                  </RadioGroup>
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>

                      {!selectedClientId && (
                        <p className="text-red-500 text-sm">Please select a client to proceed</p>
                      )}
                    </div>
                  ) : (
                    /* New Client Form */
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">First name</Label>
                          <Input name="firstName" placeholder="John" type="text" />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Last name</Label>
                          <Input name="lastName" placeholder="Doe" type="text" />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Phone number</Label>
                          <Input name="phoneNumber" placeholder="09123456789" type="tel" />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Email address</Label>
                          <Input name="email" placeholder="johndoe@gmail.com" type="email" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <RegionComboBoxComponent
                          regionOnChange={setRegion}
                          provinceOnChange={setProvince}
                          municipalityOnChange={setMunicipality}
                          barangayOnChange={setBarangay}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hidden inputs for existing client data */}
                  {clientSelectionMode === "existing" &&
                    selectedClientId &&
                    (() => {
                      const selectedClient = allClients.find(c => c.id === selectedClientId);
                      return selectedClient ? (
                        <>
                          <input
                            type="hidden"
                            name="firstName"
                            value={selectedClient.firstName || ""}
                          />
                          <input
                            type="hidden"
                            name="lastName"
                            value={selectedClient.lastName || ""}
                          />
                          <input
                            type="hidden"
                            name="phoneNumber"
                            value={selectedClient.phoneNumber || ""}
                          />
                          <input type="hidden" name="email" value={selectedClient.email || ""} />
                        </>
                      ) : null;
                    })()}
                </div>
              </div>
            </div>
          </div>

          {/* === DATE AND TIME BLOCK === */}
          <div
            id="date_and_time"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Date and Time</p>
            <div className="flex w-full">
              <div className="w-full">
                <div className="grid grid-cols-2 gap-4 w-full ">
                  <div className="mr-4 flex-grow w-full">
                    <StartDatePickerForm
                      startDateOnChange={setStartDate}
                      initialDate={startDate}
                      disabledDates={bookedDaySet}
                    />
                  </div>
                  <div className="flex-grow w-full">
                    <EndDatePickerForm
                      endDateOnChange={setEndDate}
                      initialDate={
                        preSelectedEndDate ? new Date(preSelectedEndDate) : startDate || undefined
                      }
                      disabledDates={bookedDaySet}
                      minDate={startDate}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4 w-full ">
                    <div className="flex-grow">
                      <TimeStartPickerCreateBookingComponent startTimeOnChange={setStartTime} />
                    </div>
                    <div className="flex-grow">
                      <TimeEndPickerCreateBookingComponent endTimeOnChange={setEndTime} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="ml-4"></div>
            </div>
          </div>
          {/* === EVENT DETAILS BLOCK === */}
          <div
            id="event_details"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Event Details</p>
            <div className="flex">
              <div className="mt-2 *:not-first:mt-2 flex-1">
                <Label className="text-foreground/50 font-normal">Event Name</Label>
                <Input name="eventName" placeholder="Chris' Birthday Party" type="text" />
              </div>
              <div className="mt-2 *:not-first:mt-2 flex-1 ml-4">
                <Label className="text-foreground/50 font-normal">No. of pax</Label>
                <Input
                  name="numPax"
                  placeholder="200"
                  type="text"
                  value={numPax}
                  onChange={e => setNumPax(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="mt-4 *:not-first:mt-2">
              <Label className="text-foreground/50 font-normal">Event type</Label>

              <Select name="eventType">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(eventType => (
                    <SelectItem value={`${eventType.id}`} key={eventType.id}>
                      {eventType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* === CATERING BLOCK === */}
          <div
            id="catering"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">Catering</p>

              <div className="flex gap-2">
                {selectedCatering === "1" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDishesDialogOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Dishes
                  </Button>
                )}

                {selectedCatering === "1" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInventoryDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Select Items
                  </Button>
                )}
              </div>
            </div>

            <div className="">
              <div className="mt-2">
                <div>
                  <RadioGroup
                    className="grid grid-cols-4 "
                    defaultValue="4"
                    orientation="horizontal"
                    name="catering"
                    onValueChange={setSelectedCatering}
                  >
                    {/* Radio card #1 */}
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none min-h-[100px]">
                      <RadioGroupItem
                        value="1"
                        id={`${id}-1`}
                        aria-describedby={`${id}-2-description`}
                        className="order-1 after:absolute after:inset-0"
                      />
                      <div className="flex flex-col grow gap-2 justify-start items-baseline">
                        <Label htmlFor={`${id}-1`} className="flex items-center">
                          <Users className="mr-1" size={20} />
                          {"Susing and Rufins Catering"}
                          <span className="text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div id={`${id}-1-description`} className="text-muted-foreground text-xs">
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>Use the in-house catering.</li>
                            <li>Menu, staff, and setup are handled internally.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {/* Radio card #2 */}

                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <RadioGroupItem
                        value="2"
                        id={`${id}-2`}
                        aria-describedby={`${id}-2-description`}
                        className="order-1 after:absolute after:inset-0"
                      />
                      <div className="flex flex-col grow gap-2 justify-start items-baseline">
                        <Label htmlFor={`${id}-2`} className="flex items-center">
                          <Truck className="mr-1" size={20} />
                          {"3rd Party Catering"}
                          <span className=" ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div id={`${id}-2-description`} className="text-muted-foreground text-xs">
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>Client brings an external caterer.</li>
                            <li>All food, equipment, and utensils are provided by the caterer.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {/* Radio card #3 */}
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <RadioGroupItem
                        value="3"
                        id={`${id}-3`}
                        aria-describedby={`${id}-2-description`}
                        className="order-1 after:absolute after:inset-0"
                      />
                      <div className="flex flex-col grow gap-2">
                        <Label htmlFor={`${id}-2`} className="flex items-center">
                          <Layers className="mr-1" size={20} />
                          {"Hybrid Service"}
                          <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div id={`${id}-2-description`} className="text-muted-foreground text-xs">
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>Client provides an external caterer.</li>
                            <li>
                              Susing and Rufins staff handle serving, table setup, and cleanup.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {/* Radio card #3 */}
                    <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                      <RadioGroupItem
                        value="4"
                        id={`${id}-4`}
                        aria-describedby={`${id}-4-description`}
                        className="order-1 after:absolute after:inset-0"
                      />
                      <div className="flex flex-col grow gap-2">
                        <Label htmlFor={`${id}-4`} className="flex items-center">
                          <MinusCircle className="mr-1" size={20} />
                          {"None"}
                          <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div id={`${id}-4-description`} className="text-muted-foreground text-xs">
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>No catering service included.</li>
                            <li>No food or beverage arrangements are needed.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              {selectedCatering === "1" && (
                <div className="w-full h-fit mt-4">
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-foreground/50">Pax</p>
                      <InputGroup>
                        <InputGroupInput
                          placeholder="200"
                          value={cateringPax}
                          onChange={e => setCateringPax(e.target.value)}
                          type="number"
                          min="0"
                        />
                        <InputGroupAddon>
                          <Users />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-foreground/50">Price per pax</p>
                      <InputGroup>
                        <InputGroupInput
                          placeholder="200"
                          value={pricePerPax}
                          onChange={e => setPricePerPax(e.target.value)}
                          type="number"
                          min="0"
                          step="0.01"
                        />
                        <InputGroupAddon>
                          <Banknote />
                        </InputGroupAddon>
                      </InputGroup>
                    </div>
                  </div>

                  <div className="border rounded-md mt-4">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Dish</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {selectedDishes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No dishes selected
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedDishes.map(dish => {
                            const category = categoriesSource?.find(c => c.id === dish.categoryId);
                            const dishNameWithQuantity =
                              dish.quantity > 1 ? `${dish.name} x${dish.quantity}` : dish.name;
                            return (
                              <TableRow key={dish.id}>
                                <TableCell className="font-medium flex-1 grow">
                                  {dishNameWithQuantity}
                                </TableCell>
                                <TableCell>{category?.name || "—"}</TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => removeDish(dish.id)}
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
                  </div>

                  <div id="inventory" className="w-full h-fit border-t-1 pt-6 mt-8">
                    <div className="mb-2">
                      <p className="">Inventory Items</p>
                    </div>

                    <div className="">
                      <div className="">
                        {/* Inventory Selection Dialog - Reusable Component */}
                        <InventorySelectionDialog
                          isOpen={isInventoryDialogOpen}
                          onClose={() => setIsInventoryDialogOpen(false)}
                          selectedItems={selectedInventoryItems}
                          onSave={setSelectedInventoryItems}
                          startDate={startDate}
                          endDate={endDate}
                        />

                        {/* Inventory Conflict Dialog */}
                        {isConflictDialogOpen && conflictData && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                              <div className="border-b px-6 py-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Inventory Conflict Details
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      {conflictData.inventoryItem.name} - Requested:{" "}
                                      {conflictData.requestedQuantity} items
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsConflictDialogOpen(false);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>

                              <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                                {/* Booking Comparison - Side by Side */}
                                <div className="mb-6">
                                  <h4 className="font-medium text-gray-900 mb-4">
                                    Booking Timeline Comparison
                                  </h4>
                                  {/* Your New Booking - Always First */}
                                  <div className="mb-4">
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <div className="text-center">
                                        <h5 className="font-medium text-blue-900 text-start ">
                                          Your New Booking
                                        </h5>
                                      </div>
                                      <div>
                                        <div className="text-sm text-blue-700">
                                          {/* Extract pavilion from selected pavilion ID */}
                                          {pavilions.find(p => p.id === selectedPavilionId)?.name ||
                                            "Selected Pavilion"}
                                        </div>
                                        <div className="text-sm text-blue-700">
                                          {format(conflictData.selectedStartDate, "MMM dd, h:mm a")}{" "}
                                          - {format(conflictData.selectedEndDate, "h:mm a")}
                                        </div>
                                        <div className="text-sm font-medium text-blue-900">
                                          Needs: {conflictData.requestedQuantity} items
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Conflicting Bookings Grid */}
                                  <div
                                    className={`grid gap-2 ${conflictData.conflictingBookings.length === 1 ? "grid-cols-1 mx-auto" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
                                  >
                                    {conflictData.conflictingBookings.map((booking, index) => {
                                      // Calculate time gap between bookings
                                      const newBookingEnd = conflictData.selectedEndDate;
                                      const newBookingStart = conflictData.selectedStartDate;
                                      const conflictEnd = booking.endAt;
                                      const conflictStart = booking.startAt;

                                      let timeGap = "";
                                      let gapDirection = "";

                                      if (conflictEnd <= newBookingStart) {
                                        // Conflict ends before new booking starts
                                        const hoursApart = Math.round(
                                          (newBookingStart.getTime() - conflictEnd.getTime()) /
                                            (1000 * 60 * 60)
                                        );
                                        timeGap = `${hoursApart} hours apart`;
                                        gapDirection = "before";
                                      } else if (newBookingEnd <= conflictStart) {
                                        // New booking ends before conflict starts
                                        const hoursApart = Math.round(
                                          (conflictStart.getTime() - newBookingEnd.getTime()) /
                                            (1000 * 60 * 60)
                                        );
                                        timeGap = `${hoursApart} hours apart`;
                                        gapDirection = "after";
                                      } else {
                                        // Overlapping
                                        timeGap = "Overlapping";
                                        gapDirection = "overlap";
                                      }

                                      return (
                                        <div
                                          key={index}
                                          className="bg-red-50 border border-red-200 rounded-lg p-4 w-full"
                                        >
                                          <div className="text-center flex gap-2 items-center">
                                            <h5 className="font-medium text-red-900 text-start">
                                              Conflicting Booking
                                            </h5>
                                            {timeGap && (
                                              <div
                                                className={`text-xs px-2 py-1 rounded-full inline-block ${
                                                  gapDirection === "overlap"
                                                    ? "bg-red-200 text-red-800"
                                                    : "bg-yellow-200 text-yellow-800"
                                                }`}
                                              >
                                                {timeGap}
                                              </div>
                                            )}
                                          </div>
                                          <div>
                                            <div className="font-medium text-red-900">
                                              {booking.eventName}
                                            </div>
                                            <div className="text-sm text-red-700">
                                              {booking.pavilionName}
                                            </div>
                                            <div className="text-sm text-red-700">
                                              {format(booking.startAt, "MMM dd, h:mm a")} -{" "}
                                              {format(booking.endAt, "h:mm a")}
                                            </div>
                                            <div className="text-sm font-medium text-red-900">
                                              Using: {booking.quantity} items
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Summary & Analysis */}
                                <div className="bg-gray-50 border rounded-lg p-4">
                                  <h4 className="font-medium text-gray-900 mb-3">Analysis</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <div className="font-medium text-gray-700">
                                        Total Inventory
                                      </div>
                                      <div className="text-2xl font-bold text-gray-900">
                                        {conflictData.inventoryItem.quantity}
                                      </div>
                                      <div className="text-xs text-gray-500">Available items</div>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-700">
                                        Currently Used
                                      </div>
                                      <div className="text-2xl font-bold text-red-600">
                                        {conflictData.conflictingBookings.reduce(
                                          (sum, booking) => sum + booking.quantity,
                                          0
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        On{" "}
                                        {conflictData.conflictingBookings
                                          .map(b => b.eventName)
                                          .join(", ")}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-700">Remaining</div>
                                      <div className="text-2xl font-bold text-green-600">
                                        {conflictData.inventoryItem.quantity -
                                          conflictData.conflictingBookings.reduce(
                                            (sum, booking) => sum + booking.quantity,
                                            0
                                          )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Available for booking
                                      </div>
                                    </div>
                                  </div>

                                  {conflictData.requestedQuantity >
                                    conflictData.inventoryItem.quantity -
                                      conflictData.conflictingBookings.reduce(
                                        (sum, booking) => sum + booking.quantity,
                                        0
                                      ) && (
                                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                                      <div className="text-sm text-red-800">
                                        <strong>Cannot proceed:</strong> You requested{" "}
                                        {conflictData.requestedQuantity} items, but only{" "}
                                        {conflictData.inventoryItem.quantity -
                                          conflictData.conflictingBookings.reduce(
                                            (sum, booking) => sum + booking.quantity,
                                            0
                                          )}{" "}
                                        items are available on the selected dates.
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="border-t px-6 py-4 bg-gray-50">
                                <div className="flex justify-end gap-3">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsConflictDialogOpen(false);
                                    }}
                                  >
                                    Close
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setIsConflictDialogOpen(false);
                                      // Could add logic to auto-adjust quantity or dates
                                    }}
                                  >
                                    Understood
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Display Selected Inventory Items */}
                        <div className="border rounded-md mt-4">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead className="w-20">Actions</TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {selectedInventoryItems.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-muted-foreground"
                                  >
                                    No items selected
                                  </TableCell>
                                </TableRow>
                              ) : (
                                selectedInventoryItems.map(selectedItem => {
                                  const item = inventoryItems.find(
                                    inv => inv.id === selectedItem.id
                                  );
                                  const category = inventoryCategoriesData?.find(
                                    (c: any) => c.id === item?.categoryId
                                  );
                                  const conflicts = getInventoryConflicts(
                                    selectedItem.id,
                                    selectedItem.quantity
                                  );

                                  return (
                                    <>
                                      <TableRow key={selectedItem.id}>
                                        <TableCell className="font-medium flex-1 grow">
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
                                      {/* Warnings Row */}
                                      {conflicts.warnings.length > 0 && (
                                        <TableRow key={`${selectedItem.id}-warnings`}>
                                          <TableCell
                                            colSpan={4}
                                            className="bg-orange-50 text-orange-600 text-xs py-2"
                                          >
                                            {conflicts.warnings.map((warning, idx) => (
                                              <div key={idx} className="py-1">
                                                {warning}
                                              </div>
                                            ))}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                      {/* Conflicts Row */}
                                      {conflicts.conflicts.length > 0 && (
                                        <TableRow key={`${selectedItem.id}-conflicts`}>
                                          <TableCell
                                            colSpan={4}
                                            className="bg-red-50 text-red-600 text-xs py-2"
                                          >
                                            {conflicts.conflicts.map((conflict, idx) => (
                                              <div key={idx} className="py-1">
                                                <button
                                                  type="button"
                                                  onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleConflictClick(
                                                      selectedItem.id,
                                                      selectedItem.quantity
                                                    );
                                                  }}
                                                  className="text-left hover:underline"
                                                >
                                                  🚫 {conflict}
                                                </button>
                                              </div>
                                            ))}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </>
                                  );
                                })
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Custom Manage Dishes Modal */}
                  {isDishesDialogOpen && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/60 z-[200]"
                        onClick={() => setIsDishesDialogOpen(false)}
                      />
                      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-[1400px] max-h-[90vh] overflow-auto p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h2 className="text-xl font-semibold">Manage Dishes</h2>
                              <p className="text-sm text-muted-foreground">
                                Add, edit, or remove dishes from your menu.
                              </p>
                            </div>
                            <Button
                              type="button"
                              className="text-foreground hover:text-foreground/70 transition-all"
                              variant="link"
                              onClick={() => setIsDishesDialogOpen(false)}
                            >
                              <X />
                            </Button>
                          </div>

                          {/* 2-Column Layout */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LEFT COLUMN - Current Selected Dishes */}
                            <div className="space-y-6">
                              {/* Current Selected Dishes */}
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h3 className="text-lg font-medium">
                                    Selected Dishes for this Booking
                                  </h3>
                                  <span className="text-sm text-muted-foreground">
                                    {filteredSelectedDishes.length} of {selectedDishes.length}{" "}
                                    dishes
                                  </span>
                                </div>

                                {/* Filter and Search Controls for Selected Dishes */}
                                <div className="flex gap-2 mb-2">
                                  <Select
                                    value={selectedDishesCategoryFilter}
                                    onValueChange={setSelectedDishesCategoryFilter}
                                  >
                                    <SelectTrigger className="w-[200px]">
                                      <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[400]">
                                      <SelectItem value="all">All Categories</SelectItem>
                                      {categoriesSource?.map(
                                        (category: { id: number; name: string }) => (
                                          <SelectItem
                                            key={category.id}
                                            value={category.id.toString()}
                                          >
                                            {category.name}
                                          </SelectItem>
                                        )
                                      )}
                                    </SelectContent>
                                  </Select>

                                  <InputGroup className="mb-2">
                                    <InputGroupInput
                                      placeholder="Search selected dishes..."
                                      value={selectedDishesSearchQuery}
                                      onChange={e => setSelectedDishesSearchQuery(e.target.value)}
                                    />
                                    <InputGroupAddon>
                                      <SearchIcon />
                                    </InputGroupAddon>
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        type="button"
                                        onClick={resetSelectedDishesFilters}
                                      >
                                        Clear All
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  </InputGroup>
                                </div>
                                <div className="border rounded-md max-h-[70vh] overflow-y-auto">
                                  <ScrollArea className="h-[200px] w-full flex flex-1 grow">
                                    <Table>
                                      <TableHeader className="sticky top-0 bg-white z-10">
                                        <TableRow>
                                          <TableHead>Dish Name</TableHead>
                                          <TableHead>Category</TableHead>
                                          <TableHead className="w-20">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>

                                      <TableBody>
                                        {selectedDishes.length === 0 ? (
                                          <TableRow>
                                            <TableCell
                                              colSpan={3}
                                              className="text-center text-muted-foreground"
                                            >
                                              No dishes selected for this booking
                                            </TableCell>
                                          </TableRow>
                                        ) : filteredSelectedDishes.length === 0 ? (
                                          <TableRow>
                                            <TableCell
                                              colSpan={3}
                                              className="text-center text-muted-foreground"
                                            >
                                              {selectedDishesSearchQuery.trim() !== "" ||
                                              selectedDishesCategoryFilter !== "all"
                                                ? `No selected dishes found matching your filters. ${selectedDishesSearchQuery.trim() !== "" ? `Search: ${selectedDishesSearchQuery}` : ""} ${selectedDishesCategoryFilter !== "all" ? `Category: ${categoriesSource?.find(c => c.id.toString() === selectedDishesCategoryFilter)?.name}` : ""}`
                                                : "No dishes selected for this booking"}
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          filteredSelectedDishes.map(dish => {
                                            const category = categoriesSource?.find(
                                              (c: { id: number; name: string }) =>
                                                c.id === dish.categoryId
                                            );
                                            const dishNameWithQuantity =
                                              dish.quantity > 1
                                                ? `${dish.name} x${dish.quantity}`
                                                : dish.name;
                                            return (
                                              <TableRow key={dish.id}>
                                                <TableCell className="font-medium flex-1 grow">
                                                  {dishNameWithQuantity}
                                                </TableCell>
                                                <TableCell>{category?.name ?? "—"}</TableCell>
                                                <TableCell>
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() => removeDish(dish.id)}
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
                            </div>

                            {/* RIGHT COLUMN - All Available Dishes */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-medium">All Available Dishes</h3>
                                <span className="text-sm text-muted-foreground">
                                  {filteredDishes.length} of {dishesSource?.length || 0} dishes
                                  {allDishesQuery.isLoading && " (Loading...)"}
                                  {allDishesQuery.error && " (Error loading)"}
                                </span>
                              </div>
                              <div className="flex gap-2 mb-2">
                                <Select
                                  value={selectedDishCategoryFilter}
                                  onValueChange={setSelectedDishCategoryFilter}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[400]">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categoriesSource?.map(
                                      (category: { id: number; name: string }) => (
                                        <SelectItem
                                          key={category.id}
                                          value={category.id.toString()}
                                        >
                                          {category.name}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>

                                <InputGroup className="mb-2">
                                  <InputGroupInput
                                    placeholder="Search dishes..."
                                    value={dishSearchQuery}
                                    onChange={e => setDishSearchQuery(e.target.value)}
                                  />
                                  <InputGroupAddon>
                                    <SearchIcon />
                                  </InputGroupAddon>
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton type="button" onClick={resetDishFilters}>
                                      Clear All
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                </InputGroup>
                              </div>

                              <div className="border rounded-md max-h-[70vh] overflow-y-auto">
                                <ScrollArea className="h-[400px] w-full flex flex-1 grow">
                                  <Table>
                                    <TableHeader className="sticky top-0 bg-white">
                                      <TableRow>
                                        <TableHead>Dish Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="w-24">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {allDishesQuery.isLoading ? (
                                        <TableRow>
                                          <TableCell colSpan={3} className="text-center py-8">
                                            Loading dishes...
                                          </TableCell>
                                        </TableRow>
                                      ) : allDishesQuery.error ? (
                                        <TableRow>
                                          <TableCell
                                            colSpan={3}
                                            className="text-center py-8 text-red-600"
                                          >
                                            Error loading dishes: {allDishesQuery.error?.message}
                                          </TableCell>
                                        </TableRow>
                                      ) : filteredDishes.length > 0 ? (
                                        filteredDishes.map((dish: any) => {
                                          const category = categoriesSource?.find(
                                            (c: { id: number; name: string }) =>
                                              c.id === dish.categoryId
                                          );
                                          const isSelected = selectedDishes.some(
                                            sd => sd.id === dish.id
                                          );

                                          return (
                                            <TableRow
                                              key={dish.id}
                                              className={isSelected ? "bg-green-50" : ""}
                                            >
                                              <TableCell className="font-medium">
                                                {dish.name}
                                              </TableCell>
                                              <TableCell>{category?.name ?? "—"}</TableCell>
                                              <TableCell>
                                                <div className="flex gap-1">
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => addDish(dish)}
                                                  >
                                                    <Plus className="w-3 h-3" />
                                                  </Button>
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingDish(dish)}
                                                  >
                                                    <Pencil className="w-3 h-3" />
                                                  </Button>
                                                  <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() =>
                                                      deleteDishMutation.mutate(dish.id)
                                                    }
                                                    disabled={deleteDishMutation.isPending}
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={3}
                                            className="text-center py-8 text-muted-foreground"
                                          >
                                            {dishSearchQuery.trim() !== "" ||
                                            selectedDishCategoryFilter !== "all"
                                              ? `No dishes found matching your filters. ${dishSearchQuery.trim() !== "" ? `Search: ${dishSearchQuery}` : ""} ${selectedDishCategoryFilter !== "all" ? `Category: ${categoriesSource?.find(c => c.id.toString() === selectedDishCategoryFilter)?.name}` : ""}`
                                              : "No dishes available."}
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </ScrollArea>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Nested Edit Dish Modal */}
                        {editingDish && (
                          <>
                            <div
                              className="fixed inset-0 bg-black/60 z-[209]"
                              onClick={() => setEditingDish(null)}
                            />
                            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] max-h-[80vh] overflow-auto p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Edit Dish</h3>
                                  <Button
                                    type="button"
                                    variant="link"
                                    onClick={() => setEditingDish(null)}
                                    className="text-foreground hover:text-foreground/80 transition-all"
                                  >
                                    <X />
                                  </Button>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-dish-name">Dish Name</Label>
                                    <Input
                                      id="edit-dish-name"
                                      defaultValue={editingDish.name}
                                      placeholder="Enter dish name"
                                      onChange={e =>
                                        setEditingDish({
                                          ...editingDish,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-dish-category">Category</Label>
                                    <Select
                                      value={editingDish.categoryId?.toString() || ""}
                                      onValueChange={value => {
                                        setEditingDish({
                                          ...editingDish,
                                          categoryId: Number(value),
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="z-[400]">
                                        {categoriesSource?.map(
                                          (category: { id: number; name: string }) => (
                                            <SelectItem
                                              key={category.id}
                                              value={category.id.toString()}
                                            >
                                              {category.name}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex gap-2 justify-end pt-4">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => setEditingDish(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => {
                                        updateDishMutation.mutate(
                                          {
                                            dishId: editingDish.id,
                                            name: editingDish.name,
                                            categoryId: editingDish.categoryId || 1,
                                          },
                                          {
                                            onSuccess: () => {
                                              setEditingDish(null);
                                            },
                                          }
                                        );
                                      }}
                                      disabled={updateDishMutation.isPending}
                                    >
                                      {updateDishMutation.isPending ? "Saving..." : "Save Changes"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* === INVENTORY BLOCK === */}

          {/* === SELECT SERVICES BLOCK === */}
          <div
            id="services"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">3rd Party Services</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddServiceDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Manage Services
              </Button>
            </div>

            {/* Services Summary Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const allSelectedServices = Object.values(selectedServiceIdsByCategory)
                      .flat()
                      .map(id => allServices.find(s => s.id === id))
                      .filter(Boolean);

                    return allSelectedServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                          No services selected. Click "Manage Services" to add services.
                        </TableCell>
                      </TableRow>
                    ) : (
                      allSelectedServices.map(service => {
                        if (!service) return null;
                        const category = servicesCategory.find(c => c.id === service.categoryId);
                        return (
                          <TableRow key={service.id}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell>{category?.name || "—"}</TableCell>
                          </TableRow>
                        );
                      })
                    );
                  })()}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Manage Services Dialog */}
          {isAddServiceDialogOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/60 z-[200]"
                onClick={() => setIsAddServiceDialogOpen(false)}
              />
              <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-[1400px] max-h-[90vh] overflow-auto p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Manage Services</h2>
                      <p className="text-sm text-muted-foreground">
                        Add or remove services for this booking.
                      </p>
                    </div>
                    <Button
                      className="text-foreground hover:text-foreground/70 transition-all"
                      variant="link"
                      onClick={() => setIsAddServiceDialogOpen(false)}
                    >
                      <X />
                    </Button>
                  </div>

                  {/* 2-Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN - Selected Services */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Selected Services</h3>
                        <div className="border rounded-md max-h-[70vh] overflow-y-auto">
                          <ScrollArea className="h-[300px] w-full">
                            <Table>
                              <TableHeader className="sticky top-0 bg-white z-10">
                                <TableRow>
                                  <TableHead>Service Name</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {(() => {
                                  const allSelectedServices = Object.entries(
                                    selectedServiceIdsByCategory
                                  )
                                    .flatMap(([catId, serviceIds]) =>
                                      serviceIds.map(id => ({
                                        service: allServices.find(s => s.id === id),
                                        categoryId: Number(catId),
                                      }))
                                    )
                                    .filter(item => item.service);

                                  return allSelectedServices.length === 0 ? (
                                    <TableRow>
                                      <TableCell
                                        colSpan={3}
                                        className="text-center text-muted-foreground"
                                      >
                                        No services selected
                                      </TableCell>
                                    </TableRow>
                                  ) : (
                                    allSelectedServices.map(({ service, categoryId }) => {
                                      if (!service) return null;
                                      const category = servicesCategory.find(
                                        c => c.id === categoryId
                                      );
                                      return (
                                        <TableRow key={service.id}>
                                          <TableCell className="font-medium">
                                            {service.name}
                                          </TableCell>
                                          <TableCell>{category?.name || "—"}</TableCell>
                                          <TableCell>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="text-red-600"
                                              onClick={() => {
                                                setSelectedServiceIdsByCategory(prev => ({
                                                  ...prev,
                                                  [categoryId]: (prev[categoryId] || []).filter(
                                                    id => id !== service.id
                                                  ),
                                                }));
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })
                                  );
                                })()}
                              </TableBody>
                            </Table>
                          </ScrollArea>
                        </div>
                      </div>

                      {/* Add New Service */}
                      <div>
                        <h3 className="text-lg font-medium mb-3">Add New Service</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="service-name">Service Name</Label>
                            <Input
                              id="service-name"
                              value={newServiceName}
                              onChange={e => setNewServiceName(e.target.value)}
                              placeholder="Enter service name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="service-category">Category</Label>
                            <Select
                              value={newServiceCategory}
                              onValueChange={setNewServiceCategory}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="z-[400]">
                                {servicesCategory?.map(category => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            onClick={handleCreateService}
                            disabled={
                              !newServiceName.trim() ||
                              !newServiceCategory ||
                              createServiceMutation.isPending
                            }
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN - All Available Services */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium">All Available Services</h3>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <Select
                          value={selectedCategoryFilter}
                          onValueChange={setSelectedCategoryFilter}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent className="z-[400]">
                            <SelectItem value="all">All Categories</SelectItem>
                            {servicesCategory?.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Search services..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="flex-1"
                        />
                      </div>

                      <div className="border rounded-md max-h-[70vh] overflow-y-auto">
                        <ScrollArea className="h-[400px] w-full">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white">
                              <TableRow>
                                <TableHead>Service Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {(() => {
                                const filteredServices = allServices.filter(service => {
                                  if (!service.categoryId) return false;
                                  const matchesCategory =
                                    selectedCategoryFilter === "all" ||
                                    service.categoryId.toString() === selectedCategoryFilter;
                                  const matchesSearch =
                                    searchQuery.trim() === "" ||
                                    service.name?.toLowerCase().includes(searchQuery.toLowerCase());
                                  return matchesCategory && matchesSearch;
                                });

                                return filteredServices.length > 0 ? (
                                  filteredServices.map(service => {
                                    const category = servicesCategory.find(
                                      c => c.id === service.categoryId
                                    );
                                    const isSelected = (
                                      selectedServiceIdsByCategory[service.categoryId || 0] || []
                                    ).includes(service.id);

                                    return (
                                      <TableRow
                                        key={service.id}
                                        className={isSelected ? "bg-green-50" : ""}
                                      >
                                        <TableCell className="font-medium">
                                          {service.name}
                                        </TableCell>
                                        <TableCell>{category?.name ?? "—"}</TableCell>
                                        <TableCell>
                                          <Button
                                            variant={isSelected ? "secondary" : "outline"}
                                            size="sm"
                                            disabled={isSelected}
                                            onClick={() => {
                                              if (!service.categoryId) return;
                                              setSelectedServiceIdsByCategory(prev => ({
                                                ...prev,
                                                [service.categoryId!]: [
                                                  ...(prev[service.categoryId!] || []),
                                                  service.id,
                                                ],
                                              }));
                                            }}
                                          >
                                            {isSelected ? "Selected" : "Add"}
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={3}
                                      className="text-center py-8 text-muted-foreground"
                                    >
                                      No services found
                                    </TableCell>
                                  </TableRow>
                                );
                              })()}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsServiceCategoryDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Manage Categories
                    </Button>
                    <Button type="button" onClick={() => setIsAddServiceDialogOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Add Service Category Modal */}
          {isServiceCategoryDialogOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/60 z-[200]"
                onClick={() => setIsServiceCategoryDialogOpen(false)}
              />
              <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-[1000px] max-h-[90vh] overflow-auto p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">Manage Service Categories</h2>
                      <p className="text-sm text-muted-foreground">
                        Add, edit, or remove service categories.
                      </p>
                    </div>
                    <Button
                      type="button"
                      className="text-foreground hover:text-foreground/70 transition-all"
                      variant="link"
                      onClick={() => setIsServiceCategoryDialogOpen(false)}
                    >
                      <X />
                    </Button>
                  </div>

                  {/* 2-Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN - Existing Categories */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium">Existing Categories</h3>
                        <span className="text-sm text-muted-foreground">
                          {servicesCategory.length}{" "}
                          {servicesCategory.length === 1 ? "category" : "categories"}
                        </span>
                      </div>

                      <div className="border rounded-md">
                        <ScrollArea className="h-[400px] w-full">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                              <TableRow>
                                <TableHead>Category Name</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {servicesCategory.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={2}
                                    className="text-center text-muted-foreground py-8"
                                  >
                                    No categories yet. Create one using the form.
                                  </TableCell>
                                </TableRow>
                              ) : (
                                servicesCategory.map(category => (
                                  <TableRow key={category.id}>
                                    <TableCell>
                                      {editingCategoryId === category.id ? (
                                        <Input
                                          value={editingCategoryName}
                                          onChange={e => setEditingCategoryName(e.target.value)}
                                          className="h-8"
                                          autoFocus
                                        />
                                      ) : (
                                        <span className="font-medium">{category.name}</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        {editingCategoryId === category.id ? (
                                          <>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                if (editingCategoryName.trim()) {
                                                  updateServiceCategoryMutation.mutate({
                                                    categoryId: category.id,
                                                    categoryName: editingCategoryName.trim(),
                                                  });
                                                }
                                              }}
                                              disabled={
                                                !editingCategoryName.trim() ||
                                                updateServiceCategoryMutation.isPending
                                              }
                                            >
                                              <Check className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditingCategoryId(null);
                                                setEditingCategoryName("");
                                              }}
                                            >
                                              <X className="w-3 h-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setEditingCategoryId(category.id);
                                                setEditingCategoryName(category.name);
                                              }}
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              className="text-red-600"
                                              onClick={() => {
                                                if (
                                                  confirm(
                                                    `Are you sure you want to delete "${category.name}"? This will also delete all services in this category.`
                                                  )
                                                ) {
                                                  deleteServiceCategoryMutation.mutate(category.id);
                                                }
                                              }}
                                              disabled={deleteServiceCategoryMutation.isPending}
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </div>
                    </div>

                    {/* RIGHT COLUMN - Add New Category */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium mb-3">Add New Category</h3>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="service-category-name">Category Name</Label>
                          <Input
                            id="service-category-name"
                            value={newServiceCategoryName}
                            onChange={e => setNewServiceCategoryName(e.target.value)}
                            placeholder="Enter category name (e.g., Photography, Catering, Entertainment)"
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            className="w-full"
                            onClick={() => {
                              if (newServiceCategoryName.trim()) {
                                createServiceCategoryMutation.mutate(newServiceCategoryName.trim());
                              }
                            }}
                            disabled={
                              !newServiceCategoryName.trim() ||
                              createServiceCategoryMutation.isPending
                            }
                          >
                            {createServiceCategoryMutation.isPending
                              ? "Creating..."
                              : "Create Category"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsServiceCategoryDialogOpen(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* === DISCOUNT BLOCK === */}
          <div
            id="discount"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Discount</p>
            <div className="mt-2">
              <div className="space-y-4">
                {/* Discount Type Selection */}
                <div>
                  <RadioGroup
                    value={discountType}
                    onValueChange={(value: "predefined" | "custom" | "none") => {
                      setDiscountType(value);
                      if (value === "predefined") {
                        // Reset custom discount states
                        setCustomDiscountName("");
                        setCustomDiscountValue(0);
                        setCustomDiscountDescription("");
                        setCustomDiscountType("percent");
                      } else if (value === "custom") {
                        // Reset predefined discount selection
                        setSelectedDiscountId(null);
                        setDiscountName("");
                        setDiscountPercentage(0);
                      } else if (value === "none") {
                        // Reset all discount states
                        setSelectedDiscountId(null);
                        setDiscountName("");
                        setDiscountPercentage(0);
                        setCustomDiscountName("");
                        setCustomDiscountValue(0);
                        setCustomDiscountDescription("");
                        setCustomDiscountType("percent");
                      }
                    }}
                    className="grid grid-cols-3"
                  >
                    <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                      <RadioGroupItem
                        value="predefined"
                        id="predefined"
                        className="after:absolute after:inset-0 after:cursor-pointer"
                      />
                      <Label htmlFor="predefined" className="font-normal cursor-pointer">
                        Predefined Discount
                      </Label>
                    </div>
                    <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                      <RadioGroupItem
                        value="custom"
                        id="custom"
                        className="after:absolute after:inset-0 after:cursor-pointer"
                      />
                      <Label htmlFor="custom" className="font-normal cursor-pointer">
                        Custom Discount
                      </Label>
                    </div>
                    <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                      <RadioGroupItem
                        value="none"
                        id="none"
                        className="after:absolute after:inset-0 after:cursor-pointer"
                      />
                      <Label htmlFor="none" className="font-normal cursor-pointer">
                        None
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Predefined Discount Selection */}
                {discountType === "predefined" && (
                  <div className="">
                    <Label className="font-normal text-foreground/50">Select Discount</Label>

                    <Select
                      value={selectedDiscountId ? String(selectedDiscountId) : ""}
                      onValueChange={async value => {
                        if (value === "") {
                          setSelectedDiscountId(null);
                          setDiscountName("");
                          setDiscountPercentage(0);
                          return;
                        }
                        const discountId = parseInt(value, 10);
                        setSelectedDiscountId(discountId);

                        // Find discount in the predefined list
                        const selectedDiscount = discounts.find(d => d.id === discountId);
                        if (selectedDiscount) {
                          setDiscountName(selectedDiscount.name);
                          // Calculate percentage based on discount type
                          if (selectedDiscount.percent) {
                            setDiscountPercentage(selectedDiscount.percent);
                          } else if (selectedDiscount.amount) {
                            // Convert amount to percentage based on current total
                            const currentTotal = basePackagePrice + extraHoursFee;
                            const percentage =
                              currentTotal > 0 ? (selectedDiscount.amount / currentTotal) * 100 : 0;
                            setDiscountPercentage(percentage);
                          } else {
                            setDiscountPercentage(0);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a discount" />
                      </SelectTrigger>
                      <SelectContent>
                        {discounts.map(discount => (
                          <SelectItem key={discount.id} value={String(discount.id)}>
                            <div className="flex  gap-2 items-center">
                              <span>{discount.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {discount.percent
                                  ? `(${discount.percent}% off)`
                                  : discount.amount
                                    ? `₱${discount.amount.toLocaleString()} off`
                                    : "Custom discount"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Custom Discount Creation */}
                {discountType === "custom" && (
                  <div className="">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="font-normal text-foreground/50 mb-2 block">
                          Discount Name
                        </Label>
                        <Input
                          placeholder="Special Event Discount"
                          value={customDiscountName}
                          onChange={e => setCustomDiscountName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="font-normal text-foreground/50 mb-2 block">
                          Discount Method
                        </Label>
                        <Select
                          value={customDiscountType}
                          onValueChange={(value: "percent" | "amount") => {
                            setCustomDiscountType(value);
                            setCustomDiscountValue(0); // Reset value when changing type
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percent">Percentage (%)</SelectItem>
                            <SelectItem value="amount">Fixed Amount (₱)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="font-normal text-foreground/50 mb-2 mt-4 block">
                          {customDiscountType === "percent" ? "Percentage" : "Amount"}
                        </Label>
                        <div className="relative">
                          <Input
                            placeholder={customDiscountType === "percent" ? "10" : "1000"}
                            value={customDiscountValue || ""}
                            onChange={e => {
                              const value = parseFloat(e.target.value) || 0;
                              if (customDiscountType === "percent" && value > 100) {
                                return; // Don't allow more than 100%
                              }
                              setCustomDiscountValue(value);

                              // Calculate discount percentage for display
                              if (customDiscountType === "percent") {
                                setDiscountPercentage(value);
                              } else {
                                const currentTotal = basePackagePrice + extraHoursFee;
                                const percentage =
                                  currentTotal > 0 ? (value / currentTotal) * 100 : 0;
                                setDiscountPercentage(percentage);
                              }
                            }}
                            min="0"
                            max={customDiscountType === "percent" ? "100" : undefined}
                            step={customDiscountType === "percent" ? "0.1" : "1"}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                            {customDiscountType === "percent" ? "%" : "₱"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* === RIGHT COLUMN (SUMMARY) === */}
        <div className="sticky top-0 h-screen mt-8">
          <div
            id="date_and_time"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div>
              <div className="flex">
                <p className="font-medium text-md">
                  {selectedPavilion ? selectedPavilion.name : "Select a pavilion"}
                </p>
                {selectedPavilion && (
                  <Badge variant={"secondary"} className="ml-2">
                    <Users className="-ms-0.5 opacity-60" size={12} aria-hidden="true" />
                    {`${selectedPavilion.maxPax} pax`}
                  </Badge>
                )}
              </div>
              {totalHours &&
                finalStartDay &&
                finalStartDate &&
                finalEndDay &&
                finalEndDate &&
                finalStartTime &&
                finalEndTime && (
                  <div className="border-b mt-3 border-t py-3">
                    <div className="flex items-center justify-between">
                      <div className="mr-6">
                        <p className="text-sm font-medium">{`${finalStartDay}`}</p>
                        <p className="text-sm font-medium">{`${finalStartDate}`}</p>

                        <p className="text-xs font-normal text-black/50">
                          from {`${finalStartTime}`}
                        </p>
                      </div>

                      <div className="grow justify-center items-center text-center">
                        <p className="text-black/50 text-xs">{`${totalDays} days`}</p>
                        <div className="border-b border-black/10 my-1"></div>
                        <p className="text-black/50 text-xs">{`${totalHours} hours`}</p>
                      </div>

                      <div className="ml-6">
                        <p className="text-sm font-medium">{`${finalEndDay}`}</p>
                        <p className="text-sm font-medium">{`${finalEndDate}`}</p>
                        <p className="text-xs font-normal text-black/50">
                          until {`${finalEndTime}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              <div>
                <div className="flex items-center mt-3"></div>
                <ul className="list-inside space-y-2 mb-2 text-sm mt-1 text-black/50">
                  {numPax && (
                    <li>
                      <Check size={16} className="inline mr-1" />
                      No. of pax: {numPax}
                    </li>
                  )}
                  {selectedPackageItems.length > 0 ? (
                    selectedPackageItems.map((item, idx) => (
                      <li key={idx}>
                        <Check size={16} className="inline mr-1" />
                        {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-muted-foreground"></li>
                  )}
                </ul>
              </div>
              {selectedPackageId !== null && (
                <div className="border-t-1 mt-3 grid grid-cols-2 pt-3">
                  <div className="col-span-1">
                    <p className="text-md font-medium">Total Price</p>
                    <p className="text-sm font-normal text-black/50">
                      {typeof totalDays === "number" && typeof totalHours === "number"
                        ? `${totalDays > 0 ? `${totalDays} day(s), ` : ""}${totalHours} hour(s)`
                        : ``}
                    </p>
                    {hoursCount > 5 && (
                      <p className="text-xs text-black/50">
                        Includes extra hours fee for {extraHours} hour(s)
                      </p>
                    )}
                    {selectedCatering === "1" && cateringCost > 0 && (
                      <p className="text-xs text-black/50">
                        Catering: {cateringPax} pax × {formatCurrency(parseFloat(pricePerPax))}
                      </p>
                    )}
                  </div>
                  <div className="text-end">
                    {discountAmount > 0 && (
                      <p className="text-sm font-normal line-through">
                        {formatCurrency(originalPrice)}
                      </p>
                    )}
                    <p className="text-md font-medium text-red-500">
                      {formatCurrency(discountedPrice)}
                      {discountAmount > 0 && (
                        <span className="ml-1 text-xs text-black/50">
                          (
                          {discountType === "predefined" && selectedDiscountId
                            ? (() => {
                                const selectedDiscount = discounts.find(
                                  d => d.id === selectedDiscountId
                                );
                                if (selectedDiscount?.percent)
                                  return `${selectedDiscount.percent}% off`;
                                if (selectedDiscount?.amount)
                                  return `₱${selectedDiscount.amount.toLocaleString()} off`;
                                return "Discount applied";
                              })()
                            : discountType === "custom" && customDiscountValue > 0
                              ? customDiscountType === "percent"
                                ? `${customDiscountValue}% off`
                                : `₱${customDiscountValue.toLocaleString()} off`
                              : "Discount applied"}
                          )
                        </span>
                      )}
                    </p>
                    {downPayment > 0 && (
                      <>
                        <p className="text-xs text-black/50">
                          Downpayment: {formatCurrency(downPayment)}
                        </p>
                        <p className="text-sm font-semibold">
                          Balance: {formatCurrency(finalBalance)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div id="notes" className="w-full h-fit mt-4 bg-white rounded-md">
              <div className="">
                <div className="mt-2">
                  <div className="*:not-first:mt-2">
                    <Textarea name="notes" placeholder="Notes" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col justify-end gap-2 mt-2">
              <Button type="submit" className="items-center flex">
                <CalendarPlus /> Create Booking{" "}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Dialog */}
      <AlertDialog open={showBookingSuccessDialog} onOpenChange={setShowBookingSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Booking Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your booking has been created successfully. You can now add payment details later from
              the bookings page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setShowBookingSuccessDialog(false);
                // Optionally redirect to bookings page or reset form
                window.location.href = "/bookings";
              }}
            >
              Go to Bookings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
export default AddBookingsPageClient;
