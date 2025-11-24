"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllMenuPackages } from "@/server/menuPackages/pullActions";
import { Plus, Package, Pencil, Trash2 } from "lucide-react";
import { MenuPackageDialog } from "./menu-package-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface ManagePackagesDialogProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function ManagePackagesDialog({
  open,
  onClose,
  onRefresh,
}: ManagePackagesDialogProps) {
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const { data: menuPackagesData, refetch } = useQuery({
    queryKey: ["menuPackages"],
    queryFn: () => getAllMenuPackages(),
    enabled: open,
  });

  const handleOpenPackageDialog = (packageId?: number) => {
    setSelectedPackage(packageId || null);
    setIsPackageDialogOpen(true);
  };

  const handleClosePackageDialog = () => {
    setIsPackageDialogOpen(false);
    setSelectedPackage(null);
  };

  const handlePackageSuccess = () => {
    refetch();
    onRefresh();
    handleClosePackageDialog();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package size={20} />
              Manage Menu Packages
            </DialogTitle>
            <DialogDescription>
              Create, edit, or delete menu packages for your catering services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {menuPackagesData?.length || 0} package{menuPackagesData?.length !== 1 ? 's' : ''} total
              </div>
              <Button onClick={() => handleOpenPackageDialog()} size="sm">
                <Plus size={16} className="mr-2" />
                Add New Package
              </Button>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              {menuPackagesData && menuPackagesData.length > 0 ? (
                <div className="space-y-3">
                  {menuPackagesData.map((pkg: any) => (
                    <Card key={pkg.id} className="hover:bg-accent/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{pkg.name}</h3>
                              <span className="text-sm text-muted-foreground">
                                • {pkg.maxDishes} {pkg.maxDishes === 1 ? 'dish' : 'dishes'} max
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-primary">
                                ₱{pkg.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            {pkg.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {pkg.description}
                              </p>
                            )}

                            {pkg.allowedCategories && pkg.allowedCategories.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pkg.allowedCategories.map((cat: any) => (
                                  <span
                                    key={cat.id}
                                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                                  >
                                    {cat.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPackageDialog(pkg.id)}
                            >
                              <Pencil size={14} className="mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center">
                  <Package size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No packages yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first menu package to get started.
                  </p>
                  <Button onClick={() => handleOpenPackageDialog()} size="sm">
                    <Plus size={16} className="mr-2" />
                    Add New Package
                  </Button>
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <MenuPackageDialog
        open={isPackageDialogOpen}
        onClose={handleClosePackageDialog}
        onSuccess={handlePackageSuccess}
        packageId={selectedPackage}
      />
    </>
  );
}
