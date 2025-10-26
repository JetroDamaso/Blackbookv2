import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Castle, ForkKnife, User, Package, DollarSign, Wrench } from "lucide-react";

interface PrintBookingProps {
  bookingId?: number;
  booking?: any;
  client?: any;
  pavilion?: any;
  package?: any;
  eventType?: any;
  billingSummary?: any;
  menuDishes?: any[];
  bookingInventory?: any[];
  bookingServices?: any[];
  payments?: any[];
}

const PrintBooking = ({
  bookingId,
  booking,
  client,
  pavilion,
  package: pkg,
  eventType,
  billingSummary,
  menuDishes = [],
  bookingInventory = [],
  bookingServices = [],
  payments = [],
}: PrintBookingProps) => {
  // Format date helper
  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: any) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `₱${
      amount?.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"
    }`;
  };

  // Get status label
  const getStatusLabel = (status: number) => {
    const labels: Record<number, string> = {
      1: "Pending",
      2: "Confirmed",
      3: "In Progress",
      4: "Completed",
      5: "Unpaid",
      6: "Canceled",
      7: "Archived",
      8: "Draft",
    };
    return labels[status] || "Unknown";
  };

  return (
    <div className="w-full bg-white text-black font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }

            body {
              margin: 0;
              padding: 0;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-container {
              width: 100%;
              max-width: none;
              margin: 0;
              padding: 0;
            }

            .print-section {
              page-break-inside: avoid;
            }

            .print-section-large {
              page-break-inside: auto;
            }

            table {
              page-break-inside: auto;
              width: 100%;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            thead {
              display: table-header-group;
            }

            .no-print {
              display: none;
            }
          }

          @media screen {
            .print-container {
              max-width: 210mm;
              margin: 0 auto;
              padding: 0.5in;
              min-height: 297mm;
            }
          }
        `,
        }}
      />

      <div className="print-container bg-white">
        {/* Header */}
        <div className="text-center mb-3 print-section">
          <div className="flex gap-3 w-full items-center justify-center mb-2">
            <Image src={"/susings_and_rufins_logo.png"} alt="Logo" height={32} width={45} />
            <h1 className="font-bold text-xl">Susings & Rufins Farm</h1>
          </div>
          <p className="text-xs text-gray-600">Booking ID: #{bookingId || "N/A"}</p>
          <div className="w-full h-px bg-gray-300 my-2"></div>
        </div>

        {/* Event Details Block - Keep together */}
        <div className="mb-2 print-section">
          <p className="font-bold text-base flex gap-2 items-center text-foreground mb-1">
            {booking?.eventName || "Untitled Event"}
            <Badge className="flex gap-1 items-center text-[10px] px-1.5 py-0.5">
              <Castle size={14} /> {pavilion?.name || "N/A"}
            </Badge>
          </p>

          <p className="font-medium text-xs mb-0.5">
            Event Type: <span className="font-normal ml-2">{eventType?.name || "N/A"}</span>
          </p>

          <p className="font-medium text-xs mb-0.5">
            Date & Time: <span className="font-normal">{formatDate(booking?.startAt)}</span>
            <span className="border-l-2 border-foreground pl-2 ml-2 font-normal">
              {formatTime(booking?.startAt)} - {formatTime(booking?.endAt)}
            </span>
          </p>

          <p className="font-medium text-xs mb-0.5">
            Total pax: <span className="font-normal ml-2">{booking?.totalPax || "N/A"}</span>
          </p>

          <p className="font-medium text-xs mb-2">
            Status: <span className="font-normal ml-2">{getStatusLabel(booking?.status || 8)}</span>
          </p>
        </div>

        {/* Client Information Block - Keep together */}
        <div className="w-full border-t pt-2 pb-2 mt-2 border-foreground print-section">
          <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
            <User size={14} /> Client:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium text-xs mb-0.5">
                Full Name:{" "}
                <span className="font-normal ml-2">
                  {client?.firstName || ""} {client?.lastName || "N/A"}
                </span>
              </p>
              <p className="font-medium text-xs mb-0.5">
                Address:{" "}
                <span className="font-normal ml-2">
                  {[client?.barangay, client?.municipality, client?.province, client?.region]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </span>
              </p>
            </div>
            <p className="font-medium text-xs">
              Contact Number:{" "}
              <span className="font-normal ml-2">{client?.phoneNumber || "N/A"}</span>
            </p>
          </div>
        </div>

        {/* Package Information Block - Keep together */}
        <div className="w-full border-t pt-2 pb-2 mt-2 border-foreground print-section">
          <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
            <ForkKnife size={14} /> Package:
          </p>

          <div className="grid grid-cols-2 mb-2">
            <p className="font-medium text-xs">
              Package Name: <span className="font-normal ml-2">{pkg?.name || "N/A"}</span>
            </p>
            <p className="font-medium text-xs">
              Price per pax:{" "}
              <span className="font-normal ml-2">
                {pkg?.price ? formatCurrency(pkg.price) : "N/A"}
              </span>
            </p>
          </div>
        </div>

        {/* Menu Dishes Block */}
        {menuDishes && menuDishes.length > 0 && (
          <div className="mb-2 print-section-large">
            <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
              <ForkKnife size={14} /> Menu:
            </p>
            <table className="w-full text-xs">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-0.5">Dish</th>
                  <th className="text-left py-0.5">Category</th>
                </tr>
              </thead>
              <tbody>
                {menuDishes.map((dish: any, idx: number) => {
                  const dishName = dish.name || "N/A";
                  const quantity = dish.quantity || 1;
                  const displayName = quantity > 1 ? `${dishName} x${quantity}` : dishName;

                  return (
                    <tr key={idx} className="border-b">
                      <td className="py-0.5">{displayName}</td>
                      <td className="py-0.5">{dish.categoryName || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Inventory Block */}
        {bookingInventory && bookingInventory.length > 0 && (
          <div className="mb-2 print-section-large">
            <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
              <Package size={14} /> Inventory:
            </p>
            <table className="w-full text-xs">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-0.5">Item</th>
                  <th className="text-right py-0.5">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {bookingInventory.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-0.5">{item.inventory?.name || "N/A"}</td>
                    <td className="py-0.5 text-right">{item.quantity || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Services Block */}
        {bookingServices && bookingServices.length > 0 && (
          <div className="mb-2 print-section-large">
            <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
              <Wrench size={14} /> Other Services:
            </p>
            <table className="w-full text-xs">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-0.5">Service</th>
                  <th className="text-left py-0.5">Category</th>
                </tr>
              </thead>
              <tbody>
                {bookingServices.map((service: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-0.5">{service.name || "N/A"}</td>
                    <td className="py-0.5">{service.categoryName || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Billing Summary Block - Keep together */}
        <div className="w-full border-t pt-2 mt-2 border-foreground print-section">
          <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
            <DollarSign size={14} /> Billing:
          </p>

          <div className="grid grid-cols-2 gap-y-0.5 text-xs mb-2">
            <p className="font-medium">
              Amount:{" "}
              <span className="font-normal ml-2">
                {formatCurrency(billingSummary?.originalPrice || 0)}
              </span>
            </p>
            {billingSummary?.discountType && billingSummary?.discountType !== "none" && (
              <>
                <p className="font-medium">
                  Discount Type:{" "}
                  <span className="font-normal ml-2">{billingSummary.discountType}</span>
                </p>
                <p className="font-medium">
                  Discount Amount:{" "}
                  <span className="font-normal ml-2">
                    {formatCurrency(
                      (billingSummary?.originalPrice || 0) - (billingSummary?.totalBilling || 0)
                    )}
                  </span>
                </p>
              </>
            )}
            <p className="font-medium">
              Total Amount:{" "}
              <span className="font-normal ml-2">
                {formatCurrency(billingSummary?.totalBilling || 0)}
              </span>
            </p>
            <p className="font-medium">
              Total Paid:{" "}
              <span className="font-normal ml-2 text-green-700">
                {formatCurrency(billingSummary?.totalPaid || 0)}
              </span>
            </p>
            <p className="font-medium">
              Balance Due:{" "}
              <span
                className={`font-normal ml-2 ${(billingSummary?.balance || 0) > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatCurrency(billingSummary?.balance || 0)}
              </span>
            </p>
          </div>
        </div>

        {/* Payments Block */}
        {payments && payments.length > 0 && (
          <div className="w-full border-t pt-2 mt-2 border-foreground print-section-large">
            <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
              <DollarSign size={14} /> Payments:
            </p>
            <table className="w-full text-xs mb-2">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-0.5">Date</th>
                  <th className="text-left py-0.5">Method</th>
                  <th className="text-left py-0.5">OR Number</th>
                  <th className="text-left py-0.5">Notes</th>
                  <th className="text-right py-0.5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any, idx: number) => (
                  <tr key={idx} className="border-b">
                    <td className="py-0.5">{formatDate(payment.date)}</td>
                    <td className="py-0.5">{payment.billing?.modeOfPayment || "N/A"}</td>
                    <td className="py-0.5">{payment.orNumber || "—"}</td>
                    <td className="py-0.5">{payment.notes || "—"}</td>
                    <td className="py-0.5 text-right">{formatCurrency(payment.amount || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No Payments Message */}
        {(!payments || payments.length === 0) && (
          <div className="w-full border-t pt-2 mt-2 border-foreground">
            <p className="font-medium mb-1.5 gap-2 flex items-center text-xs">
              <DollarSign size={14} /> Payments:
            </p>
            <p className="text-xs text-muted-foreground italic">No payments available</p>
          </div>
        )}

        {/* Notes Block */}
        <div className="w-full pt-2 mt-2 border-t">
          <p className="font-medium text-xs mb-1">Notes:</p>
          {booking?.notes && <p className="text-xs whitespace-pre-wrap">{booking.notes}</p>}
        </div>

        {/* Client Signature Block */}
        <div className="w-full pt-6 mt-4 print-section">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="border-t-2 border-black pt-2 text-center">
                <p className="text-xs font-medium">Client Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full pt-2 mt-2 border-t text-end print-section">
          <p className="text-xs text-gray-600">Booking ID: #{bookingId}</p>
          <p className="text-xs text-gray-600">
            Printed on{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintBooking;
