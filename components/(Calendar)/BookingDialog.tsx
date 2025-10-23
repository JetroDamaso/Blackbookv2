import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getBillingById,
  getBillingSummary,
  getEventTypeById,
} from "@/server/Billing & Payments/pullActions";
import { getBookingsById } from "@/server/Booking/pullActions";
import { updateBooking } from "@/server/Booking/pushActions";
import { getClientsById } from "@/server/clients/pullActions";
import { updateClient } from "@/server/clients/pushActions";
import { getAllEventTypes } from "@/server/eventtypes/pullActions";
import { getDishesByMenuId, getMenuByBookingId } from "@/server/Menu/pullActions";
import { getPackagesById, getPackagesByPavilion } from "@/server/Packages/pullActions";
import { getAllPavilions, getPavilionsById } from "@/server/Pavilions/Actions/pullActions";
import {
  getAllServices,
  getServicesByBooking,
  getServicesCategory,
} from "@/server/Services/pullActions";
import {
  addServiceToBooking,
  createNewService,
  deleteService,
  removeServiceFromBooking,
  updateService,
} from "@/server/Services/pushActions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Pencil, Plus, SearchIcon, Trash2, X } from "lucide-react";
import React, { useId, useState } from "react";
import { toast } from "sonner";
import RegionComboBoxComponent from "../(Bookings)/(AddBookings)/ComboBox/RegionComboBox";
import { EndDatePickerForm } from "../(Bookings)/(AddBookings)/TimeDatePicker/endDatePicker";
import { StartDatePickerForm } from "../(Bookings)/(AddBookings)/TimeDatePicker/startDatePicker";
import TimeEndPickerCreateBookingComponent from "../(Bookings)/(AddBookings)/TimeDatePicker/timeEndPicker";
import TimeStartPickerCreateBookingComponent from "../(Bookings)/(AddBookings)/TimeDatePicker/timeStartPicker";
import AddPaymentDialog from "../(Payments)/AddPaymentDialog";
import ViewPaymentDialog from "../(Payments)/ViewPaymentDialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group";
import { Textarea } from "../ui/textarea";

// Removed placeholder items; real data queried below

