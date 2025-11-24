"use client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { integrateNewBooking } from "@/lib/local/integration";
import { createBookingNotification } from "@/app/actions/createBookingNotification";
import { useForm, Controller } from "react-hook-form";
import EventTypeSelect from "./EventTypeSelect";
import CateringRadioGroup from "./CateringRadioGroup";
import DiscountTypeRadioGroup from "./DiscountTypeRadioGroup";
import PackageRadioGroup from "./PackageRadioGroup";
import ClientRadioGroup from "./ClientRadioGroup";
import {
  Banknote,
  CalendarIcon,
  CalendarPlus,
  Check,
  DollarSign,
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
import React, { useEffect, useId, useState, useRef, useCallback } from "react";
import { InventorySelectionDialog } from "@/components/(Bookings)/InventorySelectionDialog";

import {
  Dialog,
  DialogClose,
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
import { FileUpload } from "@/components/(Manage)/FileUpload";
import { FileUploadSimple } from "@/components/(Manage)/FileUploadSimple";
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
import { createMenuWithDishes, updateMenuPackage } from "@/server/Menu/pushActions";
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
  preSelectedStartHour?: string;
  preSelectedStartMinute?: string;
  preSelectedEndHour?: string;
  preSelectedEndMinute?: string;
  preSelectedPax?: string;
  preSelectedEventName?: string;
  preSelectedEventTypeId?: string;
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
  const router = useRouter();

  // Extract props first
  const preSelectedStartDate = props.preSelectedStartDate;
  const preSelectedEndDate = props.preSelectedEndDate;
  const preSelectedPavilionId = props.preSelectedPavilionId;
  const preSelectedStartHour = props.preSelectedStartHour;
  const preSelectedStartMinute = props.preSelectedStartMinute;
  const preSelectedEndHour = props.preSelectedEndHour;
  const preSelectedEndMinute = props.preSelectedEndMinute;
  const preSelectedPax = props.preSelectedPax;
  const preSelectedEventName = props.preSelectedEventName;
  const preSelectedEventTypeId = props.preSelectedEventTypeId;

  // React Hook Form setup - manages form state and prevents infinite loops
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    control,
    watch,
    setValue,
    reset: resetForm,
    formState: { errors: formErrors },
  } = useForm({
    defaultValues: {
      eventName: preSelectedEventName || "",
      numPax: preSelectedPax || "",
      eventType: preSelectedEventTypeId || "",
      catering: "4",
      modeOfPayment: "",
      downpayment: "",
      discount: "",
      notes: "",
      // Client fields
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
    },
  });

  // Watch form values that need to trigger other updates
  const watchedNumPax = watch("numPax");

  // Use useState for form fields to avoid Controller infinite loop issues
  const [selectedEventType, setSelectedEventType] = useState<string>(preSelectedEventTypeId || "");
  const [eventNameValue, setEventNameValue] = useState<string>(preSelectedEventName || "");
  const [isEventTypeValid, setIsEventTypeValid] = useState<boolean>(!!preSelectedEventTypeId);
  const [selectedCatering, setSelectedCatering] = useState<string>("4"); // Default to "None"

  // Memoized callback for catering change
  const handleCateringChange = useCallback((value: string) => {
    setSelectedCatering(value);
    // Clear validation error if value is valid
    if (value) {
      setValidationErrors(prev => ({ ...prev, catering: undefined }));
    }
  }, []);

  // Memoized callback for event type change with validation
  const handleEventTypeChange = useCallback((value: string, isValid: boolean) => {
    setSelectedEventType(value);
    setIsEventTypeValid(isValid);
    // Clear validation error if value is valid
    if (isValid) {
      setValidationErrors(prev => ({ ...prev, eventType: undefined }));
    }
  }, []);

  // Memoized callback for discount type change
  const handleDiscountTypeChange = useCallback((value: "predefined" | "custom" | "none") => {
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
  }, []);

  // Memoized callback for package selection
  const handlePackageChange = useCallback((value: number) => {
    setSelectedPackageId(value);
  }, []);

  // Memoized callback for client selection
  const handleClientChange = useCallback((value: number) => {
    setSelectedClientId(value);
  }, []);

  // Memoize arrays to prevent re-renders on every render cycle
  const allInventory = React.useMemo(() => props.allInventory ?? [], [props.allInventory]);
  const pavilions = React.useMemo(() => props.pavilions ?? [], [props.pavilions]);
  const eventTypes = React.useMemo(() => props.eventTypes ?? [], [props.eventTypes]);
  const discounts = React.useMemo(() => props.discounts ?? [], [props.discounts]);
  const modeOfPayments = React.useMemo(() => props.modeOfPayments ?? [], [props.modeOfPayments]);
  const allServices = React.useMemo(() => props.services ?? [], [props.services]);
  const packages = React.useMemo(() => props.packages ?? [], [props.packages]);
  const [servicesCategory, setServicesCategory] = useState(props.servicesCategory ?? []);

  const bookingsRef = React.useRef(props.bookings ?? []);
  // if prop changes (should be static for page load) update ref
  React.useEffect(() => {
    bookingsRef.current = props.bookings ?? [];
  }, [props.bookings]);
  const [isVisible] = useState(true);
  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]);

  // Validation Error State - tracks which fields have errors
  const [validationErrors, setValidationErrors] = useState<{
    eventName?: boolean;
    client?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    phoneNumber?: boolean;
    email?: boolean;
    region?: boolean;
    province?: boolean;
    municipality?: boolean;
    barangay?: boolean;
    pavilion?: boolean;
    package?: boolean;
    startDate?: boolean;
    endDate?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    eventType?: boolean;
    numPax?: boolean;
    catering?: boolean;
    menuPackage?: boolean;
    dishes?: boolean;
    cateringPax?: boolean;
    pricePerPax?: boolean;
    inventory?: boolean;
  }>({});

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
  const [conflictsAcknowledged, setConflictsAcknowledged] = useState(false);
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

  // Stable handler for client selection mode change
  const clientSelectionModeRef = React.useRef(clientSelectionMode);
  React.useEffect(() => {
    clientSelectionModeRef.current = clientSelectionMode;
  }, [clientSelectionMode]);

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

  const [eventTypeId, setEventTypeId] = useState<string | undefined>(undefined);

  // Removed unused pavilion/hour pricing interim states (reintroduce if needed)
  // Using selectedCatering state (managed separately from react-hook-form to prevent infinite loops)

  // Menu Package selection state
  const [selectedMenuPackageId, setSelectedMenuPackageId] = useState<number | null>(null);
  const [customPricePerPax, setCustomPricePerPax] = useState<string>("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Rooms selection state
  const [selectedRoomIds, setSelectedRoomIds] = useState<number[]>([]);

  // Additional charges state
  const [additionalCharges, setAdditionalCharges] = useState<
    { id: string; name: string; amount: number; note?: string }[]
  >([]);
  const [showAddChargeForm, setShowAddChargeForm] = useState(false);
  const [chargeName, setChargeName] = useState("");
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeNote, setChargeNote] = useState("");

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

  // Query for all rooms
  const { data: allRooms = [] } = useQuery({
    queryKey: ["allRooms"],
    queryFn: async () => {
      const { getAllRooms } = await import("@/server/rooms/pullActions");
      return getAllRooms();
    },
  });

  // Query for all menu packages
  const { data: allMenuPackages = [] } = useQuery({
    queryKey: ["allMenuPackages"],
    queryFn: async () => {
      const { getAllMenuPackages } = await import("@/server/menuPackages/pullActions");
      return getAllMenuPackages();
    },
  });

  // Memoized callbacks for Select/RadioGroup handlers (after data/state is loaded)
  const handleMenuPackageChange = React.useCallback((val: string) => {
    if (val === "custom") {
      setIsCustomMode(true);
      const currentPackage = selectedMenuPackageId
        ? allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId)
        : null;
      setCustomPricePerPax(currentPackage?.price?.toString() || "");
      setSelectedMenuPackageId(null);
    } else {
      setIsCustomMode(false);
      setSelectedMenuPackageId(val ? Number(val) : null);
      const selectedPackage = allMenuPackages.find((pkg: any) => pkg.id === Number(val));
      setCustomPricePerPax(selectedPackage?.price?.toString() || "");
    }
    // Clear selected dishes when changing package
    setSelectedDishes([]);
  }, [allMenuPackages, selectedMenuPackageId]);

  const handlePredefinedDiscountChange = React.useCallback((value: string) => {
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
        setDiscountPercentage(0); // We'll calculate based on selected package price
      } else {
        setDiscountPercentage(0);
      }
    }
  }, [discounts]);

  const handleCustomDiscountTypeChange = React.useCallback((value: "percent" | "amount") => {
    setCustomDiscountType(value);
    setCustomDiscountValue(0); // Reset value when changing type
  }, []);

  // Memoized callback for dishes dialog menu package selection
  const handleDishesMenuPackageChange = React.useCallback((val: string) => {
    const newVal = val === "none" ? null : Number(val);
    setSelectedMenuPackageId(newVal);
  }, []);

  // Memoized callback for editing dish category
  const handleEditDishCategoryChange = React.useCallback((value: string) => {
    setEditingDish(prev => prev ? {
      ...prev,
      categoryId: Number(value),
    } : null);
  }, []);

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
  } | null>(
    preSelectedStartHour && preSelectedStartMinute
      ? {
          hour: parseInt(preSelectedStartHour, 10),
          minute: parseInt(preSelectedStartMinute, 10),
        }
      : null
  );

  const [endTime, setEndTime] = useState<{
    hour: number;
    minute: number;
    second?: number;
  } | null>(
    preSelectedEndHour && preSelectedEndMinute
      ? {
          hour: parseInt(preSelectedEndHour, 10),
          minute: parseInt(preSelectedEndMinute, 10),
        }
      : null
  );

  // Sync dates and times with preselected props and set defaults
  useEffect(() => {
    // Set start date from preselected if available
    if (preSelectedStartDate && !startDate) {
      setStartDate(new Date(preSelectedStartDate));
    }

    // Set start time from preselected if available and not already set
    if (preSelectedStartHour && preSelectedStartMinute && !startTime) {
      setStartTime({
        hour: parseInt(preSelectedStartHour, 10),
        minute: parseInt(preSelectedStartMinute, 10),
      });
    }

    // Set end date from preselected if available, otherwise default to start date
    if (preSelectedEndDate && !endDate) {
      setEndDate(new Date(preSelectedEndDate));
    } else if (!endDate && startDate) {
      // If no end date is selected, default to start date
      setEndDate(new Date(startDate));
    }

    // Set end time from preselected if available and not already set
    if (preSelectedEndHour && preSelectedEndMinute && !endTime) {
      setEndTime({
        hour: parseInt(preSelectedEndHour, 10),
        minute: parseInt(preSelectedEndMinute, 10),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    preSelectedStartDate,
    preSelectedEndDate,
    preSelectedStartHour,
    preSelectedStartMinute,
    preSelectedEndHour,
    preSelectedEndMinute,
  ]);

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

  const [createdBookingId, setCreatedBookingId] = useState<number | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState<boolean>(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<boolean>(false);

  // File upload state
  const [selectedBookingFiles, setSelectedBookingFiles] = useState<File[]>([]);
  const [bookingFileResetTrigger, setBookingFileResetTrigger] = useState(0);

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
    // Get selected menu package
    const selectedMenuPackage = selectedMenuPackageId
      ? allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId)
      : null;

    setSelectedDishes(prev => {
      // If menu package is selected and not in custom mode, check restrictions
      if (selectedMenuPackage && !isCustomMode) {
        // Check if dish category is allowed
        const allowedCategoryIds =
          selectedMenuPackage.allowedCategories?.map((cat: any) => cat.id) || [];

        if (!allowedCategoryIds.includes(dish.categoryId)) {
          // Switch to custom mode
          setIsCustomMode(true);
          setCustomPricePerPax(selectedMenuPackage.price.toString());
          setSelectedMenuPackageId(null);
          toast.info(
            `Dish from different category added. Switched to Custom Package mode. Price per pax set to ₱${selectedMenuPackage.price}.`
          );
          // Continue with adding the dish
        }
        // Removed maxDishes check - now only constrained by allowed categories
      }

      const idx = prev.findIndex(d => d.id === dish.id);
      if (idx !== -1) {
        // Already exists, increment quantity by current pax (or 1 if not set)
        const incrementBy = parseInt(watchedNumPax) || 1;
        return prev.map((d, i) => (i === idx ? { ...d, quantity: d.quantity + incrementBy } : d));
      } else {
        // New dish, add with quantity = current pax (or 1 if not set)
        const defaultQuantity = parseInt(watchedNumPax) || 1;
        return [...prev, { ...dish, quantity: defaultQuantity }];
      }
    });
  };

  // Inventory icon mapping (placeholder: copied from DishIcon)
  // Removed unused InventoryIcon component

  const removeDish = (dishId: number) => {
    // Remove all instances of the dish at once
    setSelectedDishes(prev => prev.filter(d => d.id !== dishId));
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

  // Get selected menu package for filtering
  const selectedMenuPackage = selectedMenuPackageId
    ? allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId)
    : null;
  const allowedCategoryIds =
    selectedMenuPackage?.allowedCategories?.map((cat: any) => cat.id) || [];

  const filteredDishes =
    dishesSource?.filter((dish: any) => {
      const matchesSearch = dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase());
      const matchesCategory =
        selectedDishCategoryFilter === "all" ||
        dish.categoryId?.toString() === selectedDishCategoryFilter;

      // If menu package is selected and not in custom mode, only show dishes from allowed categories
      const matchesMenuPackage =
        !selectedMenuPackageId || isCustomMode || allowedCategoryIds.includes(dish.categoryId);

      return matchesSearch && matchesCategory && matchesMenuPackage;
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

    // Prevent multiple submissions
    if (isCreatingBooking) {
      return;
    }

    const formData = new FormData(e.currentTarget);
    const errors: typeof validationErrors = {};
    let firstErrorSection: string | null = null;
    const errorMessages: string[] = [];

    // VALIDATION: Event Name (Required) - Using state value
    if (!eventNameValue || String(eventNameValue).trim() === "") {
      errors.eventName = true;
      errorMessages.push("Event name is required");
      if (!firstErrorSection) firstErrorSection = "event_details";
    }

    // VALIDATION: Client Information
    if (clientSelectionMode === "existing") {
      if (!selectedClientId) {
        errors.client = true;
        errorMessages.push("Please select a client");
        if (!firstErrorSection) firstErrorSection = "client";
      }
    } else {
      // New client - validate required fields
      const firstName = formData.get("firstName");
      const lastName = formData.get("lastName");
      const phoneNumber = formData.get("phoneNumber");
      const email = formData.get("email");

      if (!firstName || String(firstName).trim() === "") {
        errors.firstName = true;
        errorMessages.push("Client first name is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      if (!lastName || String(lastName).trim() === "") {
        errors.lastName = true;
        errorMessages.push("Client last name is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      if (!phoneNumber || String(phoneNumber).trim() === "") {
        errors.phoneNumber = true;
        errorMessages.push("Client phone number is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      // Validate phone number contains only digits
      if (phoneNumber && !/^\d+$/.test(String(phoneNumber).trim())) {
        errors.phoneNumber = true;
        errorMessages.push("Phone number can only contain numbers");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      // Email is optional, but if provided, validate format
      if (email && String(email).trim() !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(email).trim())) {
          errors.email = true;
          errorMessages.push("Please enter a valid email address");
          if (!firstErrorSection) firstErrorSection = "client";
        }
      }

      // Validate address fields
      if (!region || region.trim() === "") {
        errors.region = true;
        errorMessages.push("Client region is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      if (!province || province.trim() === "") {
        errors.province = true;
        errorMessages.push("Client province is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      if (!municipality || municipality.trim() === "") {
        errors.municipality = true;
        errorMessages.push("Client municipality is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }

      if (!barangay || barangay.trim() === "") {
        errors.barangay = true;
        errorMessages.push("Client barangay is required");
        if (!firstErrorSection) firstErrorSection = "client";
      }
    }

    // VALIDATION: Pavilion (Required)
    if (!selectedPavilionId) {
      errors.pavilion = true;
      errorMessages.push("Please select a pavilion");
      if (!firstErrorSection) firstErrorSection = "pavilion";
    }

    // VALIDATION: Package (Required)
    if (!selectedPackageId) {
      errors.package = true;
      errorMessages.push("Please select a package");
      if (!firstErrorSection) firstErrorSection = "pavilion";
    }

    // VALIDATION: Date and Time (Required)
    if (!startDate) {
      errors.startDate = true;
      errorMessages.push("Start date is required");
      if (!firstErrorSection) firstErrorSection = "date_and_time";
    }

    if (!endDate) {
      errors.endDate = true;
      errorMessages.push("End date is required");
      if (!firstErrorSection) firstErrorSection = "date_and_time";
    }

    if (!startTime) {
      errors.startTime = true;
      errorMessages.push("Start time is required");
      if (!firstErrorSection) firstErrorSection = "date_and_time";
    }

    if (!endTime) {
      errors.endTime = true;
      errorMessages.push("End time is required");
      if (!firstErrorSection) firstErrorSection = "date_and_time";
    }

    // Validate end date is not before start date
    if (startDate && endDate && endDate < startDate) {
      errors.endDate = true;
      errorMessages.push("End date cannot be before start date");
      if (!firstErrorSection) firstErrorSection = "date_and_time";
    }

    // Validate time logic for same-day or next-day bookings
    if (startDate && endDate && startTime && endTime) {
      const startDateTime = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startTime.hour,
        startTime.minute
      );
      const endDateTime = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        endTime.hour,
        endTime.minute
      );

      // Check if end is before or equal to start
      if (endDateTime <= startDateTime) {
        errors.endTime = true;
        errorMessages.push("End date/time must be after start date/time. For events crossing midnight (e.g., 11PM-4AM), set the end date to the next day.");
        if (!firstErrorSection) firstErrorSection = "date_and_time";
      }
    }

    // VALIDATION: Event Type (Required) - Using state value
    if (!selectedEventType || String(selectedEventType) === "0" || String(selectedEventType).trim() === "") {
      errors.eventType = true;
      errorMessages.push("Event type is required");
      if (!firstErrorSection) firstErrorSection = "event_details";
    }

    // VALIDATION: Number of Pax (Required) - Using watched value from react-hook-form
    if (!watchedNumPax || String(watchedNumPax).trim() === "" || Number(watchedNumPax) <= 0) {
      errors.numPax = true;
      errorMessages.push("Number of attendees (pax) is required and must be greater than 0");
      if (!firstErrorSection) firstErrorSection = "event_details";
    }

    // VALIDATION: Catering (Required)
    if (!selectedCatering) {
      errors.catering = true;
      errorMessages.push("Please select a catering option");
      if (!firstErrorSection) firstErrorSection = "catering";
    }

    // VALIDATION: In-house Catering Requirements
    if (selectedCatering === "1") {
      // Validate menu package selection
      if (!selectedMenuPackageId) {
        errors.menuPackage = true;
        errorMessages.push("Please select a menu package for in-house catering");
        if (!firstErrorSection) firstErrorSection = "catering";
      }

      // Validate dishes selection
      if (selectedDishes.length === 0) {
        errors.dishes = true;
        errorMessages.push("Please select at least one dish for in-house catering");
        if (!firstErrorSection) firstErrorSection = "catering";
      }

      // Validate catering pax
      if (!cateringPax || String(cateringPax).trim() === "" || Number(cateringPax) <= 0) {
        errors.cateringPax = true;
        errorMessages.push("Catering number of pax is required and must be greater than 0");
        if (!firstErrorSection) firstErrorSection = "catering";
      }
    }

    // VALIDATION: Inventory (if selected, validate quantities)
    if (selectedInventoryItems.length > 0) {
      for (const item of selectedInventoryItems) {
        if (item.quantity <= 0) {
          const inventoryItem = inventoryItems.find((inv: any) => inv.id === item.id);
          errorMessages.push(
            `Inventory item "${inventoryItem?.name || "Unknown"}" must have a quantity greater than 0`
          );
          if (!firstErrorSection) firstErrorSection = "services";
          errors.inventory = true;
        }

        // Check for conflicts (only if not acknowledged)
        if (!conflictsAcknowledged) {
          const { conflicts, warnings } = getInventoryConflicts(item.id, item.quantity);
          if (conflicts.length > 0 || warnings.length > 0) {
            const inventoryItem = inventoryItems.find((inv: any) => inv.id === item.id);
            errorMessages.push(
              `Inventory item "${inventoryItem?.name || "Unknown"}" has conflicts or warnings. Please review.`
            );
            if (!firstErrorSection) firstErrorSection = "services";
            errors.inventory = true;
            handleConflictClick(item.id, item.quantity);
          }
        }
      }
    }

    // NOTE: Discount block (mode of payment, down payment, discount) is optional - no validation required

    // If there are any errors, display them and scroll to first error
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);

      // Show error messages
      if (errorMessages.length === 1) {
        toast.error(errorMessages[0]);
      } else {
        toast.error(`Please fix ${errorMessages.length} validation error${errorMessages.length > 1 ? 's' : ''}`);
      }

      // Scroll to first error section
      if (firstErrorSection) {
        document.getElementById(firstErrorSection)?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }

    // All validations passed, clear errors
    setValidationErrors({});

    // Proceed with booking creation
    await handleCreateBooking(e);
  };

  const handleCreateBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsCreatingBooking(true);

    try {
      const formData = new FormData(e.currentTarget);
      // Get values from state
      const eventName = eventNameValue;
      const numberOfPax = watchedNumPax;
      const eventType = selectedEventType;
      // Get other values from FormData
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

      // Store booking ID for document uploads
      if (bookingId) {
        setCreatedBookingId(bookingId);
      }

      // If in-house catering selected (value "1"), create a menu with selected dishes & their quantities
      if (selectedCatering === "1" && bookingId) {
        try {
          const dishIds = selectedDishes.flatMap(d => Array(d.quantity).fill(d.id));
          const menu = await createMenuWithDishes(bookingId, dishIds);

          // Update menu with selected menu package
          if (menu?.id && selectedMenuPackageId) {
            const selectedMenuPackage = allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId);
            await updateMenuPackage(
              menu.id,
              selectedMenuPackageId,
              selectedMenuPackage?.price || null,
              false // isCustom = false since we're using a selected package
            );
          }
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

      // Add selected rooms to booking
      if (selectedRoomIds.length > 0 && bookingId) {
        try {
          const { setBookingRooms } = await import("@/server/rooms/pushActions");
          await setBookingRooms(bookingId, selectedRoomIds);
          console.log("Rooms added to booking successfully");
        } catch (err) {
          console.error("Error adding rooms to booking:", err);
        }
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

      // Get selected menu package price
      const selectedMenuPackage = selectedMenuPackageId
        ? allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId)
        : null;
      const menuPackagePrice = selectedMenuPackage?.price || 0;

      // Calculate catering cost if in-house catering is selected
      const cateringCost =
        selectedCatering === "1" && cateringPax && menuPackagePrice
          ? parseFloat(cateringPax) * menuPackagePrice
          : 0;

      // Calculate total additional charges (for display only, not included in originalPrice)
      const totalAdditionalCharges = additionalCharges.reduce(
        (sum, charge) => sum + charge.amount,
        0
      );

      const originalPrice = basePackagePrice + extraHoursFee + cateringCost; // Additional charges are stored separately

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
          selectedCatering === "1" && menuPackagePrice ? menuPackagePrice : undefined,
      });

      // Create additional charges if any
      if (additionalCharges.length > 0 && bookingId) {
        try {
          const { createAdditionalCharge } = await import(
            "@/server/additionalcharge/pushActions"
          );
          for (const charge of additionalCharges) {
            await createAdditionalCharge({
              bookingId: Number(bookingId),
              name: charge.name,
              amount: charge.amount,
              note: charge.note,
            });
          }
        } catch (error) {
          console.error("Error creating additional charges:", error);
          toast.error("Failed to save additional charges");
        }
      }

      // Upload all documents if any (client IDs, contracts, etc.)
      if (selectedBookingFiles.length > 0 && bookingId) {
        try {
          for (const file of selectedBookingFiles) {
            const formData = new FormData();
            formData.append("file", file);

            const uploadResponse = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (uploadResponse.ok) {
              const { path } = await uploadResponse.json();

              // Link documents to both booking and client
              await fetch("/api/documents/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: file.name,
                  file: path,
                  bookingId: Number(bookingId),
                  clientId: clientID,
                }),
              });
            }
          }
        } catch (error) {
          console.error("Error uploading documents:", error);
        }
      }

      // Reset file states
      setSelectedBookingFiles([]);
      setBookingFileResetTrigger(prev => prev + 1);

      // 🔄 Sync booking to LocalStorage and trigger notifications
      try {
        await integrateNewBooking({
          id: Number(bookingId),
          eventName: String(eventName ?? ""),
          startAt: validStartAt,
          endAt: validEndAt,
          clientId: Number(clientID),
          pavilionId: selectedPavilionId ? Number(selectedPavilionId) : null,
          billing: {
            balance: Number(billing?.balance ?? finalDiscountedPrice),
            originalPrice: Number(originalPrice || 0),
          },
          createdAt: new Date(),
        });
        console.log("✅ Booking synced to offline system");

        // 🔔 Create database notification (works across devices/origins)
        const clientName = selectedClientId
          ? `${allClients.find(c => c.id === selectedClientId)?.firstName || ''} ${allClients.find(c => c.id === selectedClientId)?.lastName || ''}`.trim()
          : `${firstName || ''} ${lastName || ''}`.trim();

        await createBookingNotification({
          id: Number(bookingId),
          eventName: String(eventName ?? ""),
          clientName: clientName || 'Unknown Client',
          startAt: validStartAt,
        });
        console.log("✅ Database notification created");
      } catch (syncError) {
        console.error("Error syncing to offline system:", syncError);
        // Don't block booking creation if sync fails
      }

      // Reset form state using react-hook-form's reset
      resetForm(); // Resets all form fields managed by react-hook-form

      // Reset additional state not managed by react-hook-form
      setSelectedDishes([]);
      setSelectedInventoryItems([]);
      setSelectedServiceIdsByCategory({});
      setTypedServiceByCategory({});
      setSelectedRoomIds([]);
      setSelectedMenuPackageId(null);
      setIsCustomMode(false);
      setCustomPricePerPax("");
      setNumPax("");
      setCateringPax("");
      // Removed: setSelectedCatering("4"); - now managed by react-hook-form reset
      setSelectedPackageId(null);
      setSelectedPavilionId(null);
      setStartDate(null);
      setEndDate(null);
      setStartTime(null);
      setEndTime(null);
      setClientSelectionMode("new");
      setSelectedClientId(null);
      setDownPayment(0);
      setDiscountType("none");
      setSelectedDiscountId(null);
      setValidationErrors({});
      setAdditionalCharges([]);
      setShowAddChargeForm(false);
      setChargeName("");
      setChargeAmount("");
      setChargeNote("");

      // Show success dialog
      setShowSuccessDialog(true);
      // Removed redirect to event calendar - will redirect when user closes dialog
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePavilionSelect = (e: string) => {
    // Handle pavilion selection
  };

  // Handler for closing success dialog and navigating to calendar
  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    router.push("/event_calendar");
  };

  // Removed unused price change handlers (hours, pavilion, total) to satisfy lint; add back if needed where values are updated.

  // Use uncontrolled inputs for fields that don't need immediate reactivity
  const numPaxRef = useRef<HTMLInputElement>(null);
  const [numPax, setNumPax] = useState<string>(preSelectedPax || "");

  // Catering pax and price per pax state
  const [cateringPax, setCateringPax] = useState<string>("");
  const [pricePerPax, setPricePerPax] = useState<string>("");

  // Auto-sync Event Pax to Catering Pax (one-way: event controls catering)
  // Auto-sync Event Pax to Catering Pax (one-way: event controls catering)
  useEffect(() => {
    if (watchedNumPax) {
      setCateringPax(watchedNumPax);

      // Task 2: Update quantity of all selected dishes to match new pax
      setSelectedDishes(prev =>
        prev.map(dish => ({
          ...dish,
          quantity: parseInt(watchedNumPax) || 1
        }))
      );
    }
  }, [watchedNumPax]);

  // Auto-set price per pax when menu package is selected
  useEffect(() => {
    if (selectedMenuPackageId) {
      const selectedPackage = allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId);
      if (selectedPackage) {
        setPricePerPax(selectedPackage.price.toString());
      }
    }
  }, [selectedMenuPackageId, allMenuPackages]);

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
  // Get selected menu package price
  const menuPackagePrice = selectedMenuPackage?.price || 0;

  const cateringCost =
    selectedCatering === "1" && cateringPax && menuPackagePrice
      ? parseFloat(cateringPax) * menuPackagePrice
      : 0;

  // Calculate total additional charges (for display only, not included in originalPrice)
  const totalAdditionalCharges = additionalCharges.reduce(
    (sum, charge) => sum + charge.amount,
    0
  );

  const originalPrice = basePackagePrice + extraHoursFee + cateringCost; // before discount (additional charges are separate)

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
    <>
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
                <TabsTrigger value="tab-7" className="text-xs">
                  Additional Charges
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* === PAVILIONS BLOCK === */}
          <div
            id="pavilion"
            className={`w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4 transition-all duration-200 ${
              validationErrors.pavilion || validationErrors.package
                ? "ring-2 ring-red-500 border-red-500"
                : ""
            }`}
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
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="w-full flex border-1 p-4 rounded-md justify-between items-center hover:bg-accent transition-colors"
                      >
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
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select a Package</DialogTitle>
                        <DialogDescription>Choose a package for your booking</DialogDescription>
                      </DialogHeader>

                      <div className="overflow-y-auto max-h-[50vh] pr-2">
                        <PackageRadioGroup
                          packages={filteredPackages}
                          value={selectedPackageId?.toString()}
                          onChange={handlePackageChange}
                          selectedPavilionId={selectedPavilionId}
                          id={id}
                        />
                      </div>

                      <DialogFooter className="gap-2">
                        <DialogClose asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                          >
                            Cancel
                          </button>
                        </DialogClose>
                        <DialogClose asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                          >
                            Confirm Selection
                          </button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {/* === CLIENT BLOCK === */}
          <div
            id="services"
            className={`w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4 transition-all duration-200 ${
              validationErrors.client ||
              validationErrors.firstName ||
              validationErrors.lastName ||
              validationErrors.phoneNumber ||
              validationErrors.email ||
              validationErrors.region ||
              validationErrors.province ||
              validationErrors.municipality ||
              validationErrors.barangay
                ? "ring-2 ring-red-500 border-red-500"
                : ""
            }`}
          >
            <p className="font-bold text-lg -mb-2">Client Details</p>

            {/* Client Selection Mode */}
            <div className="mt-5">
              <div className="grid grid-cols-2 gap-4">
                {/* New Client Radio */}
                <label
                  htmlFor="client-mode-new"
                  className={`border-input relative flex flex-row flex-1 items-center gap-2 rounded-md border p-4 shadow-xs outline-none transition-colors cursor-pointer ${
                    clientSelectionMode === "new"
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    id="client-mode-new"
                    name="client-selection-mode"
                    value="new"
                    checked={clientSelectionMode === "new"}
                    onChange={() => {
                      setClientSelectionMode("new");
                      setSelectedClientId(null);
                      setClientSearchQuery("");
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center font-medium">
                    <Plus className="mr-2" size={20} />
                    New Client
                  </div>
                  <div
                    className={`ml-auto size-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      clientSelectionMode === "new"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {clientSelectionMode === "new" && (
                      <div className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                </label>

                {/* Existing Client Radio */}
                <label
                  htmlFor="client-mode-existing"
                  className={`border-input relative flex flex-row flex-1 items-center gap-2 rounded-md border p-4 shadow-xs outline-none transition-colors cursor-pointer ${
                    clientSelectionMode === "existing"
                      ? "border-primary/50 bg-primary/5"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    id="client-mode-existing"
                    name="client-selection-mode"
                    value="existing"
                    checked={clientSelectionMode === "existing"}
                    onChange={() => {
                      setClientSelectionMode("existing");
                    }}
                    className="sr-only"
                  />
                  <div className="flex items-center font-medium">
                    <Users className="mr-2" size={20} />
                    Existing Client
                  </div>
                  <div
                    className={`ml-auto size-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                      clientSelectionMode === "existing"
                        ? "border-primary bg-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {clientSelectionMode === "existing" && (
                      <div className="size-2 rounded-full bg-white" />
                    )}
                  </div>
                </label>
              </div>
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
                          </DialogHeader>
                          <div className="mt-4 space-y-4">
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
                                  <ClientRadioGroup
                                    clients={allClients}
                                    value={selectedClientId?.toString()}
                                    onChange={handleClientChange}
                                    searchQuery={clientSearchQuery}
                                  />
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
                                </div>
                              </div>
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
                          <Input
                            name="firstName"
                            placeholder="John"
                            type="text"
                            className={
                              validationErrors.firstName ? "ring-2 ring-red-500 border-red-500" : ""
                            }
                            onChange={e => {
                              if (e.target.value.trim() && validationErrors.firstName) {
                                setValidationErrors(prev => ({ ...prev, firstName: undefined }));
                              }
                            }}
                          />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Last name</Label>
                          <Input
                            name="lastName"
                            placeholder="Doe"
                            type="text"
                            className={
                              validationErrors.lastName ? "ring-2 ring-red-500 border-red-500" : ""
                            }
                            onChange={e => {
                              if (e.target.value.trim() && validationErrors.lastName) {
                                setValidationErrors(prev => ({ ...prev, lastName: undefined }));
                              }
                            }}
                          />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Phone number</Label>
                          <Input
                            name="phoneNumber"
                            placeholder="09123456789"
                            type="tel"
                            className={
                              validationErrors.phoneNumber ? "ring-2 ring-red-500 border-red-500" : ""
                            }
                            onChange={e => {
                              // Only allow numbers
                              const value = e.target.value.replace(/\D/g, '');
                              e.target.value = value;
                              if (value.trim() && validationErrors.phoneNumber) {
                                setValidationErrors(prev => ({ ...prev, phoneNumber: undefined }));
                              }
                            }}
                            onKeyPress={e => {
                              // Prevent non-numeric characters from being entered
                              if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Email address (Optional)</Label>
                          <Input
                            name="email"
                            placeholder="johndoe@gmail.com"
                            type="email"
                            className={
                              validationErrors.email ? "ring-2 ring-red-500 border-red-500" : ""
                            }
                            onChange={e => {
                              if (e.target.value.trim() && validationErrors.email) {
                                setValidationErrors(prev => ({ ...prev, email: undefined }));
                              }
                            }}
                          />
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
            className={`w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4 transition-all duration-200 ${
              validationErrors.startDate ||
              validationErrors.endDate ||
              validationErrors.startTime ||
              validationErrors.endTime
                ? "ring-2 ring-red-500 border-red-500"
                : ""
            }`}
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
                      <TimeStartPickerCreateBookingComponent
                        startTimeOnChange={(newTime) => {
                          setStartTime(newTime);
                          // Task 3: Auto-set end time to +5 hours
                          if (newTime) {
                             const newEndTime = {
                               hour: (newTime.hour + 5) % 24,
                               minute: newTime.minute,
                               second: newTime.second
                             };
                             setEndTime(newEndTime);
                          }
                        }}
                        initialDateTime={
                          startTime
                            ? new Date(
                                2000,
                                0,
                                1,
                                startTime.hour,
                                startTime.minute,
                                startTime.second || 0
                              )
                            : undefined
                        }
                      />
                    </div>
                    <div className="flex-grow">
                      <TimeEndPickerCreateBookingComponent
                        endTimeOnChange={setEndTime}
                        initialDateTime={
                          endTime
                            ? new Date(
                                2000,
                                0,
                                1,
                                endTime.hour,
                                endTime.minute,
                                endTime.second || 0
                              )
                            : undefined
                        }
                      />
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
            className={`w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4 transition-all duration-200 ${
              validationErrors.eventName || validationErrors.eventType || validationErrors.numPax
                ? "ring-2 ring-red-500 border-red-500"
                : ""
            }`}
          >
            <p className="font-bold text-lg">Event Details</p>
            <div className="flex">
              <div className="mt-2 *:not-first:mt-2 flex-1">
                <Label className="text-foreground/50 font-normal">Event Name</Label>
                <Input
                  value={eventNameValue}
                  placeholder="Chris' Birthday Party"
                  type="text"
                  className={validationErrors.eventName ? "ring-2 ring-red-500 border-red-500" : ""}
                  onChange={e => {
                    setEventNameValue(e.target.value);
                    if (e.target.value.trim() && validationErrors.eventName) {
                      setValidationErrors(prev => ({ ...prev, eventName: undefined }));
                    }
                  }}
                />
              </div>
              <div className="mt-2 *:not-first:mt-2 flex-1 ml-4">
                <Label className="text-foreground/50 font-normal">No. of pax</Label>
                <Input
                  {...register("numPax")}
                  placeholder="200"
                  type="text"
                  onKeyPress={e => {
                    // Only allow numbers
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={e => {
                    // Remove non-numeric characters
                    const value = e.target.value.replace(/\D/g, '');
                    e.target.value = value;
                    // Update the form value
                    if (register("numPax").onChange) {
                      register("numPax").onChange(e);
                    }
                  }}
                />
              </div>
            </div>

            <EventTypeSelect
              eventTypes={eventTypes}
              value={selectedEventType}
              hasError={validationErrors.eventType}
              onChange={handleEventTypeChange}
            />
          </div>

          {/* === CATERING BLOCK === */}
          <div
            id="catering"
            className={`w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4 transition-all duration-200 ${
              validationErrors.catering ||
              validationErrors.menuPackage ||
              validationErrors.dishes ||
              validationErrors.cateringPax
                ? "ring-2 ring-red-500 border-red-500"
                : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-bold text-lg">Catering</p>


            </div>

            <div className="">
              <div className="mt-2">
                <div>
                  <CateringRadioGroup
                    value={selectedCatering}
                    hasError={validationErrors.catering}
                    onChange={handleCateringChange}
                  />
                </div>
              </div>
              {selectedCatering === "1" && (
                <div className="w-full h-fit mt-4">
                  {/* Menu Package Selection */}
                  <div className="mb-4">
                    <p className="text-sm text-foreground/50 mb-2">Menu Package</p>
                    <Select
                      value={isCustomMode ? "custom" : (selectedMenuPackageId?.toString() || "")}
                      onValueChange={handleMenuPackageChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a menu package" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Package</SelectItem>
                        {allMenuPackages.map((pkg: any) => (
                          <SelectItem key={pkg.id} value={pkg.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{pkg.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ₱{pkg.price}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Custom Price Per Pax Input */}
                    {isCustomMode && (
                      <div className="mt-3">
                        <Label className="text-sm font-medium">Price Per Pax (₱)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={customPricePerPax}
                          onChange={(e) => setCustomPricePerPax(e.target.value)}
                          placeholder="Enter price per pax"
                          className="mt-2"
                        />
                      </div>
                    )}

                    {selectedMenuPackageId && !isCustomMode && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-900 font-medium">
                          Selected:{" "}
                          {
                            allMenuPackages.find((pkg: any) => pkg.id === selectedMenuPackageId)
                              ?.name
                          }
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          You can select dishes from:{" "}
                          {allMenuPackages
                            .find((pkg: any) => pkg.id === selectedMenuPackageId)
                            ?.allowedCategories?.map((cat: any) => cat.name)
                            .join(", ")}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {selectedDishes.length} dishes selected
                        </p>
                      </div>
                    )}

                    {/* Custom Mode Info Display */}
                    {isCustomMode && (
                      <div className="mt-2 p-3 bg-amber-50 rounded-md border border-amber-200">
                        <p className="text-sm text-amber-900 font-medium">Custom Menu Package</p>
                        <p className="text-xs text-amber-700 mt-1">
                          You can select dishes from any category. Set your custom price per pax above.
                        </p>
                        {customPricePerPax && (
                          <p className="text-xs text-amber-700 mt-2">
                            <strong>Price Per Pax:</strong> ₱{parseFloat(customPricePerPax).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                    <div className="flex justify-end mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsDishesDialogOpen(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Dishes
                      </Button>
                    </div>
                    <div className="border rounded-md mt-4">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Dish</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Allergens</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {selectedDishes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                                <TableCell className="text-sm text-muted-foreground">
                                  {dish.allergens || "—"}
                                </TableCell>
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
                          numPax={numPax}
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
                                      setConflictsAcknowledged(false);
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
                                      setConflictsAcknowledged(true);
                                      // Trigger form submission after acknowledging conflicts
                                      setTimeout(() => {
                                        const form = document.getElementById("booking-form") as HTMLFormElement;
                                        if (form) {
                                          form.requestSubmit();
                                        }
                                      }, 100);
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
                        <div className="flex justify-end mb-2 mt-4">
                           <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsInventoryDialogOpen(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Select Items
                          </Button>
                        </div>
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
                                    <React.Fragment key={selectedItem.id}>
                                      <TableRow>
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
                                    </React.Fragment>
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
                            <div className="flex-1">
                              <h2 className="text-xl font-semibold">Manage Dishes</h2>
                              <p className="text-sm text-muted-foreground">
                                Add, edit, or remove dishes from your menu.
                              </p>

                              {/* Menu Package Selector */}
                              <div className="mt-4 max-w-lg">
                                <Label className="text-sm font-medium mb-2">Menu Package</Label>
                                <Select
                                  value={selectedMenuPackageId?.toString() || "none"}
                                  onValueChange={handleDishesMenuPackageChange}
                                >
                                  <SelectTrigger className="mt-2">
                                    <SelectValue placeholder="Select menu package" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[400]">
                                    <SelectItem value="none">None</SelectItem>
                                    {allMenuPackages.map((pkg: any) => (
                                      <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                        {pkg.name} - ₱{pkg.price}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {selectedMenuPackageId && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md max-w-lg">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <p className="text-sm font-semibold text-blue-900">
                                        {selectedMenuPackage?.name}
                                      </p>
                                      {selectedMenuPackage?.description && (
                                        <p className="text-xs text-blue-700 mt-1">
                                          {selectedMenuPackage.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-sm font-medium text-blue-900">
                                      ₱{selectedMenuPackage?.price}
                                    </span>
                                  </div>

                                  <div className="mt-2 pt-2 border-t border-blue-200">
                                    <p className="text-xs text-blue-700">
                                      <strong>Dishes:</strong> {selectedDishes.length} selected
                                    </p>
                                    {selectedMenuPackage?.allowedCategories && selectedMenuPackage.allowedCategories.length > 0 && (
                                      <p className="text-xs text-blue-700 mt-1">
                                        <strong>Allowed Categories:</strong>{" "}
                                        {selectedMenuPackage.allowedCategories.map((cat: any) => cat.name).join(", ")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
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
                                      {categoriesSource
                                        ?.filter((category: { id: number; name: string }) => {
                                          // Task 1: Filter categories based on menu package allowed categories
                                          if (selectedMenuPackageId && !isCustomMode) {
                                            const selectedPackage = allMenuPackages.find((p: any) => p.id === selectedMenuPackageId);
                                            if (selectedPackage?.allowedCategories?.length > 0) {
                                              return selectedPackage.allowedCategories.some((c: any) => c.id === category.id);
                                            }
                                          }
                                          return true;
                                        })
                                        .map(
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
                                          <TableHead>Allergens</TableHead>
                                          <TableHead className="w-32">Quantity</TableHead>
                                          <TableHead className="w-20">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>

                                      <TableBody>
                                        {selectedDishes.length === 0 ? (
                                          <TableRow>
                                            <TableCell
                                              colSpan={5}
                                              className="text-center text-muted-foreground"
                                            >
                                              No dishes selected for this booking
                                            </TableCell>
                                          </TableRow>
                                        ) : filteredSelectedDishes.length === 0 ? (
                                          <TableRow>
                                            <TableCell
                                              colSpan={5}
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
                                            return (
                                              <TableRow key={dish.id}>
                                                <TableCell className="font-medium flex-1 grow">
                                                  {dish.name}
                                                </TableCell>
                                                <TableCell>{category?.name ?? "—"}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                  {dish.allergens || "—"}
                                                </TableCell>
                                                <TableCell>
                                                  <InputGroup>
                                                    <InputGroupInput
                                                      type="number"
                                                      min="1"
                                                      value={dish.quantity}
                                                      onChange={e => {
                                                        const newQuantity = parseInt(e.target.value) || 1;
                                                        setSelectedDishes(prev =>
                                                          prev.map(d =>
                                                            d.id === dish.id
                                                              ? { ...d, quantity: newQuantity }
                                                              : d
                                                          )
                                                        );
                                                      }}
                                                      className="w-20"
                                                    />
                                                  </InputGroup>
                                                </TableCell>
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
                                    {categoriesSource
                                      ?.filter((category: { id: number; name: string }) => {
                                        // Task 1: Filter categories based on menu package allowed categories
                                        if (selectedMenuPackageId && !isCustomMode) {
                                          const selectedPackage = allMenuPackages.find((p: any) => p.id === selectedMenuPackageId);
                                          if (selectedPackage?.allowedCategories?.length > 0) {
                                            return selectedPackage.allowedCategories.some((c: any) => c.id === category.id);
                                          }
                                        }
                                        return true;
                                      })
                                      .map(
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
                                        <TableHead>Allergens</TableHead>
                                        <TableHead className="w-24">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {allDishesQuery.isLoading ? (
                                        <TableRow>
                                          <TableCell colSpan={4} className="text-center py-8">
                                            Loading dishes...
                                          </TableCell>
                                        </TableRow>
                                      ) : allDishesQuery.error ? (
                                        <TableRow>
                                          <TableCell
                                            colSpan={4}
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
                                              <TableCell className="text-sm text-muted-foreground">
                                                {dish.allergens || "—"}
                                              </TableCell>
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
                                            colSpan={4}
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
                                      onValueChange={handleEditDishCategoryChange}
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
                                  <div>
                                    <Label htmlFor="edit-dish-allergens">
                                      Allergens (Optional)
                                    </Label>
                                    <Input
                                      id="edit-dish-allergens"
                                      defaultValue={editingDish.allergens || ""}
                                      placeholder="e.g., Peanuts, Dairy, Shellfish"
                                      onChange={e =>
                                        setEditingDish({
                                          ...editingDish,
                                          allergens: e.target.value,
                                        })
                                      }
                                    />
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
                                            allergens: editingDish.allergens || undefined,
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

          {/* === ROOMS BLOCK === */}
          <div
            id="rooms"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-lg">Rooms</p>
              <p className="text-sm text-muted-foreground">
                {selectedRoomIds.length} room{selectedRoomIds.length !== 1 ? "s" : ""} selected
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {allRooms.map(room => {
                const isSelected = selectedRoomIds.includes(room.id);
                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomIds(prev =>
                        isSelected ? prev.filter(id => id !== room.id) : [...prev, room.id]
                      );
                    }}
                    className={`
                      relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-accent"
                      }
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                    <div className="font-medium text-sm">{room.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Capacity: {room.capacity}
                    </div>
                  </div>
                );
              })}
            </div>

            {allRooms.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No rooms available</p>
              </div>
            )}
          </div>

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
                  <DiscountTypeRadioGroup
                    value={discountType}
                    onChange={handleDiscountTypeChange}
                  />
                </div>

                {/* Predefined Discount Selection */}
                {discountType === "predefined" && (
                  <div className="">
                    <Label className="font-normal text-foreground/50">Select Discount</Label>

                    <Select
                      value={selectedDiscountId ? String(selectedDiscountId) : ""}
                      onValueChange={handlePredefinedDiscountChange}
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
                          onValueChange={handleCustomDiscountTypeChange}
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

          {/* === ADDITIONAL CHARGES BLOCK === */}
          <div
            id="additional-charges"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">Additional Charges</p>
              {!showAddChargeForm && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddChargeForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Charge
                </Button>
              )}
            </div>

            {/* Summary */}
            {additionalCharges.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">
                    Total Additional Charges:
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    ₱{totalAdditionalCharges.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Add Form */}
            {showAddChargeForm && (
              <div className="border rounded-lg p-4 bg-gray-50 space-y-4 mb-4">
                <h3 className="font-semibold text-sm">New Additional Charge</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="charge-name">
                      Item/Service Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="charge-name"
                      value={chargeName}
                      onChange={e => setChargeName(e.target.value)}
                      placeholder="e.g., Broken glass, Extra service"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="charge-amount">
                      Amount (₱) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="charge-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={chargeAmount}
                      onChange={e => setChargeAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="charge-note">Note (Optional)</Label>
                  <Textarea
                    id="charge-note"
                    value={chargeNote}
                    onChange={e => setChargeNote(e.target.value)}
                    placeholder="Add any additional details..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddChargeForm(false);
                      setChargeName("");
                      setChargeAmount("");
                      setChargeNote("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!chargeName.trim() || !chargeAmount || parseFloat(chargeAmount) <= 0) {
                        toast.error("Please fill in all required fields with valid values");
                        return;
                      }

                      const newCharge = {
                        id: Date.now().toString(),
                        name: chargeName.trim(),
                        amount: parseFloat(chargeAmount),
                        note: chargeNote.trim() || undefined,
                      };

                      setAdditionalCharges(prev => [...prev, newCharge]);
                      setChargeName("");
                      setChargeAmount("");
                      setChargeNote("");
                      setShowAddChargeForm(false);
                      toast.success("Additional charge added");
                    }}
                  >
                    Add Charge
                  </Button>
                </div>
              </div>
            )}

            {/* Charges List */}
            {additionalCharges.length > 0 ? (
              <div className="space-y-2">
                <div className="divide-y border rounded-lg">
                  {additionalCharges.map(charge => (
                    <div key={charge.id} className="p-4 hover:bg-gray-50 transition-colors group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{charge.name}</h4>
                          </div>
                          {charge.note && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{charge.note}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-semibold text-sm whitespace-nowrap">
                            ₱{charge.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setAdditionalCharges(prev => prev.filter(c => c.id !== charge.id));
                              toast.success("Charge removed");
                            }}
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 border rounded-lg">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No additional charges yet</p>
              </div>
            )}
          </div>

          {/* === DOCUMENTS BLOCK === */}
          <div
            id="documents"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">Documents</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("fileUploadSimple")?.click()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Documents
              </Button>
            </div>

            <FileUploadSimple
              onFilesChange={files => {
                setSelectedBookingFiles(files);
              }}
              resetTrigger={bookingFileResetTrigger}
            />
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
                <div className="border-t-1 mt-3 pt-3 space-y-3">
                  {/* Package Price Breakdown */}
                  <div className="grid grid-cols-2">
                    <div className="col-span-1">
                      <p className="text-md font-medium">Package Price</p>
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
                          Catering: {cateringPax} pax × {formatCurrency(parseFloat(pricePerPax || "0"))} = {formatCurrency(cateringCost)}
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
                    </div>
                  </div>

                  {discountAmount > 0 && (
                    <div className="grid grid-cols-2">
                      <div className="col-span-1">
                        <p className="text-sm font-medium text-muted-foreground">Discount Amount</p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-medium text-red-500">
                          - {formatCurrency(discountAmount)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional Charges (if any) */}
                  {totalAdditionalCharges > 0 && (
                    <div className="grid grid-cols-2 pt-2 border-t">
                      <div className="col-span-1">
                        <p className="text-md font-medium">Additional Charges</p>
                        {additionalCharges.map((charge, idx) => (
                          <p key={idx} className="text-xs text-black/50">
                            {charge.name}: {formatCurrency(charge.amount)}
                          </p>
                        ))}
                      </div>
                      <div className="text-end">
                        <p className="text-md font-medium text-orange-600">
                          {formatCurrency(totalAdditionalCharges)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Grand Total */}
                  {totalAdditionalCharges > 0 && (
                    <div className="grid grid-cols-2 pt-2 border-t">
                      <div className="col-span-1">
                        <p className="text-lg font-bold">Grand Total</p>
                      </div>
                      <div className="text-end">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(discountedPrice + totalAdditionalCharges)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Down Payment & Balance */}
                  {downPayment > 0 && (
                    <div className="grid grid-cols-2 pt-2 border-t">
                      <div className="col-span-1">
                        <p className="text-sm">Downpayment</p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm text-black/50">
                          {formatCurrency(downPayment)}
                        </p>
                      </div>
                    </div>
                  )}
                  {downPayment > 0 && (
                    <div className="grid grid-cols-2">
                      <div className="col-span-1">
                        <p className="text-md font-semibold">Balance Due</p>
                      </div>
                      <div className="text-end">
                        <p className="text-md font-semibold text-orange-600">
                          {formatCurrency((discountedPrice + totalAdditionalCharges) - downPayment)}
                        </p>
                      </div>
                    </div>
                  )}
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
              <Button type="submit" className="items-center flex" disabled={isCreatingBooking}>
                {isCreatingBooking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <CalendarPlus className="mr-2" /> Create Booking
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>

    {/* Success Dialog */}
    <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <Check className="h-6 w-6" />
            Booking Created Successfully!
          </DialogTitle>
          <DialogDescription className="text-base pt-4">
            Your booking has been created and saved successfully. You will now be redirected to the event calendar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end mt-4">
          <Button
            type="button"
            onClick={handleSuccessDialogClose}
            className="w-full sm:w-auto"
          >
            Go to Event Calendar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
};
export default React.memo(AddBookingsPageClient);
