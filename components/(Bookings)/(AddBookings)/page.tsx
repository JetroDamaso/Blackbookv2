"use client";
import React, { useId, useState, useEffect } from "react";
import {
  ArrowRightIcon,
  BadgePlus,
  BadgePercent,
  Beef,
  CalendarPlus,
  Carrot,
  Check,
  CookingPot,
  Drumstick,
  Ellipsis,
  Fish,
  GlassWater,
  Ham,
  IceCream,
  Layers,
  List,
  MinusCircle,
  Pen,
  Truck,
  Users,
  X,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import RegionComboBoxComponent from "./ComboBox/RegionComboBox";
import { ScrollArea } from "@/components/ui/scroll-area";
import DishSelectComponent from "./DishCards/DishSelect";
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
import SelectedItems from "./DishCards/SelectedItems";
import TimeEndPickerCreateBookingComponent from "./TimeDatePicker/timeEndPicker";
import TimeStartPickerCreateBookingComponent from "./TimeDatePicker/timeStartPicker";
// removed unused psgc helpers
import { Button } from "@/components/ui/button";
import { StartDatePickerForm } from "./TimeDatePicker/startDatePicker";
import { EndDatePickerForm } from "./TimeDatePicker/endDatePicker";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/server/clients/pushActions";
import { createBooking } from "@/server/Booking/pushActions";
import { Textarea } from "@/components/ui/textarea";
// import MultipleSelector from "@/components/ui/multiselect";
import { createNewService } from "@/server/Services/pushActions";
// Removed unused Command imports and Autocomplete
import SearchService from "@/components/searchService";
import { createBilling } from "@/server/Billing & Payments/pushActions";
import { getDiscountById } from "@/server/Billing & Payments/pullActions";
import { createMenuWithDishes } from "@/server/Menu/pushActions";
import { getAllDiscounts } from "@/server/discount/pullActions";
import { createDiscount } from "@/server/discount/pushActions";
import AddPaymentDialog from "@/components/(Payments)/AddPaymentDialog";
import CreateBookingAddPayment from "@/components/(Payments)/BookingAddPayment";
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
  const allDishes = props.allDishes ?? [];
  const dishCategories = props.dishCategories ?? [];
  // Removed inventory-related props (allInventory, inventoryCategories) as inventory block is disabled
  const pavilions = props.pavilions ?? [];
  const eventTypes = props.eventTypes ?? [];
  const discounts = props.discounts ?? [];
  const modeOfPayments = props.modeOfPayments ?? [];
  const allServices = props.services ?? [];
  const servicesCategory = props.servicesCategory ?? [];
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
  const [selectedServiceIdsByCategory, setSelectedServiceIdsByCategory] =
    useState<Record<number, number[]>>({});
  const [typedServiceByCategory, setTypedServiceByCategory] = useState<
    Record<number, string>
  >({});
  // Discount selection state
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(
    null
  );
  const [discountName, setDiscountName] = useState("");
  // New enhanced discount state
  const [discountType, setDiscountType] = useState<
    "predefined" | "custom" | "none"
  >("none");
  const [customDiscountName, setCustomDiscountName] = useState("");
  const [customDiscountType, setCustomDiscountType] = useState<
    "percent" | "amount"
  >("percent");
  const [customDiscountValue, setCustomDiscountValue] = useState<number>(0);
  const [customDiscountDescription, setCustomDiscountDescription] =
    useState("");
  const [isCustomDiscountDialogOpen, setIsCustomDiscountDialogOpen] =
    useState(false);
  const [isLoadingCustomDiscount, setIsLoadingCustomDiscount] = useState(false);

  // Removed unused pavilion/hour pricing interim states (reintroduce if needed)
  const [selectedCatering, setSelectedCatering] = useState<string>("0");
  const [selectedPavilionId, setSelectedPavilionId] = useState<number | null>(
    preSelectedPavilionId ? parseInt(preSelectedPavilionId, 10) : null
  );
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );
  // Removed unused bookingTotalPrice state
  const [downPayment, setDownPayment] = useState<number>(0);

  const [startDate, setStartDate] = useState<Date | null>(
    preSelectedStartDate ? new Date(preSelectedStartDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    preSelectedEndDate ? new Date(preSelectedEndDate) : null
  );
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

  // Pre-compute a set of booked calendar days (date-only) for quick disable lookup
  const bookedDaySet = React.useMemo(() => {
    if (selectedPavilionId == null) return new Set<string>();
    const set = new Set<string>();
    bookingsRef.current
      .filter((b) => b.pavilionId === selectedPavilionId)
      .forEach((b) => {
        const start = new Date(b.startAt);
        const end = new Date(b.endAt);
        let cursor = new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate()
        );
        const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        while (cursor <= last) {
          set.add(cursor.toISOString().slice(0, 10));
          cursor = new Date(
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate() + 1
          );
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
  });

  const createBookingMutation = useMutation({
    mutationKey: ["create-bookings"],
    mutationFn: (data: {
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
    }) =>
      createBooking(
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
      ),
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
      yve?: number;
      discountAmount?: number;
      discountId?: number;
      isCustomDiscount?: boolean;
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
        undefined, // dateCompleted
        data.yve,
        data.discountAmount,
        data.discountId,
        data.isCustomDiscount
      ),
  });

  //Sets dishIcon
  const DishIcon = ({ categoryId }: { categoryId: number }) => {
    const categoryID = categoryId || "";

    if (categoryID == 1) {
      return (
        <>
          <Beef size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    }
    if (categoryID == 2)
      return (
        <>
          <Ham size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );

    if (categoryID == 3)
      return (
        <>
          <Drumstick size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 4)
      return (
        <>
          <Fish size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 5)
      return (
        <>
          <Carrot size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 6)
      return (
        <>
          <CookingPot size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 7)
      return (
        <>
          <IceCream size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 8)
      return (
        <>
          <GlassWater size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );
    if (categoryID == 9)
      return (
        <>
          <Ellipsis size={16} className="shrink-0 max-md:mt-0.5" />
        </>
      );

    return <></>;
  };

  // Add dish: increment quantity if exists, else add with quantity 1
  const addDish = (dish: Dish) => {
    setSelectedDishes((prev) => {
      const idx = prev.findIndex((d) => d.id === dish.id);
      if (idx !== -1) {
        // Already exists, increment quantity
        return prev.map((d, i) =>
          i === idx ? { ...d, quantity: d.quantity + 1 } : d
        );
      } else {
        // New dish, add with quantity 1
        return [...prev, { ...dish, quantity: 1 }];
      }
    });
  };

  // Inventory icon mapping (placeholder: copied from DishIcon)
  // Removed unused InventoryIcon component

  const removeDish = (dishId: number) => {
    setSelectedDishes((prev) =>
      prev
        .map((d) => (d.id === dishId ? { ...d, quantity: d.quantity - 1 } : d))
        .filter((d) => d.quantity > 0)
    );
  };

  // Removed unused inventory handlers
  // discountType state removed; discount id read directly from form on submit.

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
          setDiscountPercentage(
            typeof rec?.percent === "number" ? rec.percent : 0
          );
        }
      } catch (e) {
        console.error("Failed loading discount", e);
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

  const handleSubmitDraft = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("u clicked me");
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventName = formData.get("eventName");
    const numberOfPax = formData.get("numPax");
    const eventType = formData.get("eventType");
    const pavilion = formData.get("pavilion");
    const packageId = formData.get("package");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const phoneNumber = formData.get("phoneNumber");
    const email = formData.get("email");
    const modeOfPayment = formData.get("modeOfPayment");
    const downpayment = formData.get("downpayment");
    const discount = formData.get("discount");
    const notes = formData.get("notes");

    const selectedModeOfPaymentId = Number(modeOfPayment);
    const selectedModeOfPayment = modeOfPayments.find(
      (m) => m.id === selectedModeOfPaymentId
    );

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
      const values = formData
        .getAll(`services[${cat.id}][]`)
        .map((v) => Number(v));
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
          (s) =>
            s.categoryId === cat.id &&
            (s.name?.toLowerCase() ?? "") === typed.toLowerCase()
        );
        if (existing) {
          mergedServiceIdsByCategory[cat.id] = Array.from(
            new Set([
              ...(mergedServiceIdsByCategory[cat.id] ?? []),
              existing.id,
            ])
          );
        } else {
          try {
            const created = await createServiceMutation.mutateAsync({
              serviceName: typed,
              categoryId: cat.id,
            });
            if (created?.id) {
              mergedServiceIdsByCategory[cat.id] = Array.from(
                new Set([
                  ...(mergedServiceIdsByCategory[cat.id] ?? []),
                  created.id,
                ])
              );
            }
          } catch (err) {
            console.error("Failed to create service on submit", err);
          }
        }
      }
    }

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

    const clientID = Number(client?.id);

    if (!clientID || isNaN(clientID)) {
      throw new Error("Failed to create client or invalid client ID");
    }

    const serviceIdsFlat = Object.values(mergedServiceIdsByCategory).flat();

    // Validate dates
    const validStartAt =
      startAt && !isNaN(startAt.getTime()) ? startAt : new Date();
    const validEndAt = endAt && !isNaN(endAt.getTime()) ? endAt : new Date();

    const booking = await createBookingMutation.mutateAsync({
      eventName: String(eventName ?? ""),
      clientID: clientID,
      pavilionID: String(pavilion ?? ""),
      pax: String(numberOfPax ?? ""),
      eventType: Number(eventType ?? 0),
      notes: String(notes ?? ""),
      startAt: validStartAt,
      endAt: validEndAt,
      serviceIds: serviceIdsFlat.length ? serviceIdsFlat : undefined,
      packageId: packageId ? Number(packageId) : undefined,
      catering: selectedCatering ? Number(selectedCatering) : undefined,
    });

    const bookingId = Number(booking?.id);

    // If in-house catering selected (value "1"), create a menu with selected dishes & their quantities
    if (selectedCatering === "1" && bookingId) {
      try {
        const dishIds = selectedDishes.flatMap((d) =>
          Array(d.quantity).fill(d.id)
        );
        if (dishIds.length) {
          await createMenuWithDishes(bookingId, dishIds);
        }
      } catch (err) {
        console.error("Failed to create menu with dishes", err);
      }
    }

    // Handle discount creation and calculation
    let finalDiscountId = selectedDiscountId;
    let finalDiscountType = discountName;
    let finalDiscountPercentage = discountPercentage;
    let finalDiscountAmount = discountAmount;
    let finalIsCustomDiscount = false;

    // If custom discount is selected, create it first
    if (
      discountType === "custom" &&
      customDiscountName &&
      customDiscountValue > 0
    ) {
      try {
        const customDiscount = await createDiscount({
          name: customDiscountName,
          percent:
            customDiscountType === "percent" ? customDiscountValue : undefined,
          amount:
            customDiscountType === "amount" ? customDiscountValue : undefined,
          description: customDiscountDescription || undefined,
          isActive: true,
        });

        if (customDiscount?.id) {
          finalDiscountId = customDiscount.id;
          finalDiscountType = customDiscountName;
          finalIsCustomDiscount = true;

          // Recalculate discount amount based on the created discount
          if (customDiscountType === "percent") {
            finalDiscountPercentage = customDiscountValue;
            finalDiscountAmount = originalPrice * (customDiscountValue / 100);
          } else {
            finalDiscountAmount = customDiscountValue;
            finalDiscountPercentage =
              originalPrice > 0
                ? (customDiscountValue / originalPrice) * 100
                : 0;
          }
        }
      } catch (err) {
        console.error("Failed to create custom discount", err);
        // Continue with no discount if creation fails
        finalDiscountId = null;
        finalDiscountType = "";
        finalDiscountPercentage = 0;
        finalDiscountAmount = 0;
      }
    }

    await createBillingMutation.mutateAsync({
      bookingId: Number(bookingId ?? 0),
      originalPrice: Number(originalPrice || 0),
      discountedPrice: discountedPrice,
      discountType: finalDiscountType,
      discountPercentage: Number(finalDiscountPercentage),
      balance: Number(finalBalance),
      modeOfPayment: selectedModeOfPayment?.name ?? "",
      deposit: Number(downpayment),
      status: 1,
      discountAmount: finalDiscountAmount,
      discountId: finalDiscountId || undefined,
      isCustomDiscount: finalIsCustomDiscount,
    });

    console.log({
      firstName,
      lastName,
      phoneNumber,
      email,
      eventName,
      numberOfPax,
      eventType,
      pavilion,
      modeOfPayment,
      modeOfPaymentName: selectedModeOfPayment?.name ?? "",
      downpayment,
      discount,
      discountPercentage,
      startAt,
      endAt,
      selectedServiceIdsByCategory: mergedServiceIdsByCategory,
    });
  };

  const handlePavilionSelect = (e: string) => {
    console.log("PAVILION SELECT" + e);
  };

  // Removed unused price change handlers (hours, pavilion, total) to satisfy lint; add back if needed where values are updated.

  const [numPax, setNumPax] = useState<string>("");

  const getMonthName = (d: Date) =>
    d.toLocaleString("en-US", { month: "long" });

  const getDayName = (d: Date) =>
    d.toLocaleString("en-US", { weekday: "long" });

  const finalStartDay = startAt ? `${getDayName(startAt)},` : "";
  const finalStartDate = startAt
    ? `${getMonthName(startAt).slice(0, 3)} ${startAt.getDate()}, ${startAt.getFullYear()}`
    : "";
  const finalStartTime = startAt
    ? `${startAt.getHours() % 12 || 12}:${
        startAt.getMinutes() < 10
          ? `0${startAt.getMinutes()}`
          : startAt.getMinutes()
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

  const totalDays =
    startAt && endAt && endAt > startAt
      ? getDaysDifference(startAt, endAt)
      : "";
  const totalHours =
    startAt && endAt && endAt > startAt
      ? getHoursDifference(startAt, endAt)
      : "";

  const selectedPavilion =
    selectedPavilionId !== null
      ? (pavilions.find((p) => p.id === selectedPavilionId) ?? null)
      : null;

  const filteredPackages = selectedPavilionId
    ? packages.filter((p) => p.pavilionId === selectedPavilionId)
    : [];

  const selectedPackage = selectedPackageId
    ? (filteredPackages.find((p) => p.id === selectedPackageId) ?? null)
    : null;
  const selectedPackageItems = (selectedPackage?.description ?? "")
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);

  // Pricing calculations
  const formatCurrency = (n: number) =>
    `₱ ${Math.max(0, Math.round(n)).toLocaleString()}`;
  const basePackagePrice = selectedPackage?.price ?? 0;
  const hoursCount = typeof totalHours === "number" ? totalHours : 0;
  const extraHours = Math.max(0, hoursCount - 5);
  const extraHoursFee = extraHours * 2000;
  const originalPrice = basePackagePrice + extraHoursFee; // before discount

  // Calculate discount amount based on type
  let discountAmount = 0;
  if (discountType === "predefined" && selectedDiscountId) {
    const selectedDiscount = discounts.find((d) => d.id === selectedDiscountId);
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
  const finalBalance = Math.max(0, discountedPrice - downPayment);

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
                <Dialog>
                  <DialogTrigger className="w-full">
                    <div className="flex border-1 p-6 rounded-lg justify-between items-center group">
                      <div className="flex items-center gap-4">
                        {selectedPavilion && (
                          <div
                            className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                            style={{
                              backgroundColor: (() => {
                                const sanitized = selectedPavilion.color
                                  ?.toLowerCase()
                                  .replace(/[^a-z0-9-]/g, "")
                                  .split(/-+/)[0];
                                let color: string = "#ef4444"; // fallback red-500
                                if (selectedPavilion.color) {
                                  const trimmed = selectedPavilion.color.trim();
                                  if (
                                    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(
                                      trimmed
                                    )
                                  ) {
                                    color = trimmed;
                                  } else if (
                                    sanitized &&
                                    COLOR_TOKEN_TO_HEX[sanitized]
                                  ) {
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
                            <p className="font-medium text-lg">
                              {selectedPavilion
                                ? selectedPavilion.name
                                : "Select a pavilion"}
                            </p>
                            {selectedPavilion && (
                              <Badge variant="secondary" className="text-xs">
                                <Users size={12} className="mr-1 opacity-60" />
                                {selectedPavilion.maxPax} pax
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-normal text-foreground/50">
                            {selectedPavilion
                              ? selectedPavilion.description ||
                                "No description available"
                              : "Choose a pavilion to see details"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Pen size={18} />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold">
                        Choose Your Pavilion
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                      <div className="mt-6">
                        <RadioGroup
                          name="pavilion"
                          value={
                            selectedPavilionId
                              ? String(selectedPavilionId)
                              : undefined
                          }
                          onValueChange={(val) => {
                            setSelectedPavilionId(Number(val));
                            setSelectedPackageId(null);
                            const pav = pavilions.find(
                              (p) => String(p.id) === val
                            );
                            handlePavilionSelect(pav ? pav.name : val);
                          }}
                          className="grid grid-cols-1 gap-2"
                        >
                          {pavilions.map((pavilion) => {
                            const sanitized = pavilion.color
                              ?.toLowerCase()
                              .replace(/[^a-z0-9-]/g, "")
                              .split(/-+/)[0];
                            // Determine color: prefer valid hex, else map token, fallback red-500.
                            let pavilionColor: string = "#ef4444"; // fallback red-500
                            if (pavilion.color) {
                              const trimmed = pavilion.color.trim();
                              if (
                                /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)
                              ) {
                                pavilionColor = trimmed;
                              } else if (
                                sanitized &&
                                COLOR_TOKEN_TO_HEX[sanitized]
                              ) {
                                pavilionColor = COLOR_TOKEN_TO_HEX[sanitized];
                              }
                            }

                            return (
                              <div
                                key={pavilion.id}
                                className="relative flex items-start gap-3 rounded-lg border p-4 shadow-sm outline-none transition-all duration-200 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                              >
                                <RadioGroupItem
                                  value={`${pavilion.id}`}
                                  id={`pavilion-${pavilion.id}`}
                                  className="order-1 mt-1 after:absolute after:inset-0"
                                />

                                <div className="flex items-start gap-3 flex-1">
                                  {/* Content */}
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                      <Label
                                        htmlFor={`pavilion-${pavilion.id}`}
                                        className="text-base font-medium cursor-pointer transition-colors"
                                      >
                                        {pavilion.name}
                                      </Label>
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Users size={12} className="mr-1" />
                                          {pavilion.maxPax} guests
                                        </Badge>
                                      </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                      {pavilion.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="">
                <div className="mt-5">
                  <Dialog>
                    <DialogTrigger className="w-full">
                      {/* <p className="border-dashed border-2 px-4 py-8 rounded-md bg-muted/50 justify-center text-foreground/50 flex">
                        select a package
                      </p> */}

                      <div className=" flex border-1 p-4 rounded-md justify-between  items-center">
                        <div className="flex flex-col justify-start items-start">
                          <p className="flex font-medium gap-2 items-center text-lg">
                            {selectedPackage
                              ? selectedPackage.name
                              : "Select a package"}
                            {selectedPackage && (
                              <span className="text-xs font-normal">
                                (₱{selectedPackage.price.toLocaleString()})
                              </span>
                            )}
                          </p>
                          <p className="text-sm font-normal text-foreground/50">
                            {selectedPackage
                              ? selectedPackage.description ||
                                "No description available"
                              : "Choose a package to see details"}
                          </p>
                        </div>

                        <Pen size={18} />
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription className="mt-4">
                          <div>
                            <RadioGroup
                              name="package"
                              className="flex flex-col"
                              onValueChange={(val) =>
                                setSelectedPackageId(Number(val))
                              }
                            >
                              {selectedPavilionId === null && (
                                <div className="col-span-4 text-sm text-muted-foreground">
                                  Select a pavilion to see its packages.
                                </div>
                              )}
                              {selectedPavilionId !== null &&
                                filteredPackages.length === 0 && (
                                  <div className="col-span-4 text-sm text-muted-foreground">
                                    No packages available for the selected
                                    pavilion.
                                  </div>
                                )}
                              {filteredPackages.map((pack) => {
                                const items = (pack.description ?? "")
                                  .split(".")
                                  .map((s) => s.trim())
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
                                      <Label
                                        className="flex items-center"
                                        htmlFor={`${pack.id}`}
                                      >
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
                      initialDate={endDate}
                      disabledDates={bookedDaySet}
                      minDate={startDate}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-4 w-full ">
                    <div className="flex-grow">
                      <TimeStartPickerCreateBookingComponent
                        startTimeOnChange={setStartTime}
                      />
                    </div>
                    <div className="flex-grow">
                      <TimeEndPickerCreateBookingComponent
                        endTimeOnChange={setEndTime}
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
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Event Details</p>
            <div className="flex">
              <div className="mt-2 *:not-first:mt-2 flex-1">
                <Label className="text-foreground/50 font-normal">
                  Event Name
                </Label>
                <Input
                  name="eventName"
                  placeholder="Chris' Birthday Party"
                  type="text"
                />
              </div>
              <div className="mt-2 *:not-first:mt-2 flex-1 ml-4">
                <Label className="text-foreground/50 font-normal">
                  No. of pax
                </Label>
                <Input
                  name="numPax"
                  placeholder="200"
                  type="text"
                  value={numPax}
                  onChange={(e) => setNumPax(e.currentTarget.value)}
                />
              </div>
            </div>
            <div className="mt-4 *:not-first:mt-2">
              <Label className="text-foreground/50 font-normal">
                Event type
              </Label>

              <Select name="eventType">
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((eventType) => (
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
            <p className="font-bold text-lg">Catering</p>
            <p className="text-sm text-zinc-500">
              Choose the catering service for the client’s event.
            </p>
            <div className="">
              <div className="mt-5">
                <div>
                  <RadioGroup
                    className="grid grid-cols-4 "
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
                        <Label
                          htmlFor={`${id}-1`}
                          className="flex items-center"
                        >
                          <Users className="mr-1" size={20} />
                          {"Susing and Rufins Catering"}
                          <span className="text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div
                          id={`${id}-1-description`}
                          className="text-muted-foreground text-xs"
                        >
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>Use the in-house catering.</li>
                            <li>
                              Menu, staff, and setup are handled internally.
                            </li>
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
                        <Label
                          htmlFor={`${id}-2`}
                          className="flex items-center"
                        >
                          <Truck className="mr-1" size={20} />
                          {"3rd Party Catering"}
                          <span className=" ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div
                          id={`${id}-2-description`}
                          className="text-muted-foreground text-xs"
                        >
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>Client brings an external caterer.</li>
                            <li>
                              All food, equipment, and utensils are provided by
                              the caterer.
                            </li>
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
                        <Label
                          htmlFor={`${id}-2`}
                          className="flex items-center"
                        >
                          <Layers className="mr-1" size={20} />
                          {"Hybrid Service"}
                          <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div
                          id={`${id}-2-description`}
                          className="text-muted-foreground text-xs"
                        >
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>Client provides an external caterer.</li>
                            <li>
                              Susing and Rufins staff handle serving, table
                              setup, and cleanup.
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
                        <Label
                          htmlFor={`${id}-4`}
                          className="flex items-center"
                        >
                          <MinusCircle className="mr-1" size={20} />
                          {"None"}
                          <span className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
                        </Label>
                        <div
                          id={`${id}-4-description`}
                          className="text-muted-foreground text-xs"
                        >
                          <ul className="list-disc list-inside space-y-1 mb-2">
                            <li>No catering service included.</li>
                            <li>
                              No food or beverage arrangements are needed.
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="mt-4"></div>
            </div>
          </div>
          {/* === Select DIshesBLOCK === */}
          {selectedCatering === "1" && (
            <div
              id="menu"
              className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
            >
              <p className="font-bold text-lg">Dishes</p>
              <p className="text-sm text-zinc-500">
                Select dishes for the booking
              </p>
              <div className="">
                <div className="mt-5">
                  <div>
                    {/* select here */}
                    <div className="flex">
                      <div className="flex ">
                        <div>
                          <p>Dishes:</p>
                          <Tabs
                            defaultValue={String(dishCategories[0]?.id ?? "")}
                            orientation="vertical"
                            className="w-full flex-row "
                          >
                            <TabsList className="flex-col justify-start items-start">
                              <TabsTrigger
                                value={`allCategory`}
                                className="w-full"
                                key={`allCategory`}
                              >
                                <List
                                  size={16}
                                  className="shrink-0 max-md:mt-0.5"
                                />
                                <p>All</p>
                              </TabsTrigger>
                              {dishCategories.map((category) => (
                                <TabsTrigger
                                  value={`${category.id}`}
                                  className="w-full"
                                  key={category.id}
                                >
                                  <DishIcon categoryId={category.id} />
                                  {category.name}
                                </TabsTrigger>
                              ))}
                            </TabsList>
                            <div className="grow rounded-md border text-start">
                              <TabsContent
                                key={`allCategory`}
                                value={`allCategory`}
                              >
                                {/* DISH ITEM */}
                                <ScrollArea className="h-[325px] w-full">
                                  <DishSelectComponent
                                    dishes={allDishes}
                                    onAddDish={addDish}
                                  />
                                </ScrollArea>
                              </TabsContent>
                              {dishCategories.map((category) => {
                                const dishesForCategory = allDishes.filter(
                                  (d) => d.categoryId === category.id
                                );
                                return (
                                  <TabsContent
                                    key={category.id}
                                    value={`${category.id}`}
                                  >
                                    {/* DISH ITEM */}
                                    <ScrollArea className="h-[325px] w-full">
                                      <DishSelectComponent
                                        dishes={dishesForCategory}
                                        onAddDish={addDish}
                                      />
                                    </ScrollArea>
                                  </TabsContent>
                                );
                              })}
                            </div>
                          </Tabs>
                        </div>
                      </div>
                      {/* select here end */}
                      {/* selected block */}
                      <SelectedItems
                        selectedDishes={selectedDishes}
                        onRemoveDish={removeDish}
                        dishCategories={dishCategories}
                      />
                      {/* selected block end */}
                    </div>
                  </div>
                </div>
                <div className="mt-4"></div>
              </div>
            </div>
          )}
          {/* === INVENTORY BLOCK === */}
          {/* <div
            id="inventory"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Inventory</p>
            <p className="text-sm text-zinc-500">
              Select inventory for the booking
            </p>
            <div className="">
              <div className="mt-5">
                <div>
                  <div className="flex">
                    <div className="flex ">
                      <div>
                        <p>Inventory:</p>
                        <Tabs
                          defaultValue={String(
                            inventoryCategories[0]?.id ?? "allInventory"
                          )}
                          orientation="vertical"
                          className="w-full flex-row "
                        >
                          <TabsList className="flex-col justify-start items-start">
                            <TabsTrigger
                              value={`allInventory`}
                              className="w-full"
                              key={`allInventory`}
                            >
                              <List
                                size={16}
                                className="shrink-0 max-md:mt-0.5"
                              />
                              <p>All</p>
                            </TabsTrigger>
                            {inventoryCategories.map((category) => (
                              <TabsTrigger
                                value={`${category.id}`}
                                className="w-full"
                                key={category.id}
                              >
                                <InventoryIcon categoryId={category.id} />
                                {category.name}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                          <div className="grow rounded-md border text-start">
                            <TabsContent
                              key={`allInventory`}
                              value={`allInventory`}
                            >
                              <ScrollArea className="h-[325px] w-full">
                                <InventorySelectComponent
                                  items={allInventory}
                                  onAddItem={addInventoryItem}
                                />
                              </ScrollArea>
                            </TabsContent>
                            {inventoryCategories.map((category) => {
                              const itemsForCategory = allInventory.filter(
                                (i) => i.categoryId === category.id
                              );
                              return (
                                <TabsContent
                                  key={category.id}
                                  value={`${category.id}`}
                                >
                                  <ScrollArea className="h-[325px] w-full">
                                    <InventorySelectComponent
                                      items={itemsForCategory}
                                      onAddItem={addInventoryItem}
                                    />
                                  </ScrollArea>
                                </TabsContent>
                              );
                            })}
                          </div>
                        </Tabs>
                      </div>
                    </div>
                    <InventorySelectedItems
                      selectedItems={selectedInventory}
                      onRemoveItem={removeInventoryItem}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4"></div>
            </div>
          </div> */}
          {/* === SELECT SERVICES BLOCK === */}
          {/* <div
            id="services"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Services</p>
            <p className="text-sm text-zinc-500">
              Pick additional services that the client wants to include in the booking.
            </p>
            <div className="">
              <div className="mt-5">
                <div className="flex items-center [--primary:var(--color-red-500)] [--ring:var(--color-red-500)] in-[.dark]:[--primary:var(--color-red-500)] in-[.dark]:[--ring:var(--color-red-500)]">
                  <div className="grid grid-cols-3 gap-3 w-full">


                  </div>
                </div>
              </div>
            </div>
          </div> */}
          {/* === SELECT SERVICES BLOCK === */}
          <div
            id="services"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Other Services</p>
            <div className="">
              <div className="mt-2">
                <div className="flex items-center [--primary:var(--color-red-500)] [--ring:var(--color-red-500)] in-[.dark]:[--primary:var(--color-red-500)] in-[.dark]:[--ring:var(--color-red-500)]">
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {servicesCategory.map((category) => (
                      <div className=" mt-1" key={category.id}>
                        <Label className="font-normal text-foreground/50">
                          {category.name}
                        </Label>
                        <div className="mt-2">
                          <SearchService
                            services={allServices.filter(
                              (s) => s.categoryId === category.id
                            )}
                            value={typedServiceByCategory[category.id] ?? ""}
                            onTypeChange={(v) =>
                              setTypedServiceByCategory((prev) => ({
                                ...prev,
                                [category.id]: v,
                              }))
                            }
                            onPick={async (val) => {
                              const existing = allServices.find(
                                (s) =>
                                  (s.name?.toLowerCase() ?? "") ===
                                    val.toLowerCase() &&
                                  s.categoryId === category.id
                              );
                              if (existing) {
                                setSelectedServiceIdsByCategory((prev) => ({
                                  ...prev,
                                  [category.id]: Array.from(
                                    new Set([
                                      ...(prev[category.id] ?? []),
                                      existing.id,
                                    ])
                                  ),
                                }));
                                setTypedServiceByCategory((prev) => ({
                                  ...prev,
                                  [category.id]: existing.name ?? "",
                                }));
                              } else {
                                const created =
                                  await createServiceMutation.mutateAsync({
                                    serviceName: val,
                                    categoryId: category.id,
                                  });
                                if (created?.id) {
                                  setSelectedServiceIdsByCategory((prev) => ({
                                    ...prev,
                                    [category.id]: Array.from(
                                      new Set([
                                        ...(prev[category.id] ?? []),
                                        created.id,
                                      ])
                                    ),
                                  }));
                                  setTypedServiceByCategory((prev) => ({
                                    ...prev,
                                    [category.id]: created.name ?? val,
                                  }));
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* === CLIENT BLOCK === */}
          <div
            id="services"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Client Details</p>
            <p className="text-sm text-zinc-500">
              Details about the person or organization booking.
            </p>
            <div className="">
              <div className="mt-5">
                <div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="*:not-first:mt-2">
                      <Label className="font-normal text-foreground/50">
                        First name
                      </Label>
                      <Input name="firstName" placeholder="John" type="text" />
                    </div>
                    <div className="*:not-first:mt-2">
                      <Label className="font-normal text-foreground/50">
                        Last name
                      </Label>
                      <Input name="lastName" placeholder="Doe" type="text" />
                    </div>
                    <div className="*:not-first:mt-2">
                      <Label className="font-normal text-foreground/50">
                        Phone number
                      </Label>
                      <Input
                        name="phoneNumber"
                        placeholder="09123456789"
                        type="tel"
                      />
                    </div>
                    <div className="*:not-first:mt-2">
                      <Label className="font-normal text-foreground/50">
                        Email address
                      </Label>
                      <Input
                        name="email"
                        placeholder="johndoe@gmail.com"
                        type="email"
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
              </div>
            </div>
          </div>

          {/* === DISCOUNT BLOCK === */}
          <div
            id="discount"
            className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
          >
            <p className="font-bold text-lg">Discount</p>
            <p className="text-sm text-zinc-500">
              Choose a discount option for this booking.
            </p>
            <div className="mt-5">
              <div className="space-y-4">
                {/* Discount Type Selection */}
                <div>
                  <RadioGroup
                    value={discountType}
                    onValueChange={(
                      value: "predefined" | "custom" | "none"
                    ) => {
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
                      <Label
                        htmlFor="predefined"
                        className="font-normal cursor-pointer"
                      >
                        Predefined Discount
                      </Label>
                    </div>
                    <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                      <RadioGroupItem
                        value="custom"
                        id="custom"
                        className="after:absolute after:inset-0 after:cursor-pointer"
                      />
                      <Label
                        htmlFor="custom"
                        className="font-normal cursor-pointer"
                      >
                        Custom Discount
                      </Label>
                    </div>
                    <div className="relative flex items-center space-x-2 border-1 p-4 rounded-md cursor-pointer transition-colors hover:bg-muted/50 has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                      <RadioGroupItem
                        value="none"
                        id="none"
                        className="after:absolute after:inset-0 after:cursor-pointer"
                      />
                      <Label
                        htmlFor="none"
                        className="font-normal cursor-pointer"
                      >
                        None
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Predefined Discount Selection */}
                {discountType === "predefined" && (
                  <div className="">
                    <Label className="font-normal text-foreground/50">
                      Select Discount
                    </Label>

                    <Select
                      value={
                        selectedDiscountId ? String(selectedDiscountId) : ""
                      }
                      onValueChange={async (value) => {
                        if (value === "") {
                          setSelectedDiscountId(null);
                          setDiscountName("");
                          setDiscountPercentage(0);
                          return;
                        }
                        const discountId = parseInt(value, 10);
                        setSelectedDiscountId(discountId);

                        // Find discount in the predefined list
                        const selectedDiscount = discounts.find(
                          (d) => d.id === discountId
                        );
                        if (selectedDiscount) {
                          setDiscountName(selectedDiscount.name);
                          // Calculate percentage based on discount type
                          if (selectedDiscount.percent) {
                            setDiscountPercentage(selectedDiscount.percent);
                          } else if (selectedDiscount.amount) {
                            // Convert amount to percentage based on current total
                            const currentTotal =
                              basePackagePrice + extraHoursFee;
                            const percentage =
                              currentTotal > 0
                                ? (selectedDiscount.amount / currentTotal) * 100
                                : 0;
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
                        {discounts.map((discount) => (
                          <SelectItem
                            key={discount.id}
                            value={String(discount.id)}
                          >
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
                          placeholder="e.g., Special Event Discount"
                          value={customDiscountName}
                          onChange={(e) =>
                            setCustomDiscountName(e.target.value)
                          }
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
                            <SelectItem value="percent">
                              Percentage (%)
                            </SelectItem>
                            <SelectItem value="amount">
                              Fixed Amount (₱)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="font-normal text-foreground/50 mb-2 mt-4 block">
                          {customDiscountType === "percent"
                            ? "Percentage"
                            : "Amount"}
                        </Label>
                        <div className="relative">
                          <Input
                            placeholder={
                              customDiscountType === "percent" ? "10" : "1000"
                            }
                            value={customDiscountValue || ""}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value) || 0;
                              if (
                                customDiscountType === "percent" &&
                                value > 100
                              ) {
                                return; // Don't allow more than 100%
                              }
                              setCustomDiscountValue(value);

                              // Calculate discount percentage for display
                              if (customDiscountType === "percent") {
                                setDiscountPercentage(value);
                              } else {
                                const currentTotal =
                                  basePackagePrice + extraHoursFee;
                                const percentage =
                                  currentTotal > 0
                                    ? (value / currentTotal) * 100
                                    : 0;
                                setDiscountPercentage(percentage);
                              }
                            }}
                            min="0"
                            max={
                              customDiscountType === "percent"
                                ? "100"
                                : undefined
                            }
                            step={
                              customDiscountType === "percent" ? "0.1" : "1"
                            }
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                            {customDiscountType === "percent" ? "%" : "₱"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="font-normal text-foreground/50 mb-2 block mt-4">
                          Description (Optional)
                        </Label>
                        <Input
                          placeholder="Brief description"
                          value={customDiscountDescription}
                          onChange={(e) =>
                            setCustomDiscountDescription(e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* === BILLING BLOCK === */}
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
                  {selectedPavilion
                    ? selectedPavilion.name
                    : "Select a pavilion"}
                </p>
                {selectedPavilion && (
                  <Badge variant={"secondary"} className="ml-2">
                    <Users
                      className="-ms-0.5 opacity-60"
                      size={12}
                      aria-hidden="true"
                    />
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
                      {typeof totalDays === "number" &&
                      typeof totalHours === "number"
                        ? `${totalDays > 0 ? `${totalDays} day(s), ` : ""}${totalHours} hour(s)`
                        : ``}
                    </p>
                    {hoursCount > 5 && (
                      <p className="text-xs text-black/50">
                        Includes extra hours fee for {extraHours} hour(s)
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
                                  (d) => d.id === selectedDiscountId
                                );
                                if (selectedDiscount?.percent)
                                  return `${selectedDiscount.percent}% off`;
                                if (selectedDiscount?.amount)
                                  return `₱${selectedDiscount.amount.toLocaleString()} off`;
                                return "Discount applied";
                              })()
                            : discountType === "custom" &&
                                customDiscountValue > 0
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
              <CreateBookingAddPayment
                bookingData={{
                  // Client data - will be collected from form
                  firstName: "",
                  lastName: "",
                  phoneNumber: "",
                  email: "",
                  region: region ?? "",
                  province: province ?? "",
                  municipality: municipality ?? "",
                  barangay: barangay ?? "",

                  // Booking data - from current state
                  eventName: "",
                  pavilionId: String(selectedPavilionId ?? ""),
                  numPax: numPax,
                  eventType: 0,
                  notes: "",
                  startAt: startAt ?? new Date(),
                  endAt: endAt ?? new Date(),
                  serviceIds: Object.values(
                    selectedServiceIdsByCategory
                  ).flat(),
                  packageId: selectedPackageId ?? undefined,
                  catering: selectedCatering
                    ? Number(selectedCatering)
                    : undefined,

                  // Billing data - from calculations
                  originalPrice: originalPrice,
                  discountedPrice: discountedPrice,
                  discountType: discountName,
                  discountPercentage: discountPercentage,
                  balance: finalBalance,
                  modeOfPaymentName: "",
                  deposit: downPayment,

                  // Selected dishes for catering
                  selectedDishes: selectedDishes.map((dish) => ({
                    id: dish.id,
                    quantity: dish.quantity,
                  })),
                }}
                totalAmount={discountedPrice}
                getFormData={() => {
                  const form = document.getElementById(
                    "booking-form"
                  ) as HTMLFormElement;
                  return form ? new FormData(form) : null;
                }}
                onBookingCreated={() => {
                  console.log("Booking created successfully!");
                  // Could add navigation or form reset here
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
export default AddBookingsPageClient;
