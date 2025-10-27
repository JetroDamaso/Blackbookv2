"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateEmployeePassword } from "@/server/employee/pushActions";
import { toast } from "sonner";
import { Loader2, Lock, Database, Download, Upload, HardDrive, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SettingsPage = () => {
  const { data: session, update } = useSession();
  const user = session?.user;

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Backup state
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isLoadingDbInfo, setIsLoadingDbInfo] = useState(false);

  // Check if user has access to backup features
  const userRole = user?.role?.toUpperCase().replace(/\s+/g, "_");
  const canAccessBackup = userRole === "OWNER" || userRole === "MANAGER";

  // Load database info on mount
  useEffect(() => {
    if (canAccessBackup) {
      loadDatabaseInfo();
    }
  }, [canAccessBackup]);

  const loadDatabaseInfo = async () => {
    setIsLoadingDbInfo(true);
    try {
      const response = await fetch("/api/database/info");
      const data = await response.json();

      if (data.success) {
        setDatabaseInfo(data);
      } else {
        toast.error("Failed to load database info");
      }
    } catch (error) {
      console.error("Error loading database info:", error);
      toast.error("Failed to load database info");
    } finally {
      setIsLoadingDbInfo(false);
    }
  };

  const handleBackupDatabase = async () => {
    try {
      // Open directory picker dialog
      const dirHandle = await (window as any).showDirectoryPicker();

      setIsBackingUp(true);

      // Get permission to write
      const permission = await dirHandle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") {
        const requestPermission = await dirHandle.requestPermission({ mode: "readwrite" });
        if (requestPermission !== "granted") {
          toast.error("Permission denied to write to the selected directory");
          return;
        }
      }

      // Get the directory path (this is a workaround since we can't get full path directly in browser)
      // We'll use the API to create backup and return download
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `backup-${timestamp}.db`;

      // Read the database file from server
      const response = await fetch("/api/database/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinationPath: "temp", // We'll handle download differently
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create backup");
      }

      // Since we can't directly write to file system from browser,
      // we'll trigger a download instead
      toast.success(`Backup process initiated. The file will be downloaded as ${backupFileName}`);

      loadDatabaseInfo();
    } catch (error: any) {
      console.error("Backup error:", error);
      if (error.name === "AbortError") {
        toast.info("Backup cancelled");
      } else {
        toast.error(error.message || "Failed to create backup");
      }
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreDatabase = async () => {
    try {
      // Create a file input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".db,.sqlite,.sqlite3";

      input.onchange = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsRestoring(true);

        try {
          // Read file as array buffer
          const arrayBuffer = await file.arrayBuffer();
          const blob = new Blob([arrayBuffer]);

          // Convert to base64 for transmission
          const reader = new FileReader();
          reader.readAsDataURL(blob);

          reader.onloadend = async () => {
            try {
              const base64data = reader.result as string;

              const response = await fetch("/api/database/restore", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fileData: base64data,
                  fileName: file.name,
                }),
              });

              const data = await response.json();

              if (data.success) {
                toast.success("Database restored successfully! Please refresh the page.");
                loadDatabaseInfo();
              } else {
                throw new Error(data.error || "Failed to restore database");
              }
            } catch (error: any) {
              console.error("Restore error:", error);
              toast.error(error.message || "Failed to restore database");
            } finally {
              setIsRestoring(false);
            }
          };
        } catch (error: any) {
          console.error("File read error:", error);
          toast.error("Failed to read database file");
          setIsRestoring(false);
        }
      };

      input.click();
    } catch (error: any) {
      console.error("File selection error:", error);
      toast.error("Failed to select database file");
      setIsRestoring(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setIsBackingUp(true);

      // Create a link to download the database file
      const response = await fetch("/api/database/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create backup");
      }

      const blob = await response.blob();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `backup-${timestamp}.db`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Backup downloaded successfully!");
    } catch (error) {
      console.error("Download backup error:", error);
      toast.error("Failed to download backup");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      await updateEmployeePassword(user.id, newPassword);
      toast.success("Password changed successfully");
      setIsPasswordDialogOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Settings size={18} /> <span>Settings</span>
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setIsPasswordDialogOpen(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          {/* Backup Section - Only for Owner and Manager */}
          {canAccessBackup && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Backup & Restore
                </CardTitle>
                <CardDescription>
                  Backup your database or restore from a previous backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Database Info */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Current Database</Label>
                  {isLoadingDbInfo ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading database info...
                    </div>
                  ) : databaseInfo?.exists ? (
                    <Alert>
                      <HardDrive className="h-4 w-4" />
                      <AlertDescription className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs break-all">
                            {databaseInfo.databasePath}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span>Size: {databaseInfo.sizeFormatted}</span>
                          <span>
                            Last Modified: {new Date(databaseInfo.lastModified).toLocaleString()}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert>
                      <AlertDescription>Database file not found</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Actions</Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleDownloadBackup}
                      disabled={isBackingUp || !databaseInfo?.exists}
                      variant="default"
                    >
                      {isBackingUp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Backup...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Backup Database
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleRestoreDatabase}
                      disabled={isRestoring}
                      variant="outline"
                    >
                      {isRestoring ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Restoring...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Restore Database
                        </>
                      )}
                    </Button>
                  </div>

                  <Alert className="mt-4">
                    <AlertDescription className="text-xs text-muted-foreground">
                      <strong>Note:</strong> When restoring a database, an automatic backup of the
                      current database will be created first. After restoring, please refresh the
                      page to see the changes.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SettingsPage;
