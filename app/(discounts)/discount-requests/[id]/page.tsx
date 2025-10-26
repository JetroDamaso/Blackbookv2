"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit,
  Calendar,
  User,
  Receipt,
  FileText,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscountStatusBadge } from "@/components/discounts/DiscountStatusBadge";
import { useToast } from "@/hooks/use-toast";

interface DiscountRequest {
  id: string;
  booking: {
    id: string;
    eventDate: string;
    category: string;
    client: {
      name: string;
      email: string;
      phone: string;
    };
  };
  requestedBy: {
    name: string;
    email: string;
    role: string;
  };
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  discountUnit: string;
  justification: string;
  documents: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";
  originalAmount: number;
  finalAmount: number;
  reviewedBy?: {
    name: string;
    email: string;
  };
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DiscountRequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [request, setRequest] = useState<DiscountRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);

  // Form states
  const [rejectNotes, setRejectNotes] = useState("");
  const [modifyType, setModifyType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [modifyValue, setModifyValue] = useState("");
  const [modifyNotes, setModifyNotes] = useState("");

  const isOwner = session?.user?.role === "OWNER";
  const isPending = request?.status === "PENDING";
  const canReview = isOwner && isPending;

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/discount-requests/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch discount request");
      }

      const data = await response.json();
      setRequest(data);
    } catch (error) {
      console.error("Error fetching discount request:", error);
      toast("Error", "Failed to load discount request");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this discount request?")) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/discount-requests/${params.id}/approve`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to approve discount request");
      }

      toast("Success", "Discount request approved successfully");
      fetchRequest();
    } catch (error) {
      console.error("Error approving discount request:", error);
      toast("Error", "Failed to approve discount request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      toast("Error", "Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/discount-requests/${params.id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewNotes: rejectNotes }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject discount request");
      }

      toast("Success", "Discount request rejected");
      setShowRejectModal(false);
      setRejectNotes("");
      fetchRequest();
    } catch (error) {
      console.error("Error rejecting discount request:", error);
      toast("Error", "Failed to reject discount request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleModify = async () => {
    if (!modifyValue.trim()) {
      toast("Error", "Please enter a discount value");
      return;
    }

    const value = parseFloat(modifyValue);
    if (isNaN(value) || value <= 0) {
      toast("Error", "Please enter a valid discount value");
      return;
    }

    if (modifyType === "PERCENTAGE" && value > 100) {
      toast("Error", "Percentage discount cannot exceed 100%");
      return;
    }

    if (modifyType === "FIXED" && request && value > request.originalAmount) {
      toast("Error", "Fixed discount cannot exceed the original amount");
      return;
    }

    try {
      setActionLoading(true);
      const response = await fetch(`/api/discount-requests/${params.id}/modify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountType: modifyType,
          discountValue: value,
          reviewNotes: modifyNotes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to modify discount request");
      }

      toast("Success", "Discount request modified and approved");
      setShowModifyModal(false);
      setModifyValue("");
      setModifyNotes("");
      fetchRequest();
    } catch (error) {
      console.error("Error modifying discount request:", error);
      toast("Error", "Failed to modify discount request");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading discount request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Discount Request Not Found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            The discount request you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const discountAmount = request.originalAmount - request.finalAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <DiscountStatusBadge status={request.status} />
      </div>

      <PageHeader icon={Receipt} title="Discount Request Details" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Booking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Booking ID</Label>
              <p className="font-medium">{request.booking.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Event Date</Label>
              <p className="font-medium">{formatDate(request.booking.eventDate)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Event Type</Label>
              <p className="font-medium capitalize">{request.booking.category}</p>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Client Name</Label>
              <p className="font-medium">{request.booking.client.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Client Email</Label>
              <p className="font-medium">{request.booking.client.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Client Phone</Label>
              <p className="font-medium">{request.booking.client.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Requester Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Requester Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Requested By</Label>
              <p className="font-medium">{request.requestedBy.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{request.requestedBy.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Role</Label>
              <Badge variant="outline">{request.requestedBy.role}</Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Request Date</Label>
              <p className="font-medium">{formatDate(request.createdAt)}</p>
            </div>
            {request.reviewedBy && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground">Reviewed By</Label>
                  <p className="font-medium">{request.reviewedBy.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Review Date</Label>
                  <p className="font-medium">{formatDate(request.updatedAt)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Discount Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Discount Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Discount Type</Label>
              <p className="font-medium capitalize">{request.discountType.toLowerCase()}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Discount Value</Label>
              <p className="font-medium">
                {request.discountType === "PERCENTAGE"
                  ? `${request.discountValue}%`
                  : formatCurrency(request.discountValue)}
              </p>
            </div>
            <Separator />
            <div>
              <Label className="text-muted-foreground">Original Amount</Label>
              <p className="text-lg font-semibold">{formatCurrency(request.originalAmount)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Discount Amount</Label>
              <p className="text-lg font-semibold text-red-600">
                -{formatCurrency(discountAmount)}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Final Amount</Label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(request.finalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Justification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Justification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.justification}</p>

            {request.reviewNotes && (
              <>
                <Separator className="my-4" />
                <div>
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{request.reviewNotes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
            <CardDescription>
              As an Owner, you can approve, reject, or modify this discount request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>

              <Button
                onClick={() => setShowModifyModal(true)}
                disabled={actionLoading}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modify & Approve
              </Button>

              <Button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Discount Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this discount request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="rejectNotes">Rejection Reason</Label>
              <Textarea
                id="rejectNotes"
                placeholder="Explain why this discount request is being rejected..."
                value={rejectNotes}
                onChange={e => setRejectNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectNotes("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modify Modal */}
      <Dialog open={showModifyModal} onOpenChange={setShowModifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Discount Request</DialogTitle>
            <DialogDescription>
              Adjust the discount amount and provide optional notes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="modifyType">Discount Type</Label>
              <Select
                value={modifyType}
                onValueChange={(value: "PERCENTAGE" | "FIXED") => setModifyType(value)}
              >
                <SelectTrigger id="modifyType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="modifyValue">Discount Value</Label>
              <Input
                id="modifyValue"
                type="number"
                step={modifyType === "PERCENTAGE" ? "0.1" : "0.01"}
                min="0"
                max={modifyType === "PERCENTAGE" ? "100" : request.originalAmount}
                placeholder={modifyType === "PERCENTAGE" ? "Enter percentage" : "Enter amount"}
                value={modifyValue}
                onChange={e => setModifyValue(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="modifyNotes">Notes (Optional)</Label>
              <Textarea
                id="modifyNotes"
                placeholder="Explain the modification..."
                value={modifyNotes}
                onChange={e => setModifyNotes(e.target.value)}
                rows={3}
              />
            </div>

            {modifyValue && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original Amount:</span>
                  <span className="font-medium">{formatCurrency(request.originalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Discount:</span>
                  <span className="font-medium text-red-600">
                    -
                    {modifyType === "PERCENTAGE"
                      ? `${modifyValue}% (${formatCurrency((request.originalAmount * parseFloat(modifyValue)) / 100)})`
                      : formatCurrency(parseFloat(modifyValue))}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Final Amount:</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      modifyType === "PERCENTAGE"
                        ? request.originalAmount * (1 - parseFloat(modifyValue) / 100)
                        : request.originalAmount - parseFloat(modifyValue)
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowModifyModal(false);
                setModifyValue("");
                setModifyNotes("");
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleModify}
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Modify & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
