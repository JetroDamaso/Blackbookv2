import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Package, FileText, Settings, BarChart3 } from "lucide-react";

const ManageMainPage = () => {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage</h1>
          <p className="text-muted-foreground">
            Manage your bookings, clients, inventory, and more.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/manage/bookings">
            <div className="rounded-lg border p-6 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Bookings</h2>
                  <p className="text-sm text-muted-foreground">View and manage all bookings</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/clients">
            <div className="rounded-lg border p-6 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Clients</h2>
                  <p className="text-sm text-muted-foreground">Manage client information</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/inventory">
            <div className="rounded-lg border p-6 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Inventory</h2>
                  <p className="text-sm text-muted-foreground">Track and manage inventory</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/reports">
            <div className="rounded-lg border p-6 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Reports</h2>
                  <p className="text-sm text-muted-foreground">Generate and view reports</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/settings">
            <div className="rounded-lg border p-6 hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold">Settings</h2>
                  <p className="text-sm text-muted-foreground">Configure application settings</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ManageMainPage;
