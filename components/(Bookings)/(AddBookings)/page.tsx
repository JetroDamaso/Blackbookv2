"use client";
import React, {useId, useState} from "react";
import {
    ArrowRightIcon,
    Beef,
    Box,
    Carrot,
    Check,
    CookingPot,
    Crown,
    Drumstick,
    Ellipsis,
    Fish,
    GlassWater,
    Ham,
    IceCream,
    Layers,
    List,
    MinusCircle,
    Truck,
    Users
} from "lucide-react";

import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
// removed unused Carousel imports
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
// removed unused next/image import
import {Badge} from "@/components/ui/badge";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Checkbox} from "@/components/ui/checkbox";
import RegionComboBoxComponent from "./ComboBox/RegionComboBox";
import {ScrollArea} from "@/components/ui/scroll-area";
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
    Pavilion,
} from "@/generated/prisma";
import SelectedItems from "./DishCards/SelectedItems";
import InventorySelectComponent from "./InventoryCards/InventorySelect";
import InventorySelectedItems from "./InventoryCards/SelectedItems";
import TimeEndPickerCreateBookingComponent from "./TimeDatePicker/timeEndPicker";
import TimeStartPickerCreateBookingComponent from "./TimeDatePicker/timeStartPicker";
// removed unused psgc helpers
import {Button} from "@/components/ui/button";
import {StartDatePickerForm} from "./TimeDatePicker/startDatePicker";
import {EndDatePickerForm} from "./TimeDatePicker/endDatePicker";
import {useMutation} from "@tanstack/react-query";
import {createClient} from "@/server/clients/pushActions";
import {createBooking} from "@/server/Booking/pushActions";
import {Textarea} from "@/components/ui/textarea";
// import MultipleSelector from "@/components/ui/multiselect";
import {createNewService} from "@/server/Services/pushActions";
// Removed unused Command imports and Autocomplete
import SearchService from "@/components/searchService";
// Removed server-side imports from client component

type SelectedDish = Dish & { quantity: number };
type SelectedInventory = InventoryItem & { quantity: number };

