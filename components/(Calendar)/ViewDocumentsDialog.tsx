import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, FileText, FileImage, X, Download, Eye, Upload, Plus } from "lucide-react";
import { getDocumentsByBooking, getDocumentsByPayment } from "@/server/Documents/pullActions";
import { getPaymentsByBilling } from "@/server/Billing & Payments/pullActions";
import { toast } from "sonner";

type ViewDocumentsDialogProps = {
  bookingId: number;
  clientId?: number;
  billingId?: number;
};

export function ViewDocumentsDialog({ bookingId, clientId, billingId }: ViewDocumentsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{
    id: number;
    name: string;
    file: string;
  } | null>(null);

  const queryClient = useQueryClient();

  // Fetch booking documents
  const { data: bookingDocuments = [], isPending: isBookingDocsPending } = useQuery({
    queryKey: ["bookingDocuments", bookingId],
    queryFn: () => getDocumentsByBooking(bookingId),
    enabled: isOpen,
  });

  // Fetch payments for this billing to get payment IDs
  const { data: payments = [], isPending: isPaymentsPending } = useQuery({
    queryKey: ["paymentsByBilling", billingId],
    queryFn: () => getPaymentsByBilling(billingId || 0),
    enabled: isOpen && !!billingId,
  });

  // Get payment IDs as a stable string
  const paymentIds = payments.map(p => p.id);
  const paymentIdsKey = paymentIds.join(",");

  // Fetch documents for all payments
  const { data: paymentDocuments = [], isPending: isPaymentDocsPending } = useQuery({
    queryKey: ["paymentDocuments", billingId, paymentIdsKey],
    queryFn: async () => {
      if (paymentIds.length === 0) return [];

      const allPaymentDocs = await Promise.all(paymentIds.map(id => getDocumentsByPayment(id)));

      // Flatten the array of arrays and add payment info
      return allPaymentDocs.flat().map((doc: any) => ({
        ...doc,
        isPaymentDocument: true,
      }));
    },
    enabled: isOpen && !!billingId && !isPaymentsPending,
  });

  // Combine all documents
  const documents = [
    ...bookingDocuments.map((doc: any) => ({ ...doc, isPaymentDocument: false })),
    ...paymentDocuments,
  ];

  const isPending = isBookingDocsPending || isPaymentsPending || isPaymentDocsPending;

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "")) {
      return FileImage;
    }
    if (["pdf"].includes(extension || "")) {
      return FileText;
    }
    return FileIcon;
  };

  const isImage = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(extension || "");
  };

  const handleDocumentClick = (doc: { id: number; name: string; file: string }) => {
    if (isImage(doc.name)) {
      setSelectedDocument(doc);
    } else {
      // For non-images (PDFs, etc.), trigger download
      const link = document.createElement("a");
      link.href = doc.file;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownload = (doc: { name: string; file: string }) => {
    const link = document.createElement("a");
    link.href = doc.file;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Add new files to existing ones, avoiding duplicates
      setSelectedFiles(prev => {
        const existingNames = new Set(prev.map(f => f.name));
        const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...uniqueNewFiles];
      });
      // Reset input to allow selecting the same file again if needed
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      // Add new files to existing ones, avoiding duplicates
      setSelectedFiles(prev => {
        const existingNames = new Set(prev.map(f => f.name));
        const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...uniqueNewFiles];
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const uploadResult = await uploadResponse.json();

        const documentData = {
          name: file.name,
          file: uploadResult.path,
          bookingId: bookingId,
          clientId: clientId,
        };

        const createResponse = await fetch("/api/documents/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documentData),
        });

        if (!createResponse.ok) {
          throw new Error(`Failed to create document record for ${file.name}`);
        }
      }

      toast.success(`Successfully uploaded ${selectedFiles.length} file(s)`);
      setSelectedFiles([]);
      setIsUploadDialogOpen(false);
      // Invalidate both booking and payment documents queries
      queryClient.invalidateQueries({ queryKey: ["bookingDocuments", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["paymentDocuments", billingId] });
      queryClient.invalidateQueries({ queryKey: ["paymentsByBilling", billingId] });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2"
      >
        <FileText className="w-4 h-4" />
        View Documents
      </Button>

      {/* Main Documents List Dialog */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[200]" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] overflow-auto p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    View all documents for this booking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                  <Button
                    className="text-foreground hover:text-foreground/70 transition-all"
                    variant="link"
                    onClick={() => setIsOpen(false)}
                  >
                    <X />
                  </Button>
                </div>
              </div>

              {isPending ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Loading documents...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No documents found</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {documents.map(doc => {
                      const Icon = getFileIcon(doc.name);
                      const isImg = isImage(doc.name);

                      return (
                        <div
                          key={`${doc.id}-${doc.isPaymentDocument ? "payment" : "booking"}`}
                          className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{doc.name}</span>
                                {doc.isPaymentDocument && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                                    Payment Receipt
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isImg && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDocumentClick(doc)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                isImg ? handleDownload(doc) : handleDocumentClick(doc)
                              }
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </>
      )}

      {/* Upload Documents Dialog */}
      {isUploadDialogOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-[212]"
            onClick={() => !isUploading && setIsUploadDialogOpen(false)}
          />
          <div className="fixed inset-0 z-[213] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Upload Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    Select files to upload for this booking
                  </p>
                </div>
                <Button
                  className="text-foreground hover:text-foreground/70 transition-all"
                  variant="link"
                  onClick={() => !isUploading && setIsUploadDialogOpen(false)}
                  disabled={isUploading}
                >
                  <X />
                </Button>
              </div>

              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="upload-documents-input"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="upload-documents-input"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Plus className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Click to select files or drag and drop
                    </p>
                  </label>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="space-y-2 w-full">
                    <p className="text-sm font-medium">Selected Files:</p>
                    <ScrollArea className="max-h-[200px] w-full">
                      <div className="space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 border rounded-md text-sm"
                          >
                            <FileIcon className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="flex-1 truncate w-15 overflow-hidden">
                              {file.name}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 flex-shrink-0"
                              disabled={isUploading}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpload}
                    disabled={selectedFiles.length === 0 || isUploading}
                  >
                    {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} file(s)`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Preview Dialog */}
      {selectedDocument && (
        <>
          <div
            className="fixed inset-0 bg-black/80 z-[210]"
            onClick={() => setSelectedDocument(null)}
          />
          <div className="fixed inset-0 z-[211] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold truncate">{selectedDocument.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    className="text-foreground hover:text-foreground/70 transition-all"
                    variant="link"
                    onClick={() => setSelectedDocument(null)}
                  >
                    <X />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                <img
                  src={selectedDocument.file}
                  alt={selectedDocument.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
