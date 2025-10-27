"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Users,
  Truck,
  Layers,
  MinusCircle,
  SearchIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { getAllClients } from "@/server/clients/pullActions";
import { getAllRooms } from "@/server/rooms/pullActions";
import { getAllEventTypes } from "@/server/Booking/pullActions";
import { getAllServices, getServicesCategory } from "@/server/Services/pullActions";
import { getAllDishes, getDishCategories } from "@/server/Dishes/Actions/pullActions";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileUploadSimple } from "@/components/(Manage)/FileUploadSimple";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { toast } from "sonner";
import RegionComboBoxComponent from "@/components/(Bookings)/(AddBookings)/ComboBox/RegionComboBox";

type SelectedDish = {
  id: number;
  name: string;
  categoryId: number | null;
  quantity: number;
};

type SelectedService = {
  id: number;
  name: string;
  categoryName: string;
};

export default function AddMultiDayBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = useId();
  const queryClient = useQueryClient();

  // Get date range and other parameters from URL
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const pavilionIdParam = searchParams.get("pavilionId");
  const schedulesParam = searchParams.get("schedules");

  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedPavilionId, setSelectedPavilionId] = useState<string>(pavilionIdParam || "");
  const [dailySchedules, setDailySchedules] = useState<
    {
      date: Date;
      startTime: string;
      endTime: string;
    }[]
  >([]);

  // Client State
  const [clientSelectionMode, setClientSelectionMode] = useState<"existing" | "new">("existing");
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isSelectClientDialogOpen, setIsSelectClientDialogOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");

  // Event Details State
  const [eventName, setEventName] = useState("");
  const [numPax, setNumPax] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");

  // Catering State
  const [selectedCatering, setSelectedCatering] = useState("1");
  const [cateringPax, setCateringPax] = useState("");
  const [pricePerPax, setPricePerPax] = useState("");
  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>([]);
  const [isDishesDialogOpen, setIsDishesDialogOpen] = useState(false);
  const [dishSearchQuery, setDishSearchQuery] = useState("");

  // 3rd Party Services State
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isServicesDialogOpen, setIsServicesDialogOpen] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");

  // Fees State
  const [customFees, setCustomFees] = useState<
    {
      name: string;
      amount: string;
      note: string;
    }[]
  >([]);

  // Room State
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  // Notes State
  const [notes, setNotes] = useState("");

  // Document State
  const [selectedBookingFiles, setSelectedBookingFiles] = useState<File[]>([]);
  const [bookingFileResetTrigger, setBookingFileResetTrigger] = useState(0);

  // Fetch data
  const { data: pavilions = [] } = useQuery({
    queryKey: ["pavilions"],
    queryFn: () => getAllPavilions(),
  });

  const { data: allClients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => getAllClients(),
  });

  const { data: allRooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: () => getAllRooms(),
  });

  const { data: eventTypes = [] } = useQuery({
    queryKey: ["eventTypes"],
    queryFn: () => getAllEventTypes(),
  });

  const { data: allDishes = [] } = useQuery({
    queryKey: ["dishes"],
    queryFn: () => getAllDishes(),
  });

  const { data: dishCategories = [] } = useQuery({
    queryKey: ["dishCategories"],
    queryFn: () => getDishCategories(),
  });

  const { data: allServices = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => getAllServices(),
  });

  const { data: serviceCategories = [] } = useQuery({
    queryKey: ["serviceCategories"],
    queryFn: () => getServicesCategory(),
  });

  // Auto-sync Event Pax to Catering Pax
  useEffect(() => {
    if (numPax) {
      setCateringPax(numPax);
    }
  }, [numPax]);

  useEffect(() => {
    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      const end = new Date(endDateParam);
      setDateRange({ start, end });

      // Check if we have schedules from the CheckSchedule dialog
      if (schedulesParam) {
        try {
          const parsedSchedules = JSON.parse(schedulesParam);
          const schedules = parsedSchedules.map((s: any) => ({
            date: new Date(s.date),
            startTime: s.startTime,
            endTime: s.endTime,
          }));
          setDailySchedules(schedules);
        } catch (error) {
          console.error("Error parsing schedules:", error);
          // Fallback to generating default schedules
          generateDefaultSchedules(start, end);
        }
      } else {
        // No schedules provided, generate default
        generateDefaultSchedules(start, end);
      }
    }
  }, [startDateParam, endDateParam, schedulesParam]);

  const generateDefaultSchedules = (start: Date, end: Date) => {
    const schedules = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      schedules.push({
        date: new Date(currentDate),
        startTime: "09:00",
        endTime: "17:00",
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDailySchedules(schedules);
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...dailySchedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setDailySchedules(newSchedules);
  };

  const handleRoomToggle = (roomId: number) => {
    setSelectedRooms(prev =>
      prev.includes(roomId) ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );
  };

  const handleAddDish = (dishId: number) => {
    const dish = allDishes.find(d => d.id === dishId);
    if (dish && !selectedDishes.find(d => d.id === dishId)) {
      setSelectedDishes(prev => [
        ...prev,
        {
          id: dish.id,
          name: dish.name,
          categoryId: dish.categoryId,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveDish = (dishId: number) => {
    setSelectedDishes(prev => prev.filter(d => d.id !== dishId));
  };

  const handleDishQuantityChange = (dishId: number, quantity: number) => {
    setSelectedDishes(prev =>
      prev.map(d => (d.id === dishId ? { ...d, quantity: Math.max(1, quantity) } : d))
    );
  };

  const handleAddService = (serviceId: number) => {
    const service = allServices.find(s => s.id === serviceId);
    if (service && !selectedServices.find(s => s.id === serviceId)) {
      const category = serviceCategories.find(c => c.id === service.categoryId);
      setSelectedServices(prev => [
        ...prev,
        {
          id: service.id,
          name: service.name,
          categoryName: category?.name || "Uncategorized",
        },
      ]);
    }
  };

  const handleRemoveService = (serviceId: number) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleAddFee = () => {
    setCustomFees([...customFees, { name: "", amount: "", note: "" }]);
  };

  const handleRemoveFee = (index: number) => {
    setCustomFees(customFees.filter((_, i) => i !== index));
  };

  const handleFeeChange = (index: number, field: string, value: string) => {
    const newFees = [...customFees];
    newFees[index] = { ...newFees[index], [field]: value };
    setCustomFees(newFees);
  };

  const calculateFeesTotal = () => {
    return customFees.reduce((sum, fee) => {
      const amount = parseFloat(fee.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement booking creation logic
    toast.success("Multi-day booking created successfully!");
    router.push("/calendar");
  };

  if (!dateRange) {
    return (
      <div className="container mx-auto p-8">
        <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl">
          <h2 className="text-2xl font-bold">Invalid Date Range</h2>
          <p className="text-muted-foreground mt-2">
            Please select a date range from the calendar to create a multi-day booking.
          </p>
          <Button onClick={() => router.push("/calendar")} className="mt-4">
            Go to Calendar
          </Button>
        </div>
      </div>
    );
  }

  const selectedPavilion = pavilions.find(p => p.id === parseInt(selectedPavilionId));

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-6 mt-10">
        {/* === LEFT COLUMN (FORM FIELDS) === */}
        <div className="flex-1 ml-8">
          {/* === CLIENT BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">Client Information</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={clientSelectionMode === "existing" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClientSelectionMode("existing")}
                >
                  Existing Client
                </Button>
                <Button
                  type="button"
                  variant={clientSelectionMode === "new" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setClientSelectionMode("new")}
                >
                  New Client
                </Button>
              </div>
            </div>

            <div>
              <div className="w-full">
                <div className="w-full flex flex-col">
                  {clientSelectionMode === "existing" ? (
                    <div>
                      <Dialog
                        open={isSelectClientDialogOpen}
                        onOpenChange={setIsSelectClientDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button type="button" variant="outline" className="w-full">
                            {selectedClientId
                              ? (() => {
                                  const client = allClients.find(c => c.id === selectedClientId);
                                  return client
                                    ? `${client.firstName} ${client.lastName} - ${client.phoneNumber}`
                                    : "Select Client";
                                })()
                              : "Select Client"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>Select Client</DialogTitle>
                            <DialogDescription asChild>
                              <div>
                                <div className="relative mb-4">
                                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                  <Input
                                    placeholder="Search by name, phone, or address..."
                                    value={clientSearchQuery}
                                    onChange={e => setClientSearchQuery(e.target.value)}
                                    className="pl-10"
                                  />
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                  <RadioGroup
                                    value={selectedClientId?.toString() || ""}
                                    onValueChange={value => {
                                      setSelectedClientId(parseInt(value));
                                      setIsSelectClientDialogOpen(false);
                                    }}
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
                                            <div className="text-muted-foreground text-xs">
                                              {[
                                                client.region,
                                                client.province,
                                                client.municipality,
                                                client.barangay,
                                              ]
                                                .filter(Boolean)
                                                .join(", ") || "No address"}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                  </RadioGroup>
                                </div>
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>

                      {!selectedClientId && (
                        <p className="text-red-500 text-sm mt-2">
                          Please select a client to proceed
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">First name</Label>
                          <Input name="firstName" placeholder="John" type="text" required />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Last name</Label>
                          <Input name="lastName" placeholder="Doe" type="text" required />
                        </div>
                        <div className="*:not-first:mt-2">
                          <Label className="font-normal text-foreground/50">Phone number</Label>
                          <Input name="phoneNumber" placeholder="09123456789" type="tel" required />
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
                </div>
              </div>
            </div>
          </div>

          {/* === DAILY SCHEDULES BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <p className="font-bold text-lg">Daily Schedules</p>
            <p className="text-sm text-muted-foreground mb-4">
              Set the start and end time for each day of the event
            </p>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {dailySchedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-muted/30"
                  >
                    <div>
                      <Label>Date</Label>
                      <div className="flex items-center h-10 px-3 border rounded-md bg-background">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="text-sm">{format(schedule.date, "EEE, MMM d, yyyy")}</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`start-time-${index}`}>Start Time</Label>
                      <Input
                        id={`start-time-${index}`}
                        type="time"
                        value={schedule.startTime}
                        onChange={e => handleScheduleChange(index, "startTime", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-time-${index}`}>End Time</Label>
                      <Input
                        id={`end-time-${index}`}
                        type="time"
                        value={schedule.endTime}
                        onChange={e => handleScheduleChange(index, "endTime", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* === EVENT DETAILS BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <p className="font-bold text-lg">Event Details</p>
            <div className="flex gap-4">
              <div className="mt-2 *:not-first:mt-2 flex-1">
                <Label className="text-foreground/50 font-normal">Event Name</Label>
                <Input
                  name="eventName"
                  placeholder="Multi-Day Conference"
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  required
                />
              </div>
              <div className="mt-2 *:not-first:mt-2 flex-1">
                <Label className="text-foreground/50 font-normal">No. of pax</Label>
                <Input
                  name="numPax"
                  placeholder="200"
                  type="number"
                  value={numPax}
                  onChange={e => setNumPax(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mt-4 *:not-first:mt-2">
              <Label className="text-foreground/50 font-normal">Event type</Label>
              <Select
                name="eventType"
                value={selectedEventType}
                onValueChange={setSelectedEventType}
              >
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
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <p className="font-bold text-lg mb-4">Catering</p>
            <RadioGroup
              className="grid grid-cols-4 gap-4"
              value={selectedCatering}
              orientation="horizontal"
              name="catering"
              onValueChange={setSelectedCatering}
            >
              {/* In-house Catering */}
              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 items-start gap-2 rounded-md border p-4 shadow-xs outline-none min-h-[100px]">
                <RadioGroupItem
                  value="1"
                  id={`${id}-catering-1`}
                  className="order-1 after:absolute after:inset-0"
                />
                <div className="flex flex-col grow gap-2 justify-start items-baseline">
                  <Label htmlFor={`${id}-catering-1`} className="flex items-center">
                    <Users className="mr-1" size={20} />
                    Susing and Rufins
                  </Label>
                  <div className="text-muted-foreground text-xs">
                    <ul className="list-disc list-inside space-y-1">
                      <li>In-house catering</li>
                      <li>Menu & staff included</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3rd Party */}
              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <RadioGroupItem
                  value="2"
                  id={`${id}-catering-2`}
                  className="order-1 after:absolute after:inset-0"
                />
                <div className="flex flex-col grow gap-2 justify-start items-baseline">
                  <Label htmlFor={`${id}-catering-2`} className="flex items-center">
                    <Truck className="mr-1" size={20} />
                    3rd Party
                  </Label>
                  <div className="text-muted-foreground text-xs">
                    <ul className="list-disc list-inside space-y-1">
                      <li>External caterer</li>
                      <li>Client provides all</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Hybrid */}
              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <RadioGroupItem
                  value="3"
                  id={`${id}-catering-3`}
                  className="order-1 after:absolute after:inset-0"
                />
                <div className="flex flex-col grow gap-2">
                  <Label htmlFor={`${id}-catering-3`} className="flex items-center">
                    <Layers className="mr-1" size={20} />
                    Hybrid
                  </Label>
                  <div className="text-muted-foreground text-xs">
                    <ul className="list-disc list-inside space-y-1">
                      <li>External food</li>
                      <li>S&R staff serve</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* None */}
              <div className="border-input has-data-[state=checked]:border-primary/50 relative flex flex-col flex-1 items-start gap-2 rounded-md border p-4 shadow-xs outline-none">
                <RadioGroupItem
                  value="4"
                  id={`${id}-catering-4`}
                  className="order-1 after:absolute after:inset-0"
                />
                <div className="flex flex-col grow gap-2">
                  <Label htmlFor={`${id}-catering-4`} className="flex items-center">
                    <MinusCircle className="mr-1" size={20} />
                    None
                  </Label>
                  <div className="text-muted-foreground text-xs">
                    <ul className="list-disc list-inside space-y-1">
                      <li>No catering</li>
                      <li>Venue only</li>
                    </ul>
                  </div>
                </div>
              </div>
            </RadioGroup>

            {selectedCatering === "1" && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground/50">Pax</Label>
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
                  <Label className="text-sm text-foreground/50">Price per pax</Label>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="200"
                      value={pricePerPax}
                      onChange={e => setPricePerPax(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                    />
                    <InputGroupAddon>₱</InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            )}
          </div>

          {/* === DISHES BLOCK === */}
          {selectedCatering === "1" && (
            <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-lg">Dishes</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDishesDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Dishes
                </Button>
              </div>
              {selectedDishes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No dishes selected. Click "Add Dishes" to select menu items.
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dish Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="w-32">Quantity</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDishes.map(dish => {
                        const category = dishCategories.find(c => c.id === dish.categoryId);
                        return (
                          <TableRow key={dish.id}>
                            <TableCell className="font-medium">{dish.name}</TableCell>
                            <TableCell>{category?.name || "N/A"}</TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={dish.quantity}
                                onChange={e =>
                                  handleDishQuantityChange(dish.id, parseInt(e.target.value))
                                }
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveDish(dish.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Dishes Selection Dialog */}
              {isDishesDialogOpen && (
                <>
                  <div
                    className="fixed inset-0 bg-black/60 z-[200]"
                    onClick={() => setIsDishesDialogOpen(false)}
                  />
                  <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold">Add Dishes</h2>
                          <p className="text-sm text-muted-foreground">
                            Select dishes to add to the menu
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsDishesDialogOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <Input
                          placeholder="Search dishes..."
                          value={dishSearchQuery}
                          onChange={e => setDishSearchQuery(e.target.value)}
                        />
                      </div>

                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2 pr-4">
                          {allDishes
                            .filter(dish =>
                              dish.name.toLowerCase().includes(dishSearchQuery.toLowerCase())
                            )
                            .map(dish => {
                              const category = dishCategories.find(c => c.id === dish.categoryId);
                              const isSelected = selectedDishes.some(d => d.id === dish.id);
                              return (
                                <div
                                  key={dish.id}
                                  className={cn(
                                    "p-3 border rounded-lg cursor-pointer transition-all",
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-input hover:border-primary/50"
                                  )}
                                  onClick={() =>
                                    isSelected ? handleRemoveDish(dish.id) : handleAddDish(dish.id)
                                  }
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{dish.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {category?.name || "N/A"}
                                      </p>
                                    </div>
                                    {isSelected && <Badge>Selected</Badge>}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </ScrollArea>

                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDishesDialogOpen(false)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === 3RD PARTY SERVICES BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-lg">3rd Party Services</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsServicesDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Manage Services
              </Button>
            </div>
            {selectedServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No services selected. Click "Manage Services" to add external services.
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedServices.map(service => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>{service.categoryName}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Services Selection Dialog */}
            {isServicesDialogOpen && (
              <>
                <div
                  className="fixed inset-0 bg-black/60 z-[200]"
                  onClick={() => setIsServicesDialogOpen(false)}
                />
                <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold">Manage Services</h2>
                        <p className="text-sm text-muted-foreground">
                          Select 3rd party services for the event
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsServicesDialogOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <Input
                        placeholder="Search services..."
                        value={serviceSearchQuery}
                        onChange={e => setServiceSearchQuery(e.target.value)}
                      />
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2 pr-4">
                        {allServices
                          .filter(service =>
                            service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                          )
                          .map(service => {
                            const category = serviceCategories.find(
                              c => c.id === service.categoryId
                            );
                            const isSelected = selectedServices.some(s => s.id === service.id);
                            return (
                              <div
                                key={service.id}
                                className={cn(
                                  "p-3 border rounded-lg cursor-pointer transition-all",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-input hover:border-primary/50"
                                )}
                                onClick={() =>
                                  isSelected
                                    ? handleRemoveService(service.id)
                                    : handleAddService(service.id)
                                }
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {category?.name || "N/A"}
                                    </p>
                                  </div>
                                  {isSelected && <Badge>Selected</Badge>}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>

                    <div className="flex justify-end gap-2 mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsServicesDialogOpen(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* === ROOMS BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <p className="font-bold text-lg mb-4">Rooms</p>
            <div className="grid grid-cols-3 gap-3">
              {allRooms.map(room => {
                const isSelected = selectedRooms.includes(room.id);
                return (
                  <div
                    key={room.id}
                    onClick={() => handleRoomToggle(room.id)}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{room.name}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          Capacity: {room.capacity}
                        </div>
                      </div>
                      {isSelected && <Badge>Selected</Badge>}
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

          {/* === FEES BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-lg">Additional Fees</p>
                <p className="text-sm text-muted-foreground">
                  Add fees to be billed for this booking
                </p>
              </div>
              <Button type="button" onClick={handleAddFee} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Fee
              </Button>
            </div>

            {customFees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No fees added yet. Click "Add Fee" to start adding fees.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {customFees.map((fee, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg"
                    >
                      <div className="col-span-4">
                        <Label htmlFor={`fee-name-${index}`}>Fee Name</Label>
                        <Input
                          id={`fee-name-${index}`}
                          placeholder="e.g., Venue Rental - Day 1"
                          value={fee.name}
                          onChange={e => handleFeeChange(index, "name", e.target.value)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`fee-amount-${index}`}>Amount</Label>
                        <InputGroup>
                          <InputGroupInput
                            id={`fee-amount-${index}`}
                            type="number"
                            placeholder="0.00"
                            value={fee.amount}
                            onChange={e => handleFeeChange(index, "amount", e.target.value)}
                            step="0.01"
                            min="0"
                          />
                          <InputGroupAddon>₱</InputGroupAddon>
                        </InputGroup>
                      </div>
                      <div className="col-span-5">
                        <Label htmlFor={`fee-note-${index}`}>Note (Optional)</Label>
                        <Input
                          id={`fee-note-${index}`}
                          placeholder="Additional notes"
                          value={fee.note}
                          onChange={e => handleFeeChange(index, "note", e.target.value)}
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFee(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-4 border-t mt-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-2xl font-bold">
                      ₱
                      {calculateFeesTotal().toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* === DOCUMENTS BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
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

          {/* === NOTES BLOCK === */}
          <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl mt-4">
            <p className="font-bold text-lg mb-4">Notes</p>
            <Textarea
              name="notes"
              placeholder="Add any additional notes or special requirements for this multi-day booking..."
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6 mb-8">
            <Button type="button" variant="outline" onClick={() => router.push("/calendar")}>
              Cancel
            </Button>
            <Button type="submit">Create Multi-Day Booking</Button>
          </div>
        </div>

        {/* === RIGHT COLUMN (SUMMARY) === */}
        <div className="w-[400px] mr-8">
          <div className="sticky top-4">
            <div className="w-full h-fit rounded-sm p-5 bg-white shadow-neutral-200 shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-medium text-lg">
                    {selectedPavilion ? selectedPavilion.name : "Multi-Day Booking"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {format(dateRange.start, "MMM d, yyyy")} -{" "}
                      {format(dateRange.end, "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {dailySchedules.length} {dailySchedules.length === 1 ? "day" : "days"}
                    </p>
                  </div>

                  {eventName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Event</p>
                      <p className="font-medium">{eventName}</p>
                    </div>
                  )}

                  {numPax && (
                    <div>
                      <p className="text-sm text-muted-foreground">Number of Guests</p>
                      <p className="font-medium">{numPax} pax</p>
                    </div>
                  )}

                  {selectedCatering === "1" && cateringPax && pricePerPax && (
                    <div>
                      <p className="text-sm text-muted-foreground">Catering</p>
                      <p className="font-medium">
                        {cateringPax} pax × ₱{pricePerPax} = ₱
                        {(parseFloat(cateringPax) * parseFloat(pricePerPax)).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedRooms.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Selected Rooms</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedRooms.map(roomId => {
                          const room = allRooms.find(r => r.id === roomId);
                          return (
                            <Badge key={roomId} variant="secondary">
                              {room?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {customFees.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">Additional Fees</p>
                      <p className="font-medium">₱{calculateFeesTotal().toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    Complete all required fields to create the booking
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