const AddBookingsPageClient = (props: {
    allDishes: Dish[];
    dishCategories: DishCategory[];
    allInventory?: InventoryItem[];
    inventoryCategories?: InventoryCategory[];
    pavilions: Pavilion[];
    eventTypes: EventTypes[];
    discounts: Discount[];
    modeOfPayments: ModeOfPayment[];
    servicesCategory?: OtherServiceCategory[];
    services?: OtherService[];
}) => {
    const id = useId();
    const allDishes = props.allDishes ?? [];
    const dishCategories = props.dishCategories ?? [];
    const allInventory = props.allInventory ?? [];
    const inventoryCategories = props.inventoryCategories ?? [];
    const pavilions = props.pavilions ?? [];
    const eventTypes = props.eventTypes ?? [];
    const discounts = props.discounts ?? [];
    const modeOfPayments = props.modeOfPayments ?? [];
    const allServices = props.services ?? [];
    const servicesCategory = props.servicesCategory ?? [];
    const [isVisible] = useState(true);
    const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]);
    const [selectedInventory, setSelectedInventory] = useState<
        SelectedInventory[]
    >([]);

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

    const [pavilionPrice, setPavilionPrice] = useState<number>(0);
    const [hoursPrice, setHoursPrice] = useState<number>(0);
    const [pavilionOnTotal, setPavilionOnTotal] = useState<string>("");
    const [bookingTotalPrice, setBookingTotalPrice] = useState<number>(0);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
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

    // Track which service categories are enabled (checkbox checked)
    const [enabledServiceCategories, setEnabledServiceCategories] = useState<
        Record<number, boolean>
    >({});

    //(year: number, monthIndex: number, date?: number | undefined, hours?: number | undefined, minutes?: number | undefined, seconds?: number | undefined, ms?: number | undefined)

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

    const handleDiscountChange = (e: number) => {
        setDiscountPercentage(e);
    };

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
                data.serviceIds
            ),
    });

    //Sets dishIcon
    const DishIcon = ({categoryId}: { categoryId: number }) => {
        const categoryID = categoryId || "";

        if (categoryID == 1) {
            return (
                <>
                    <Beef size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        }
        if (categoryID == 2)
            return (
                <>
                    <Ham size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );

        if (categoryID == 3)
            return (
                <>
                    <Drumstick size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 4)
            return (
                <>
                    <Fish size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 5)
            return (
                <>
                    <Carrot size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 6)
            return (
                <>
                    <CookingPot size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 7)
            return (
                <>
                    <IceCream size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 8)
            return (
                <>
                    <GlassWater size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 9)
            return (
                <>
                    <Ellipsis size={16} className="shrink-0 max-md:mt-0.5"/>
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
                    i === idx ? {...d, quantity: d.quantity + 1} : d
                );
            } else {
                // New dish, add with quantity 1
                return [...prev, {...dish, quantity: 1}];
            }
        });
    };

    // Inventory icon mapping (placeholder: copied from DishIcon)
    const InventoryIcon = ({categoryId}: { categoryId: number }) => {
        const categoryID = categoryId || "";

        if (categoryID == 1) {
            return (
                <>
                    <Beef size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        }
        if (categoryID == 2)
            return (
                <>
                    <Ham size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );

        if (categoryID == 3)
            return (
                <>
                    <Drumstick size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 4)
            return (
                <>
                    <Fish size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 5)
            return (
                <>
                    <Carrot size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 6)
            return (
                <>
                    <CookingPot size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 7)
            return (
                <>
                    <IceCream size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 8)
            return (
                <>
                    <GlassWater size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );
        if (categoryID == 9)
            return (
                <>
                    <Ellipsis size={16} className="shrink-0 max-md:mt-0.5"/>
                </>
            );

        return <></>;
    };

    const removeDish = (dishId: number) => {
        setSelectedDishes((prev) =>
            prev
                .map((d) => (d.id === dishId ? {...d, quantity: d.quantity - 1} : d))
                .filter((d) => d.quantity > 0)
        );
    };

    const addInventoryItem = (item: InventoryItem) => {
        setSelectedInventory((prev) => {
            const idx = prev.findIndex((i) => i.id === item.id);
            if (idx !== -1) {
                return prev.map((i, j) =>
                    j === idx ? {...i, quantity: i.quantity + 1} : i
                );
            }
            return [...prev, {...item, quantity: 1}];
        });
    };

    const removeInventoryItem = (itemId: number) => {
        setSelectedInventory((prev) =>
            prev
                .map((i) => (i.id === itemId ? {...i, quantity: i.quantity - 1} : i))
                .filter((i) => i.quantity > 0)
        );
    };

    // removed unused handleSubmitSave

    const handleSubmitDraft = async (e: React.FormEvent<HTMLFormElement>) => {
        console.log("u clicked me");
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const eventName = formData.get("eventName");
        const numberOfPax = formData.get("numPax");
        const eventType = formData.get("eventType");
        const pavilion = formData.get("pavilion");
        const firstName = formData.get("firstName");
        const lastName = formData.get("lastName");
        const phoneNumber = formData.get("phoneNumber");
        const email = formData.get("email");
        const modeOfPayment = formData.get("modeOfPayment");
        const downpayment = formData.get("downpayment");
        const discount = formData.get("discount");
        const discountPercentage = formData.get("discountPercentage");

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

        const serviceIdsFlat = Object.values(mergedServiceIdsByCategory).flat();

        createBookingMutation.mutate({
            eventName: String(eventName ?? ""),
            clientID: clientID,
            pavilionID: String(pavilion ?? ""),
            pax: String(numberOfPax ?? ""),
            eventType: Number(eventType ?? 0),
            notes: "testNote",
            startAt: startAt ?? new Date(),
            endAt: endAt ?? new Date(),
            serviceIds: serviceIdsFlat.length ? serviceIdsFlat : undefined,
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
            downpayment,
            discount,
            discountPercentage,
            startAt,
            endAt,
            selectedServiceIdsByCategory: mergedServiceIdsByCategory,
        });
    };

    const handlePavilionSelect = (e: string) => {
        setPavilionOnTotal(e);
        console.log("PAVILION SELECT" + e);
    };

    const handleHoursPriceChange = (e: number) => {
        setHoursPrice(e);
    };

    const handlePavilionPriceChange = (e: number) => {
        setPavilionPrice(e);
    };
    const handleBookingTotalPriceChange = (e: number) => {
        setBookingTotalPrice(e);
    };

    const getMonthName = (d: Date) =>
        d.toLocaleString("en-US", {month: "long"});

    const finalTimeAndDate =
        startAt && endAt
            ? `${getMonthName(
                startAt
            )} ${startAt.getDate()}, ${startAt.getFullYear()} - ${getMonthName(
                endAt
            )} ${endAt.getDate()}, ${endAt.getFullYear()}`
            : null;

    if (!isVisible) return null;
    return (
        <form action="|" onSubmit={handleSubmitDraft}>
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
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
                        id="date_and_time"
                        className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
                    >
                        <p className="font-bold text-lg">Pavilion</p>
                        <p className="text-sm text-zinc-500 mb-4">
                            Choose which pavilion the client will use for the event.
                        </p>
                        <div className="flex items-center space-x-2"></div>
                        <div className="flex w-full">
                            <RadioGroup
                                className="grid grid-cols-3"
                                name="pavilion"
                                onValueChange={(val) => {
                                    const pav = pavilions.find((p) => String(p.id) === val);
                                    handlePavilionSelect(pav ? pav.name : val);
                                }}
                            >
                                {pavilions.map((pavilion) => (
                                    <div
                                        key={pavilion.id}
                                        className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none"
                                    >
                                        <RadioGroupItem
                                            value={`${pavilion.id}`}
                                            id={`${pavilion.id}`}
                                            className="order-1 after:absolute after:inset-0"
                                        />
                                        <div className="grid grow gap-2">
                                            <Label
                                                htmlFor={`${pavilion.id}`}
                                                className="flex items-center"
                                            >
                                                {`${pavilion.name}`}
                                                <span className="font-normal ml-1 ">
                          {" "}
                                                    <Badge variant={"secondary"} className="mr-1">
                            <Users
                                className="-ms-0.5 opacity-60"
                                size={12}
                                aria-hidden="true"
                            />
                                                        {`${pavilion.maxPax} pax`}
                          </Badge>
                        </span>
                                            </Label>
                                            <div
                                                id={`${id}`}
                                                className="text-muted-foreground text-xs"
                                            >
                                                <p>{`${pavilion.description}`}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                    {/* === DATE AND TIME BLOCK === */}
                    <div
                        id="date_and_time"
                        className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
                    >
                        <p className="font-bold text-lg">Date and Time</p>
                        <p className="text-sm text-zinc-500">
                            Enter the event date, start time, and duration for this
                            reservation.
                        </p>
                        <div className="flex w-full">
                            <div className="w-full">
                                <div className="grid grid-cols-2 gap-4 w-full ">
                                    <div className="mr-4 flex-grow w-full">
                                        <StartDatePickerForm startDateOnChange={setStartDate}/>
                                    </div>
                                    <div className="flex-grow w-full">
                                        <EndDatePickerForm endDateOnChange={setEndDate}/>
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
                        <p className="text-sm text-zinc-500">
                            Enter information about the event
                        </p>
                        <div className="flex">
                            <div className="mt-4 *:not-first:mt-2 flex-1">
                                <Label className="">Event Name</Label>
                                <Input
                                    name="eventName"
                                    placeholder="Chris' Birthday Party"
                                    type="text"
                                />
                            </div>
                            <div className="mt-4 *:not-first:mt-2 flex-1 ml-4">
                                <Label className="">No. of pax</Label>
                                <Input name="numPax" placeholder="200" type="text"/>
                            </div>
                        </div>
                        <div className="mt-4 *:not-first:mt-2">
                            <Label>Event type</Label>

                            <Select name="eventType">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type"/>
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
                    {/* === SELECT PACKAGE BLOCK === */}
                    <div
                        id="package"
                        className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
                    >
                        <p className="font-bold text-lg">Select Package</p>
                        <p className="text-sm text-zinc-500">
                            Choose the package that applies to the client’s reservation.
                        </p>
                        <div className="">
                            <div className="mt-5">
                                <div>
                                    <RadioGroup name="package" className="grid grid-cols-4">
                                        {/* Radio card #1 */}
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                                            <RadioGroupItem
                                                value="1"
                                                id={`${id}-1`}
                                                aria-describedby={`${id}-1-description`}
                                                className="order-1 after:absolute after:inset-0"
                                            />
                                            <div className="grid grow gap-2">
                                                <Label
                                                    htmlFor={`${id}-1`}
                                                    className="flex items-center"
                                                >
                                                    <Crown className="mr-1" size={20}/>
                                                    {"Full Blast"}
                                                    <span
                                                        className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal">
                            (₱65,000)
                          </span>
                                                </Label>
                                                <div
                                                    id={`${id}-1-description`}
                                                    className="text-muted-foreground text-xs"
                                                >
                                                    <ul className="list-disc list-inside space-y-1 mb-2">
                                                        <li>Stage set up & backdrop ceiling design</li>
                                                        <li>
                                                            Tunnel set up for entrance, stage, and backdrop
                                                            design
                                                        </li>
                                                        <li>Centerpiece</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Radio card #2 */}
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                                            <RadioGroupItem
                                                value="2"
                                                id={`${id}-2`}
                                                aria-describedby={`${id}-2-description`}
                                                className="order-1 after:absolute after:inset-0"
                                            />
                                            <div className="grid grow gap-2">
                                                <Label
                                                    htmlFor={`${id}-2`}
                                                    className="flex items-center"
                                                >
                                                    <Box className="mr-1" size={20}/>
                                                    {"Simple"}
                                                    <span
                                                        className=" ml-1 text-muted-foreground text-xs leading-[inherit] font-normal">
                            (₱45,000)
                          </span>
                                                </Label>
                                                <div
                                                    id={`${id}-2-description`}
                                                    className="text-muted-foreground text-xs"
                                                >
                                                    <ul className="list-disc list-inside space-y-1 mb-2">
                                                        <li>Basic designs and set up</li>
                                                        <li>Basic centerpiece</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex w-full items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                                            <RadioGroupItem
                                                value="3"
                                                id={`${id}-3`}
                                                aria-describedby={`${id}-2-description`}
                                                className="order-1 after:absolute after:inset-0"
                                            />
                                            <div className="grid grow gap-2">
                                                <Label
                                                    htmlFor={`${id}-2`}
                                                    className="flex items-center"
                                                >
                                                    <MinusCircle className="mr-1" size={20}/>
                                                    {"Venue Only"}
                                                    <span
                                                        className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal">
                            (₱25,000)
                          </span>
                                                </Label>
                                                <div
                                                    id={`${id}-2-description`}
                                                    className="text-muted-foreground text-xs"
                                                >
                                                    <ul className="list-disc list-inside space-y-1 mb-2">
                                                        <li>Venue Only</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="font-medium mb-2 mt-5">Pavilion Includes:</p>
                                <ul className="list-inside space-y-3 mb-2 text-sm text-black/80">
                                    <li className="flex items-center">
                                        <Check size={20} className="mr-1"/> 2 swimming pools
                                    </li>
                                    <li className="flex items-center">
                                        <Check size={20} className="mr-1"/>
                                        Basic sound (mixer, 2 microphones and speakers) – no
                                        operator
                                    </li>
                                    <li className="flex items-center">
                                        <Check size={20} className="mr-1"/>
                                        Fully air-conditioned
                                    </li>
                                    <li className="flex items-center">
                                        <Check size={20} className="mr-1"/>
                                        Water dispenser
                                    </li>
                                    <li className="flex items-center">
                                        <Check size={20} className="mr-1"/>
                                        Spacious parking lot
                                    </li>
                                </ul>
                            </div>
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
                                        defaultValue="1"
                                        orientation="horizontal"
                                        name="catering"
                                    >
                                        {/* Radio card #1 */}
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none min-h-[100px]">
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
                                                    <Users className="mr-1" size={20}/>
                                                    {"Susing and Rufins Catering"}
                                                    <span
                                                        className="text-muted-foreground text-xs leading-[inherit] font-normal"></span>
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
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
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
                                                    <Truck className="mr-1" size={20}/>
                                                    {"3rd Party Catering"}
                                                    <span
                                                        className=" ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
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
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
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
                                                    <Layers className="mr-1" size={20}/>
                                                    {"Hybrid Service"}
                                                    <span
                                                        className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
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
                                        <div
                                            className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 max-w-2xs items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
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
                                                    <MinusCircle className="mr-1" size={20}/>
                                                    {"None"}
                                                    <span
                                                        className="ml-1 text-muted-foreground text-xs leading-[inherit] font-normal"></span>
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
                                                                <DishIcon categoryId={category.id}/>
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
                    {/* === INVENTORY BLOCK === */}
                    <div
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
                                                                <InventoryIcon categoryId={category.id}/>
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
                    </div>
                    {/* === SELECT SERVICES BLOCK === */}
                    <div
                        id="services"
                        className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
                    >
                        <p className="font-bold text-lg">Services</p>
                        <p className="text-sm text-zinc-500">
                            Pick additional services and add details for the client’s booking.
                        </p>
                        <div className="">
                            <div className="mt-5">
                                <div
                                    className="flex items-center [--primary:var(--color-red-400)] [--ring:var(--color-red-400)] in-[.dark]:[--primary:var(--color-red-400)] in-[.dark]:[--ring:var(--color-red-400)]">
                                    <div className="grid grid-cols-3 gap-12 w-full">
                                        {servicesCategory.map((category) => (
                                            <div key={category.id} className="flex flex-col">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`service-cat-${category.id}`}
                                                        checked={!!enabledServiceCategories[category.id]}
                                                        onCheckedChange={(val) =>
                                                            setEnabledServiceCategories((prev) => ({
                                                                ...prev,
                                                                [category.id]: val === true,
                                                            }))
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`service-cat-${category.id}`}
                                                        className="text-md font-normal"
                                                    >
                                                        {category.name}
                                                    </Label>
                                                </div>
                                                {enabledServiceCategories[category.id] && (
                                                    <div className="-mb-12 mt-1">
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
                                                )}
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
                                            <Label className="font-normal">First name</Label>
                                            <Input name="firstName" placeholder="John" type="text"/>
                                        </div>
                                        <div className="*:not-first:mt-2">
                                            <Label className="font-normal">Last name</Label>
                                            <Input name="lastName" placeholder="Doe" type="text"/>
                                        </div>
                                        <div className="*:not-first:mt-2">
                                            <Label className="font-normal">Phone number</Label>
                                            <Input
                                                name="phoneNumber"
                                                placeholder="09123456789"
                                                type="tel"
                                            />
                                        </div>
                                        <div className="*:not-first:mt-2">
                                            <Label className="font-normal">Email address</Label>
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
                    {/* === NOTES === */}
                    <div
                        id="notes"
                        className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
                    >
                        <p className="font-bold text-lg">Notes</p>
                        <div className="">
                            <div className="mt-5">
                                <div className="*:not-first:mt-2">
                                    <Textarea id={id} placeholder="Leave a comment"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        id="services"
                        className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4"
                    >
                        <p className="font-bold text-lg">Billing</p>
                        <div className="">
                            <div className="mt-5">
                                <div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className="[--ring:var(--color-red-500)] *:not-first:mt-2 in-[.dark]:[--ring:var(--color-red-500)]">
                                            <Label className="font-normal">Mode of payment</Label>
                                            <Select defaultValue="1" name="modeOfPayment">
                                                <SelectTrigger id={id}>
                                                    <SelectValue placeholder="Select mode of paymet"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {modeOfPayments.map((mop) => (
                                                        <SelectItem key={mop.id} value={mop.name}>
                                                            {mop.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div
                                            className="[--ring:var(--color-red-500)] *:not-first:mt-2 in-[.dark]:[--ring:var(--color-red-500)]">
                                            <Label className="font-normal">
                                                Downpayment (non-refundable)
                                            </Label>
                                            <Input
                                                placeholder="Downpayment"
                                                type="text"
                                                name="downpayment"
                                            />
                                        </div>
                                        <div
                                            className="[--ring:var(--color-red-500)] *:not-first:mt-2 in-[.dark]:[--ring:var(--color-red-500)]">
                                            <Label className="font-normal">Discount</Label>
                                            <Select
                                                onValueChange={(val) =>
                                                    handleDiscountChange(Number.parseFloat(val))
                                                }
                                                name="discount"
                                            >
                                                <SelectTrigger id={id}>
                                                    <SelectValue placeholder="Select framework"/>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {discounts.map((dc) => (
                                                        <SelectItem key={dc.id} value={String(dc.percent)}>
                                                            {dc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div
                                            className="[--ring:var(--color-red-500)] *:not-first:mt-2 in-[.dark]:[--ring:var(--color-red-500)]">
                                            <Label className="font-normal">Discount %</Label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="0"
                                                    type="text"
                                                    inputMode="decimal"
                                                    min={0}
                                                    max={100}
                                                    className="pr-10"
                                                    value={discountPercentage}
                                                    name="discountPercentage"
                                                />
                                                <span
                                                    className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                          %
                        </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3"></div>
                                </div>
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
                                <p className="font-medium text-md">Grand Pavilion</p>
                                <Badge variant={"secondary"} className="ml-2">
                                    <Users
                                        className="-ms-0.5 opacity-60"
                                        size={12}
                                        aria-hidden="true"
                                    />
                                    {`200 pax`}
                                </Badge>
                            </div>
                            <div className="border-b mt-3 border-t py-3">
                                <div className="flex items-center justify-between">
                                    <div className="mr-6">
                                        <p className="text-sm font-medium">Tuesday</p>
                                        <p className="text-sm font-medium">Jan 1, 2025</p>
                                        <p className="text-xs font-normal text-black/50">
                                            from 3:00 PM
                                        </p>
                                    </div>

                                    <div className="grow justify-center items-center text-center">
                                        <p className="text-black/50 text-xs">2 days</p>
                                        <div className="border-b border-black/10 my-1"></div>
                                        <p className="text-black/50 text-xs">24 hours</p>
                                    </div>

                                    <div className="ml-6">
                                        <p className="text-sm font-medium">Wednesday</p>
                                        <p className="text-sm font-medium">Dec 2, 2025</p>
                                        <p className="text-xs font-normal text-black/50">
                                            until 3:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center mt-3"></div>
                                <ul className="list-inside space-y-2 mb-2 text-sm mt-1 text-black/50">
                                    <li>
                                        <Check size={16} className="inline mr-1"/>
                                        Stage set up & backdrop ceiling design
                                    </li>
                                    <li>
                                        <Check size={16} className="inline mr-1"/>
                                        Tunnel set up for entrance, stage, and backdrop design
                                    </li>
                                    <li>
                                        <Check size={16} className="inline mr-1"/>
                                        Centerpiece
                                    </li>
                                    <li>
                                        <Check size={16} className="inline mr-1"/>
                                        200 pax
                                    </li>
                                    <li>
                                        <Check size={16} className="inline mr-1"/>
                                        Hybrid catering
                                    </li>
                                    <li>
                                        <Check size={16} className="inline mr-1"/>
                                        Add-ons: Buffet table
                                    </li>
                                </ul>
                            </div>
                            <div className="border-t-1 mt-3 grid grid-cols-4 pt-3">
                                <div className="col-span-3">
                                    <p className="text-md font-medium">Total Price</p>
                                    <p className="text-sm font-normal text-black/50">
                                        1 day(s), 5 hour(s)
                                    </p>
                                </div>
                                <div className="text-end">
                                    <p className="text-sm font-normal line-through">₱ 65,000</p>
                                    <p className="text-md font-medium text-red-500">₱ 65,000</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="w-fit h-fit rounded-sm p-4 bg-white shadow-neutral-200 shadow-2xl mt-4">
                    <div className="flex w-full">
                        <Button
                            className="group bg-red-500 hover:bg-red-600 text-white"
                            type="submit"
                        >
                            Create booking
                            <ArrowRightIcon
                                className="-me-1 opacity-60 transition-transform group-hover:translate-x-0.5"
                                size={16}
                                aria-hidden="true"
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};
export default AddBookingsPageClient;