export default function BookingDialogComponent({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: bookingData, isPending: bookingLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => getBookingsById(bookingId),
  });

  const booking = bookingData?.[0];

  const { data: clientData, isPending: clientLoading } = useQuery({
    queryKey: ["client", bookingId],
    queryFn: () => getClientsById(Number(booking?.clientId)),
    enabled: !!booking?.clientId,
  });

  const { data: eventTypeData, isPending: eventTypeLoading } = useQuery({
    queryKey: ["eventType", bookingId],
    queryFn: () => getEventTypeById(Number(booking?.eventType)),
    enabled: !!booking?.eventType,
  });

  const eventType = eventTypeData?.[0];

  const { data: pavilionData, isPending: pavilionLoading } = useQuery({
    queryKey: ["pavilion", bookingId],
    queryFn: () => getPavilionsById(Number(booking?.pavilionId)),
    enabled: !!booking?.pavilionId,
  });

  const pavilion = pavilionData?.[0];

  const { data: packageData, isPending: packageLoading } = useQuery({
    queryKey: ["package", bookingId],
    queryFn: () => getPackagesById(Number(booking?.packageId)),
    enabled: !!booking?.packageId,
  });

  const packages = packageData?.[0];

  // Get basic billing data first
  const { data: billingData } = useQuery({
    queryKey: ["billing", booking?.id],
    queryFn: () => getBillingById(Number(booking?.id)),
    enabled: !!booking?.id,
  });

  const billing = billingData?.[0];

  const { data: billingSummary, isPending: billingLoading } = useQuery({
    queryKey: ["billingSummary", billing?.id],
    queryFn: () => getBillingSummary(Number(billing?.id)),
    enabled: !!billing?.id,
  });

  // (Other services categories not currently used for dishes table)

  // Query menu for this booking (assuming at most one active menu)
  const { data: menuData } = useQuery({
    queryKey: ["menu", booking?.id],
    queryFn: () => getMenuByBookingId(Number(booking?.id)),
    enabled: !!booking?.id,
  });

  const menu = menuData?.[0];

  // Query dishes belonging to the menu
  const { data: menuDishes } = useQuery({
    queryKey: ["menuDishes", menu?.id],
    queryFn: () => getDishesByMenuId(Number(menu?.id)),
    enabled: !!menu?.id,
  });

  interface DishRow {
    id: number;
    name: string;
    categoryName: string;
    quantity: number;
  }

  const dishesJoined: DishRow[] = (menuDishes || []).map(
    (dish: { id: number; name: string; categoryName?: string; quantity: number }) => ({
      id: dish.id,
      name: dish.name,
      categoryName: dish.categoryName ?? "—",
      quantity: dish.quantity ?? 1,
    })
  );

  // Other services & their categories
  const { data: otherServicesData } = useQuery({
    queryKey: ["otherServices", booking?.id],
    queryFn: () => getServicesByBooking(Number(booking?.id)),
    enabled: !!booking?.id,
  });

  const { data: serviceCategoriesData } = useQuery({
    queryKey: ["serviceCategories"],
    queryFn: () => getServicesCategory(),
  });

  interface OtherServiceRow {
    id: number;
    name: string;
    categoryName: string;
  }

  const bookingOtherServices: OtherServiceRow[] = (otherServicesData || []).map(
    (srv: { id: number; name: string; categoryId?: number | null }) => {
      const category = serviceCategoriesData?.find(
        (c: { id: number; name: string }) => c.id === srv.categoryId
      );
      return {
        id: srv.id,
        name: srv.name,
        categoryName: category?.name ?? "—",
      };
    }
  );

  // Status options
  const statusOptions = [
    { value: "1", label: "Pending", color: "text-yellow-600" },
    { value: "2", label: "Confirmed", color: "text-blue-600" },
    { value: "3", label: "In Progress", color: "text-orange-600" },
    { value: "4", label: "Completed", color: "text-green-600" },
    { value: "5", label: "Cancelled", color: "text-red-600" },
  ];

  const getStatusLabel = (statusValue: string | number) => {
    const status = statusOptions.find(s => s.value === statusValue?.toString());
    return status ? status.label : "Unknown";
  };

  const getStatusColor = (statusValue: string | number) => {
    const status = statusOptions.find(s => s.value === statusValue?.toString());
    return status ? status.color : "text-gray-600";
  };

  // Other Services Dialog State
  const [isOtherServicesDialogOpen, setIsOtherServicesDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<OtherServiceRow | null>(null);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCategory, setNewServiceCategory] = useState("");

  // Filter and search state for Other Services
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Reset filters when dialog opens
  const resetFilters = () => {
    setSelectedCategoryFilter("all");
    setSearchQuery("");
  };

  // Reset filters when Other Services dialog opens
  React.useEffect(() => {
    if (isOtherServicesDialogOpen) {
      resetFilters();
    }
  }, [isOtherServicesDialogOpen]);

  // Inline Edit State
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: booking?.status?.toString() || "1",
    eventName: booking?.eventName || "",
    eventType: booking?.eventType?.toString() || "",
    pavilionId: booking?.pavilionId?.toString() || "",
    packageId: booking?.packageId?.toString() || "",
    notes: booking?.notes || "",
    startAt: booking?.startAt || new Date(),
    endAt: booking?.endAt || new Date(),
    totalPax: booking?.totalPax?.toString() || "1",
    firstName: clientData?.firstName || "",
    lastName: clientData?.lastName || "",
    phoneNumber: clientData?.phoneNumber || "",
    region: clientData?.region || "",
    province: clientData?.province || "",
    municipality: clientData?.municipality || "",
    barangay: clientData?.barangay || "",
  });

  // Track changes
  const originalData = React.useMemo(
    () => ({
      status: booking?.status?.toString() || "1",
      eventName: booking?.eventName || "",
      eventType: booking?.eventType?.toString() || "",
      pavilionId: booking?.pavilionId?.toString() || "",
      packageId: booking?.packageId?.toString() || "",
      notes: booking?.notes || "",
      totalPax: booking?.totalPax?.toString() || "1",
      firstName: clientData?.firstName || "",
      lastName: clientData?.lastName || "",
      phoneNumber: clientData?.phoneNumber || "",
      region: clientData?.region || "",
      province: clientData?.province || "",
      municipality: clientData?.municipality || "",
      barangay: clientData?.barangay || "",
    }),
    [booking, clientData]
  );

  // Query all services for the management dialog
  const { data: allServicesData } = useQuery({
    queryKey: ["allServices"],
    queryFn: () => getAllServices(),
    enabled: isOtherServicesDialogOpen,
  });

  // Query all event types for editing
  const { data: allEventTypesData } = useQuery({
    queryKey: ["allEventTypes"],
    queryFn: () => getAllEventTypes(),
    enabled: isEditMode,
  });

  // Query all pavilions for editing
  const { data: allPavilionsData } = useQuery({
    queryKey: ["allPavilions"],
    queryFn: () => getAllPavilions(),
    enabled: isEditMode,
  });

  // Query packages for the selected pavilion
  const { data: pavilionPackagesData } = useQuery({
    queryKey: ["pavilionPackages", editFormData.pavilionId],
    queryFn: () => getPackagesByPavilion(Number(editFormData.pavilionId)),
    enabled: isEditMode && !!editFormData.pavilionId,
  });

  const queryClient = useQueryClient();

  // Filter services based on category and search (moved after data queries)
  const filteredServices =
    allServicesData?.filter(
      (service: {
        id: number;
        name: string;
        categoryId: number | null;
        packageId?: number | null;
        amount?: number | null;
        description?: string | null;
      }) => {
        // Skip services without categoryId
        if (!service.categoryId) return false;

        // Filter by category
        if (
          selectedCategoryFilter !== "all" &&
          service.categoryId.toString() !== selectedCategoryFilter
        ) {
          return false;
        }

        // Filter by search query
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const serviceName = service.name.toLowerCase();
          const category = serviceCategoriesData?.find(
            (c: { id: number; name: string }) => c.id === service.categoryId
          );
          const categoryName = category?.name.toLowerCase() || "";

          return serviceName.includes(query) || categoryName.includes(query);
        }

        return true;
      }
    ) || [];

  // Create new service mutation
  const createServiceMutation = useMutation({
    mutationFn: ({ name, categoryId }: { name: string; categoryId: number }) =>
      createNewService(name, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServices"] });
      queryClient.invalidateQueries({ queryKey: ["otherServices"] });
      setNewServiceName("");
      setNewServiceCategory("");
      toast.success("Service created successfully!");
    },
    onError: () => {
      toast.error("Failed to create service");
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({
      serviceId,
      name,
      categoryId,
    }: {
      serviceId: number;
      name: string;
      categoryId: number;
    }) => updateService(serviceId, name, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServices"] });
      queryClient.invalidateQueries({ queryKey: ["otherServices"] });
      setEditingService(null);
      toast.success("Service updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update service");
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) => deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allServices"] });
      queryClient.invalidateQueries({ queryKey: ["otherServices"] });
      toast.success("Service deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete service");
    },
  });

  // Add service to booking mutation
  const addServiceToBookingMutation = useMutation({
    mutationFn: (serviceId: number) => addServiceToBooking(bookingId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["otherServices", bookingId] });
      toast.success("Service added to booking!");
    },
    onError: () => {
      toast.error("Failed to add service to booking");
    },
  });

  // Remove service from booking mutation
  const removeServiceFromBookingMutation = useMutation({
    mutationFn: (serviceId: number) => removeServiceFromBooking(bookingId, serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["otherServices", bookingId] });
      toast.success("Service removed from booking!");
    },
    onError: () => {
      toast.error("Failed to remove service from booking");
    },
  });

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: (data: any) =>
      updateBooking(
        bookingId,
        data.eventName,
        data.pavilionId,
        data.totalPax,
        parseInt(data.eventType),
        data.notes,
        data.startAt,
        data.endAt,
        parseInt(data.status),
        undefined,
        data.packageId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      queryClient.invalidateQueries({ queryKey: ["package", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["pavilionPackages"] });
      toast.success("Booking updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update booking");
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: (data: any) =>
      updateClient(
        booking?.clientId || 0,
        data.firstName,
        data.lastName,
        data.region,
        data.province,
        data.municipality,
        data.barangay,
        data.phoneNumber
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", bookingId] });
      toast.success("Client information updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update client information");
    },
  });

  const handleCreateService = () => {
    if (newServiceName.trim() && newServiceCategory) {
      createServiceMutation.mutate({
        name: newServiceName.trim(),
        categoryId: parseInt(newServiceCategory),
      });
    }
  };

  // Check for changes in form data
  const checkForChanges = React.useCallback(() => {
    const dataChanged = JSON.stringify(editFormData) !== JSON.stringify(originalData);
    setHasChanges(dataChanged);
  }, [editFormData, originalData]);

  React.useEffect(() => {
    if (isEditMode) {
      checkForChanges();
    }
  }, [editFormData, isEditMode, checkForChanges]);

  // Sync editFormData when booking or client data changes
  React.useEffect(() => {
    if (booking) {
      setEditFormData(prev => ({
        ...prev,
        status: booking.status?.toString() || "1",
        eventName: booking.eventName || "",
        eventType: booking.eventType?.toString() || "",
        pavilionId: booking.pavilionId?.toString() || "",
        packageId: booking.packageId?.toString() || "",
        notes: booking.notes || "",
        startAt: booking.startAt || new Date(),
        endAt: booking.endAt || new Date(),
        totalPax: booking.totalPax?.toString() || "1",
      }));
    }
  }, [booking]);

  React.useEffect(() => {
    if (clientData) {
      setEditFormData(prev => ({
        ...prev,
        firstName: clientData.firstName || "",
        lastName: clientData.lastName || "",
        phoneNumber: clientData.phoneNumber || "",
        region: clientData.region || "",
        province: clientData.province || "",
        municipality: clientData.municipality || "",
        barangay: clientData.barangay || "",
      }));
    }
  }, [clientData]);

  // Reset packageId when pavilionId changes
  const previousPavilionId = React.useRef(editFormData.pavilionId);
  React.useEffect(() => {
    if (
      isEditMode &&
      editFormData.pavilionId &&
      previousPavilionId.current !== editFormData.pavilionId
    ) {
      // Reset package selection when pavilion changes
      setEditFormData(prev => ({ ...prev, packageId: "" }));
    }
    previousPavilionId.current = editFormData.pavilionId;
  }, [editFormData.pavilionId, isEditMode]);

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setHasChanges(false);
    // Reset form data to original values
    setEditFormData({
      status: booking?.status?.toString() || "1",
      eventName: booking?.eventName || "",
      eventType: booking?.eventType?.toString() || "",
      pavilionId: booking?.pavilionId?.toString() || "",
      packageId: booking?.packageId?.toString() || "",
      notes: booking?.notes || "",
      startAt: booking?.startAt || new Date(),
      endAt: booking?.endAt || new Date(),
      totalPax: booking?.totalPax?.toString() || "1",
      firstName: clientData?.firstName || "",
      lastName: clientData?.lastName || "",
      phoneNumber: clientData?.phoneNumber || "",
      region: clientData?.region || "",
      province: clientData?.province || "",
      municipality: clientData?.municipality || "",
      barangay: clientData?.barangay || "",
    });
  };

  const handleSaveChanges = async () => {
    try {
      await handleSaveBookingChanges();
      setIsEditMode(false);
      setHasChanges(false);
    } catch (error) {
      // Error handling is done in handleSaveBookingChanges
    }
  };

  const handleSaveBookingChanges = async () => {
    try {
      // Update booking information
      await updateBookingMutation.mutateAsync(editFormData);

      // Update client information
      await updateClientMutation.mutateAsync(editFormData);

      setIsEditMode(false);
    } catch (error) {
      // Error handling is done in the mutation onError callbacks
    }
  };

  const id = useId();

  const handleClose = () => onOpenChange(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      <div className="fixed inset-0 bg-black/80" onClick={handleClose} />
      <div
        className="relative w-auto min-h-0 max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-[calc(100%-5rem)] max-h-[calc(100%-2rem)] sm:max-h-[calc(100%-3rem)] md:max-h-[calc(100%-5rem)] rounded-xl border bg-neutral-100 p-3 sm:p-4 shadow-lg overflow-auto"
        data-booking-id={String(bookingId)}
      >
        {clientLoading ||
        billingLoading ||
        bookingLoading ||
        packageLoading ||
        eventTypeLoading ||
        pavilionLoading ? (
          <p>loading</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 min-h-[60vh] max-h-[80vh]">
            <div className="flex flex-col border-1 p-4 rounded-md bg-white min-h-0 overflow-y-auto">
              <p className="text-md font-medium mb-2">{`Booking ID: ${bookingId}`}</p>
              <div className="min-w-30 max-w-40">
                <Label className="mr-2 font-normal">Status</Label>
                {isEditMode ? (
                  <Select
                    value={editFormData.status}
                    onValueChange={value => setEditFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[300]">
                      {statusOptions.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          <span className={status.color}>{status.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    className={`mt-2 px-3 py-2 rounded-md border bg-gray-50 ${getStatusColor(booking?.status ?? "1")}`}
                  >
                    <span className="text-sm font-medium">
                      {getStatusLabel(booking?.status ?? "1")}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-md font-medium mt-4">Event Details: </p>
              <div className="flex gap-2 mt-4">
                <StartDatePickerForm
                  initialDate={
                    booking?.startAt
                      ? typeof booking.startAt === "string"
                        ? booking.startAt
                        : (booking.startAt as Date)
                      : null
                  }
                />
                <EndDatePickerForm
                  initialDate={
                    booking?.endAt
                      ? typeof booking.endAt === "string"
                        ? booking.endAt
                        : (booking.endAt as Date)
                      : null
                  }
                />
              </div>
              <div className="mt-4 flex w-full gap-2">
                <div className="flex-1 min-w-0">
                  <TimeStartPickerCreateBookingComponent
                    initialDateTime={
                      booking?.startAt
                        ? typeof booking.startAt === "string"
                          ? booking.startAt
                          : (booking.startAt as Date)
                        : null
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <TimeEndPickerCreateBookingComponent
                    initialDateTime={
                      booking?.endAt
                        ? typeof booking.endAt === "string"
                          ? booking.endAt
                          : (booking.endAt as Date)
                        : null
                    }
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="font-normal">Event Name</Label>
                <Input
                  className="mt-2"
                  placeholder="Event Name"
                  type="text"
                  value={isEditMode ? editFormData.eventName : (booking?.eventName ?? "")}
                  onChange={e => setEditFormData(prev => ({ ...prev, eventName: e.target.value }))}
                  disabled={!isEditMode}
                />
              </div>
              <div className="flex gap-2">
                <div className="mt-4 grow">
                  <Label className="font-normal">Event type</Label>
                  {isEditMode ? (
                    <Select
                      value={editFormData.eventType}
                      onValueChange={value =>
                        setEditFormData(prev => ({ ...prev, eventType: value }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent className="z-[300]">
                        {allEventTypesData?.map((eventType: { id: number; name: string }) => (
                          <SelectItem key={eventType.id} value={eventType.id.toString()}>
                            {eventType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      className="mt-2"
                      placeholder="Event type"
                      type="text"
                      value={eventType?.name ?? ""}
                      disabled
                    />
                  )}
                </div>
                <div className="mt-4 grow">
                  <Label className="font-normal">No. of pax</Label>
                  <Input
                    className="mt-2"
                    placeholder="No. of pax"
                    type="number"
                    min="1"
                    value={isEditMode ? editFormData.totalPax : (booking?.totalPax ?? "")}
                    onChange={e => setEditFormData(prev => ({ ...prev, totalPax: e.target.value }))}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="mt-5">
                <Label className="font-normal">Notes</Label>
                <div className="*:not-first:mt-2">
                  <Textarea
                    name="notes"
                    placeholder="Leave a comment"
                    value={isEditMode ? editFormData.notes : (booking?.notes ?? "")}
                    onChange={e => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col border-1 p-4 rounded-md bg-white min-h-0 overflow-y-auto">
              <p className="text-md font-medium">Pavilion Details: </p>

              <div className="flex w-full gap-2">
                <div className="grow [--ring:var(--color-indigo-300)] in-[.dark]:[--ring:var(--color-indigo-900)]">
                  <Label className="mr-2 font-normal">Pavilion</Label>
                  <div className="">
                    {isEditMode ? (
                      <Select
                        value={editFormData.pavilionId}
                        onValueChange={value =>
                          setEditFormData(prev => ({ ...prev, pavilionId: value }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select pavilion" />
                        </SelectTrigger>
                        <SelectContent className="z-[300]">
                          {allPavilionsData?.map((pavilion: { id: number; name: string }) => (
                            <SelectItem key={pavilion.id} value={pavilion.id.toString()}>
                              {pavilion.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="mt-2"
                        placeholder="pavilion"
                        type="text"
                        value={pavilion?.name ?? ""}
                        disabled
                      />
                    )}
                  </div>
                </div>
                <div className="grow [--ring:var(--color-indigo-300)] in-[.dark]:[--ring:var(--color-indigo-900)]">
                  <div className="flex items-center justify-between">
                    <Label className="mr-2 font-normal mt-2">Package</Label>
                  </div>
                  <div className="">
                    {isEditMode ? (
                      <Select
                        value={editFormData.packageId}
                        onValueChange={value =>
                          setEditFormData(prev => ({ ...prev, packageId: value }))
                        }
                        disabled={
                          !editFormData.pavilionId ||
                          (pavilionPackagesData && pavilionPackagesData.length === 0)
                        }
                      >
                        <SelectTrigger
                          className="mt-2"
                          aria-label={
                            !editFormData.pavilionId
                              ? "Package selection disabled - select a pavilion first"
                              : pavilionPackagesData && pavilionPackagesData.length === 0
                                ? "Package selection disabled - no packages available for this pavilion"
                                : "Select package"
                          }
                        >
                          <SelectValue
                            placeholder={
                              !editFormData.pavilionId
                                ? "Select a pavilion first"
                                : pavilionPackagesData && pavilionPackagesData.length === 0
                                  ? "No packages available"
                                  : "Select package"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="z-[300]">
                          {pavilionPackagesData && pavilionPackagesData.length > 0 ? (
                            pavilionPackagesData.map((pkg: { id: number; name: string }) => (
                              <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                {pkg.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No packages available for this pavilion
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="mt-2"
                        placeholder="package"
                        type="text"
                        value={packages?.name ?? ""}
                        disabled
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-md font-medium">Catering: </p>
                <Input className="mt-2" placeholder="Event Name" type="text" />
              </div>
              <div className="flex gap-2">
                <div className="w-full">
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full -space-y-px"
                    defaultValue="3"
                  >
                    <AccordionItem
                      value="1"
                      className="mt-2 w-full grow bg-background has-focus-visible:border-ring has-focus-visible:ring-ring/50 relative border px-3 outline-none first:rounded-t-md last:rounded-b-md last:border-b has-focus-visible:z-10 has-focus-visible:ring-[3px]"
                    >
                      <AccordionTrigger className="w-full grow py-2 text-[15px] hover:no-underline focus-visible:ring-0">
                        <p className="text-md font-normal">Dishes</p>
                      </AccordionTrigger>
                      <AccordionContent key={"1"} className="pb-2">
                        <div className="max-h-56 overflow-y-auto pr-1">
                          <Table>
                            <TableHeader className="sticky top-0 bg-white shadow-sm">
                              <TableRow className="hover:bg-transparent">
                                <TableHead>Dish</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Quantity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {dishesJoined.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={3} className="">
                                    No dishes/services recorded
                                  </TableCell>
                                </TableRow>
                              )}
                              {dishesJoined.map(dish => (
                                <TableRow key={dish.id}>
                                  <TableCell className="font-medium">{dish.name}</TableCell>
                                  <TableCell>{dish.categoryName}</TableCell>
                                  <TableCell>{dish.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                            <TableFooter className="bg-transparent"></TableFooter>
                          </Table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <p className="text-md font-medium">Other Services: </p>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOtherServicesDialogOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage
                  </Button>

                  {/* Custom Manage Other Services Modal */}
                  {isOtherServicesDialogOpen && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/60 z-[200]"
                        onClick={() => setIsOtherServicesDialogOpen(false)}
                      />
                      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-[1400px] max-h-[90vh] overflow-auto p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h2 className="text-xl font-semibold">Manage Other Services</h2>
                              <p className="text-sm text-muted-foreground">
                                Add, edit, or remove other services for this booking.
                              </p>
                            </div>
                            <Button
                              className="text-foreground hover:text-foreground/70 transition-all"
                              variant="link"
                              onClick={() => setIsOtherServicesDialogOpen(false)}
                            >
                              <X />
                            </Button>
                          </div>

                          {/* 2-Column Layout */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LEFT COLUMN - Current Services & Add New */}
                            <div className="space-y-6">
                              {/* Current Booking Services */}
                              <div>
                                <h3 className="text-lg font-medium mb-3">
                                  Current Services for this Booking
                                </h3>
                                <div className="border rounded-md max-h-[70vh] overflow-y-auto">
                                  <ScrollArea className="h-[200px] w-full flex flex-1 grow">
                                    <Table>
                                      <TableHeader className="sticky top-0 bg-white z-10">
                                        <TableRow>
                                          <TableHead>Service Name</TableHead>
                                          <TableHead>Category</TableHead>
                                          <TableHead className="w-20">Actions</TableHead>
                                        </TableRow>
                                      </TableHeader>

                                      <TableBody>
                                        {bookingOtherServices.length === 0 ? (
                                          <TableRow>
                                            <TableCell
                                              colSpan={3}
                                              className="text-center text-muted-foreground"
                                            >
                                              No services assigned to this booking
                                            </TableCell>
                                          </TableRow>
                                        ) : (
                                          bookingOtherServices.map(service => (
                                            <TableRow key={service.id}>
                                              <TableCell className="font-medium flex-1 grow">
                                                {service.name}
                                              </TableCell>
                                              <TableCell>{service.categoryName}</TableCell>
                                              <TableCell>
                                                <div className="flex gap-2">
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setEditingService(service)}
                                                  >
                                                    <Pencil className="w-3 h-3" />
                                                  </Button>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600"
                                                    onClick={() =>
                                                      removeServiceFromBookingMutation.mutate(
                                                        service.id
                                                      )
                                                    }
                                                    disabled={
                                                      removeServiceFromBookingMutation.isPending
                                                    }
                                                  >
                                                    <Trash2 className="w-3 h-3" />
                                                  </Button>
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
                                        {serviceCategoriesData?.map(
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
                                  <Button
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
                                <span className="text-sm text-muted-foreground">
                                  {filteredServices.length} of {allServicesData?.length || 0}{" "}
                                  services
                                </span>
                              </div>
                              <div className="flex gap-2 mb-2">
                                <Select
                                  value={selectedCategoryFilter}
                                  onValueChange={setSelectedCategoryFilter}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent className="z-[400]">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {serviceCategoriesData?.map(
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
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                  />
                                  <InputGroupAddon>
                                    <SearchIcon />
                                  </InputGroupAddon>
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton onClick={resetFilters}>
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
                                        <TableHead>Service Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead className="w-24">Actions</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {filteredServices.length > 0 ? (
                                        filteredServices.map(
                                          (service: {
                                            id: number;
                                            name: string;
                                            categoryId: number | null;
                                            packageId?: number | null;
                                            amount?: number | null;
                                            description?: string | null;
                                          }) => {
                                            const category = serviceCategoriesData?.find(
                                              (c: { id: number; name: string }) =>
                                                c.id === service.categoryId
                                            );
                                            const isAssigned = bookingOtherServices.some(
                                              bs => bs.id === service.id
                                            );

                                            return (
                                              <TableRow
                                                key={service.id}
                                                className={isAssigned ? "bg-green-50" : ""}
                                              >
                                                <TableCell className="font-medium">
                                                  {service.name}
                                                </TableCell>
                                                <TableCell>{category?.name ?? "—"}</TableCell>
                                                <TableCell>
                                                  <Button
                                                    variant={isAssigned ? "secondary" : "outline"}
                                                    size="sm"
                                                    disabled={
                                                      isAssigned ||
                                                      addServiceToBookingMutation.isPending
                                                    }
                                                    onClick={() =>
                                                      !isAssigned &&
                                                      addServiceToBookingMutation.mutate(service.id)
                                                    }
                                                  >
                                                    {isAssigned ? "Assigned" : "Add"}
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            );
                                          }
                                        )
                                      ) : (
                                        <TableRow>
                                          <TableCell
                                            colSpan={3}
                                            className="text-center py-8 text-muted-foreground"
                                          >
                                            {searchQuery.trim() !== "" ||
                                            selectedCategoryFilter !== "all"
                                              ? `No services found matching your filters. ${searchQuery.trim() !== "" ? `Search: ${searchQuery}` : ""} ${selectedCategoryFilter !== "all" ? `Category: ${serviceCategoriesData?.find(c => c.id.toString() === selectedCategoryFilter)?.name}` : ""}`
                                              : "No services available"}
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

                        {/* Nested Edit Service Modal */}
                        {editingService && (
                          <>
                            <div
                              className="fixed inset-0 bg-black/60 z-[209]"
                              onClick={() => setEditingService(null)}
                            />
                            <div className="fixed inset-0 z-[210] flex items-center justify-center p-4">
                              <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] max-h-[80vh] overflow-auto p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <h3 className="text-lg font-semibold">Edit Service</h3>
                                  <Button
                                    variant="link"
                                    onClick={() => setEditingService(null)}
                                    className="text-foreground hover:text-foreground/80 transition-all"
                                  >
                                    <X />
                                  </Button>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="edit-service-name">Service Name</Label>
                                    <Input
                                      id="edit-service-name"
                                      defaultValue={editingService.name}
                                      placeholder="Enter service name"
                                      onChange={e =>
                                        setEditingService({
                                          ...editingService,
                                          name: e.target.value,
                                        })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-service-category">Category</Label>
                                    <Select
                                      value={
                                        serviceCategoriesData
                                          ?.find((c: any) => c.name === editingService.categoryName)
                                          ?.id.toString() || ""
                                      }
                                      onValueChange={value => {
                                        const category = serviceCategoriesData?.find(
                                          (c: any) => c.id.toString() === value
                                        );
                                        if (category) {
                                          setEditingService({
                                            ...editingService,
                                            categoryName: category.name,
                                          });
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="z-[400]">
                                        {serviceCategoriesData?.map(
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
                                      variant="outline"
                                      onClick={() => setEditingService(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const categoryId = serviceCategoriesData?.find(
                                          (c: any) => c.name === editingService.categoryName
                                        )?.id;
                                        if (categoryId) {
                                          updateServiceMutation.mutate({
                                            serviceId: editingService.id,
                                            name: editingService.name,
                                            categoryId: categoryId,
                                          });
                                        }
                                      }}
                                      disabled={updateServiceMutation.isPending}
                                    >
                                      {updateServiceMutation.isPending
                                        ? "Saving..."
                                        : "Save Changes"}
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
              </div>

              <div className="border-1 rounded-md mt-2 flex-grow min-h-0 overflow-y-auto pr-1">
                <Table>
                  <TableHeader className="sticky top-0 bg-white shadow-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>Service Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingOtherServices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="text-muted-foreground">
                          No other services
                        </TableCell>
                      </TableRow>
                    )}
                    {bookingOtherServices.map(srv => (
                      <TableRow key={srv.id}>
                        <TableCell className="font-medium">{srv.name}</TableCell>
                        <TableCell>{srv.categoryName}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter className="bg-transparent"></TableFooter>
                </Table>
              </div>
            </div>
            <div className="flex flex-col border-1 p-4 rounded-md bg-white">
              <p className="text-md font-medium">Client Info: </p>
              <div className="flex gap-2 mt-4">
                <div className=" grow">
                  <Label className="font-normal">First Name</Label>
                  <Input
                    className="mt-2"
                    placeholder="First Name"
                    type="text"
                    value={isEditMode ? editFormData.firstName : clientData?.firstName || ""}
                    onChange={e =>
                      setEditFormData(prev => ({ ...prev, firstName: e.target.value }))
                    }
                    disabled={!isEditMode}
                  />
                </div>
                <div className="grow">
                  <Label className="font-normal">Last Name</Label>
                  <Input
                    className="mt-2"
                    placeholder="Last Name"
                    type="text"
                    value={isEditMode ? editFormData.lastName : clientData?.lastName || ""}
                    onChange={e => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditMode}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="font-normal">Number</Label>
                <Input
                  className="mt-2"
                  placeholder="Number"
                  type="text"
                  value={isEditMode ? editFormData.phoneNumber : clientData?.phoneNumber || ""}
                  onChange={e =>
                    setEditFormData(prev => ({ ...prev, phoneNumber: e.target.value }))
                  }
                  disabled={!isEditMode}
                />
              </div>
              {isEditMode ? (
                <div className="mt-4 space-y-2">
                  <Label className="font-normal">Address</Label>
                  <RegionComboBoxComponent
                    initialRegion={editFormData.region}
                    initialProvince={editFormData.province}
                    initialMunicipality={editFormData.municipality}
                    initialBarangay={editFormData.barangay}
                    regionOnChange={value => setEditFormData(prev => ({ ...prev, region: value }))}
                    provinceOnChange={value =>
                      setEditFormData(prev => ({ ...prev, province: value }))
                    }
                    municipalityOnChange={value =>
                      setEditFormData(prev => ({ ...prev, municipality: value }))
                    }
                    barangayOnChange={value =>
                      setEditFormData(prev => ({ ...prev, barangay: value }))
                    }
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <Label className="font-normal">Address</Label>
                  <Input
                    className="mt-2"
                    placeholder="Address"
                    type="text"
                    value={`${clientData?.region || ""}, ${clientData?.province || ""}, ${clientData?.municipality || ""}, ${clientData?.barangay || ""}`}
                    disabled
                  />
                </div>
              )}

              <div className="mt-4">
                <div className="grid grid-cols-2 mt-2 divide-x divide-neutral-200">
                  <div className="w-full px-2">
                    <p className="text-md font-medium mb-2">Billing Info: </p>
                    <div className="gap-2 flex flex-col">
                      <div className="w-full grow flex-1">
                        <ViewPaymentDialog
                          billingId={billing?.id || 0}
                          clientId={booking?.clientId || 0}
                        />
                      </div>
                      <div className="w-full grow flex-1">
                        <AddPaymentDialog
                          billingId={billing?.id || 0}
                          clientId={booking?.clientId || 0}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="w-full px-2">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-md font-medium">Totals: </p>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (billingSummary?.balance || 0) === 0
                            ? "bg-green-100 text-green-800"
                            : (billingSummary?.totalPaid || 0) > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {(billingSummary?.balance || 0) === 0
                          ? "Fully Paid"
                          : (billingSummary?.totalPaid || 0) > 0
                            ? "Partially Paid"
                            : "Unpaid"}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <Label className="font-normal">Amount:</Label>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>₱</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            className="text-end"
                            placeholder="0.00"
                            value={
                              billingSummary?.originalPrice?.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || "0.00"
                            }
                            readOnly
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>PHP</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      {billingSummary?.discountType && billingSummary?.discountType !== "none" && (
                        <div className="flex flex-col gap-2">
                          <Label className="font-normal">
                            Discount ({billingSummary?.discountType}):
                          </Label>
                          <InputGroup>
                            <InputGroupAddon>
                              <InputGroupText>₱</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                              className="text-end"
                              placeholder="0.00"
                              value={(
                                (billingSummary?.originalPrice || 0) -
                                (billingSummary?.totalBilling || 0)
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                              readOnly
                            />
                            <InputGroupAddon align="inline-end">
                              <InputGroupText>PHP</InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <Label className="font-normal">Total Paid:</Label>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>₱</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            className="text-end text-green-600"
                            placeholder="0.00"
                            value={
                              billingSummary?.totalPaid?.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || "0.00"
                            }
                            readOnly
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>PHP</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label className="font-normal">Balance Due:</Label>
                        <InputGroup>
                          <InputGroupAddon>
                            <InputGroupText>₱</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            className={`text-end ${(billingSummary?.balance || 0) > 0 ? "text-orange-600" : "text-green-600"}`}
                            placeholder="0.00"
                            value={
                              billingSummary?.balance?.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }) || "0.00"
                            }
                            readOnly
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupText>PHP</InputGroupText>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {isEditMode ? (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={handleEditClick}
            >
              Edit
            </button>
          )}

          <button
            type="button"
            onClick={isEditMode && hasChanges ? handleSaveChanges : handleClose}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            disabled={isEditMode && !hasChanges}
          >
            {isEditMode && hasChanges
              ? updateBookingMutation.isPending || updateClientMutation.isPending
                ? "Saving..."
                : "Save"
              : "Okay"}
          </button>
        </div>
      </div>
    </div>
  );
}

{
  /* <fieldset className="space-y-4">
      <legend className="text-foreground text-sm leading-none font-medium">
        Choose a color
      </legend>
      <RadioGroup className="flex gap-1.5" defaultValue="blue">
        <RadioGroupItem
          value="blue"
          aria-label="Blue"
          className="size-6 border-blue-500 bg-blue-500 shadow-none data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
        />
        <RadioGroupItem
          value="indigo"
          aria-label="Indigo"
          className="size-6 border-indigo-500 bg-indigo-500 shadow-none data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500"
        />
        <RadioGroupItem
          value="pink"
          aria-label="Pink"
          className="size-6 border-pink-500 bg-pink-500 shadow-none data-[state=checked]:border-pink-500 data-[state=checked]:bg-pink-500"
        />
        <RadioGroupItem
          value="red"
          aria-label="red"
          className="size-6 border-red-500 bg-red-500 shadow-none data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500"
        />
        <RadioGroupItem
          value="orange"
          aria-label="orange"
          className="size-6 border-orange-500 bg-orange-500 shadow-none data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
        />
        <RadioGroupItem
          value="amber"
          aria-label="amber"
          className="size-6 border-amber-500 bg-amber-500 shadow-none data-[state=checked]:border-amber-500 data-[state=checked]:bg-amber-500"
        />
        <RadioGroupItem
          value="emerald"
          aria-label="emerald"
          className="size-6 border-emerald-500 bg-emerald-500 shadow-none data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
        />
      </RadioGroup>
    </fieldset> */
}
