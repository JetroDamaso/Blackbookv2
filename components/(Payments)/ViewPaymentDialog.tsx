import React, { useState } from "react";
import { Button } from "../ui/button";
import { Notebook, X, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  getBillingSummary,
  getPaymentsByBilling,
} from "@/server/Billing & Payments/pullActions";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";

type ViewPaymentDialogProps = {
  billingId: number;
  clientId: number;
};

const ViewPaymentDialog = ({ billingId, clientId }: ViewPaymentDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: billingSummary, isPending: isBillingSummaryPending } = useQuery(
    {
      queryKey: ["billingSummary", billingId],
      queryFn: () => getBillingSummary(billingId),
      enabled: isOpen, // Only fetch when dialog is open
    }
  );

  const { data: payments, isPending: isPaymentsPending } = useQuery({
    queryKey: ["paymentsByBilling", billingId],
    queryFn: () => getPaymentsByBilling(billingId),
    enabled: isOpen, // Only fetch when dialog is open
  });

  return (
    <>
      {/* Trigger Button */}
      <Button className="w-full grow" onClick={() => setIsOpen(true)}>
        <Notebook /> View Payments
      </Button>

      {/* Custom Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-50 w-[95vw] max-w-[1400px] min-h-[400px] max-h-[90vh] bg-background border rounded-lg shadow-lg flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 shrink-0 -mb-8">
              <div>
                <h2 className="text-lg font-semibold">View Payments</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 min-h-0">
              <div className="flex flex-col text-foreground">
                {isBillingSummaryPending ? (
                  <div className="text-center py-4">
                    Loading billing summary...
                  </div>
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

                    <div className="gap-1 flex flex-col">
                      <p>Balance</p>
                      <p
                        className={`text-2xl font-medium ${billingSummary.balance < 0 ? "text-red-600" : "text-foreground"}`}
                      >
                        ₱
                        {billingSummary.balance.toLocaleString("en-PH", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50 mt-2">
                          Original Price
                        </p>
                        <p className="text-lg font-medium">
                          ₱
                          {billingSummary.originalPrice.toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50 mt-2">
                          Discounted Price
                        </p>
                        <p className="text-lg font-medium">
                          ₱
                          {billingSummary.totalBilling.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50 mt-2">
                          Deposit
                        </p>
                        <p className="text-lg font-medium">
                          ₱
                          {billingSummary.deposit.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50 mt-2">
                          Amount Paid
                        </p>
                        <p className="text-lg font-medium">
                          ₱
                          {billingSummary.totalPaid.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50 mt-2">YVE</p>
                        <p className="text-lg font-medium">
                          ₱
                          {billingSummary.yve.toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-foreground/50 mt-2">
                          Discount Type
                        </p>
                        <p className="text-lg font-medium">
                          {billingSummary.discountType}
                          {billingSummary.discountPercentage > 0 &&
                            ` (${billingSummary.discountPercentage}%)`}
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
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No payments found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewPaymentDialog;
