import React, { useState } from "react";
import { Button } from "../ui/button";
import { Notebook, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getBillingSummary, getPaymentsByBilling } from "@/server/Billing & Payments/pullActions";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";

type ViewPaymentDialogProps = {
  billingId: number;
  clientId: number;
};

const ViewPaymentDialog = ({ billingId, clientId }: ViewPaymentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const { data: billingSummary, isPending: isBillingSummaryPending } = useQuery({
    queryKey: ["billingSummary", billingId],
    queryFn: () => getBillingSummary(billingId),
    enabled: isOpen, // Only fetch when dialog is open
  });

  const { data: paymentsData, isPending: isPaymentsPending } = useQuery({
    queryKey: ["paymentsByBilling", billingId, currentPage],
    queryFn: () => getPaymentsByBilling(billingId, currentPage, pageSize),
    enabled: isOpen, // Only fetch when dialog is open
  });

  const payments = paymentsData?.data || [];
  const totalPages = paymentsData?.totalPages || 0;
  const total = paymentsData?.total || 0;

  const handleClose = () => {
    setIsOpen(false);
    setCurrentPage(1); // Reset to first page when closing
  };

  return (
    <>
      {/* Trigger Button */}
      <Button className="w-full grow" onClick={() => setIsOpen(true)}>
        <Notebook /> View Payments
      </Button>

      {/* Custom Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <div className="relative z-[101] w-[95vw] max-w-[1400px] min-h-[400px] max-h-[90vh] bg-background border rounded-lg shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 shrink-0 -mb-8">
              <div>
                <h2 className="text-lg font-semibold">View Payments</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 min-h-0">
              <div className="flex flex-col text-foreground">
                {isBillingSummaryPending ? (
                  <div className="text-center py-4">Loading billing summary...</div>
                ) : billingSummary ? (
                  <>
                    {billingSummary.isDefault && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          {billingSummary.error
                            ? "Error loading billing data. Showing default values."
                            : "No billing data found. Showing default values."}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-8 items-center">
                      <div className="gap-1 flex flex-col">
                        <p className="text-sm text-foreground/50">Balance</p>
                        <p
                          className={`text-2xl font-medium ${billingSummary.balance <= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          ₱
                          {billingSummary.balance.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="h-full py-4 border-l-1"></div>
                      <div className="gap-1 flex flex-col">
                        <p className="text-sm text-foreground/50">Amount Paid</p>
                        <p
                          className={`text-2xl font-medium ${billingSummary.totalPaid === billingSummary.totalBilling ? "text-green-500" : "text-red-500"}`}
                        >
                          ₱
                          {billingSummary.totalPaid.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="h-full py-4 border-l-1"></div>
                      <div className="gap-1 flex flex-col">
                        <p className="text-sm text-foreground/50">Booking</p>
                        <p className="text-2xl font-medium">
                          {billingSummary?.eventName || "No Event Name"}
                        </p>
                      </div>
                      <div className="h-full py-4 border-l-1"></div>
                      <div className="gap-1 flex flex-col">
                        <p className="text-sm text-foreground/50">Client</p>
                        <p className="text-2xl font-medium">
                          {billingSummary?.clientName || "Unknown Client"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-red-500">
                    Failed to load billing summary
                  </div>
                )}

                <div className="flex-1 mt-4">
                  {isPaymentsPending ? (
                    <div className="text-center py-8">Loading payments...</div>
                  ) : payments ? (
                    <>
                      <DataTable
                        columns={columns}
                        data={payments}
                        billingId={billingId}
                        clientId={clientId}
                        onRowClick={(paymentId: number) => {
                          // Handle payment row click if needed
                          console.log("Payment clicked:", paymentId);
                        }}
                      />

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-2 py-3 mt-2">
                          <div className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages} ({total} total payments)
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft className="h-4 w-4 mr-1" />
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">No payments found</div>
                  )}
                </div>
              </div>

              <div className="flex gap-8 items-center mt-2 justify-between px-8 border-1 rounded-md py-4">
                <div className="flex justify-center flex-1">
                  <div className="gap-1 flex flex-col justify-center items-center">
                    <p className="text-sm text-foreground/50">Original Amount</p>
                    <p className="text-lg font-medium">
                      ₱
                      {billingSummary?.originalPrice.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="h-full py-4 border-l-1"></div>
                <div className="flex justify-center flex-1">
                  <div className="gap-1 flex flex-col justify-center items-center">
                    <p className="text-sm text-foreground/50">Discount Amount</p>
                    <p className="text-lg font-medium">
                      ₱
                      {billingSummary?.totalBilling.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                <div className="h-full py-4 border-l-1"></div>
                <div className="flex justify-center flex-1">
                  <div className="gap-1 flex flex-col justify-center items-center">
                    <p className="text-sm text-foreground/50">Discount Type</p>
                    <p className="text-lg font-medium">{billingSummary?.discountType}</p>
                  </div>
                </div>
                {(billingSummary?.additionalCharges || 0) > 0 && (
                  <>
                    <div className="h-full py-4 border-l-1"></div>
                    <div className="flex justify-center flex-1">
                      <div className="gap-1 flex flex-col justify-center items-center">
                        <p className="text-sm text-foreground/50">Additional Charges</p>
                        <p className="text-lg font-medium text-orange-600">
                          ₱
                          {(billingSummary?.additionalCharges || 0).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                <div className="h-full py-4 border-l-1"></div>
                <div className="flex justify-center flex-1">
                  <div className="gap-1 flex flex-col justify-center items-center">
                    <p className="text-sm text-foreground/50">YVE</p>
                    <p className="text-lg font-medium">
                      ₱
                      {billingSummary?.yve.toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
                {billingSummary?.catering && billingSummary?.cateringPerPaxAmount && (
                  <>
                    <div className="h-full py-4 border-l-1"></div>
                    <div className="flex justify-center flex-1">
                      <div className="gap-1 flex flex-col justify-center items-center">
                        <p className="text-sm text-foreground/50">
                          Catering (
                          {Math.round(
                            billingSummary.catering / billingSummary.cateringPerPaxAmount
                          )}{" "}
                          Pax)
                        </p>
                        <p className="text-lg font-medium">
                          ₱
                          {billingSummary.cateringPerPaxAmount.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}{" "}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewPaymentDialog;
