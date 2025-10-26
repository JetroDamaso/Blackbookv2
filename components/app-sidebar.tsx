"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart2,
  Book,
  Building2,
  Cake,
  Calendar,
  Castle,
  CreditCard,
  DollarSign,
  Hotel,
  LayoutDashboard,
  LogOut,
  Notebook,
  Package,
  Percent,
  Settings2,
  Shield,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  Wine,
  Receipt,
  Bell,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { hasPermission, type Role } from "@/lib/permissions";
import { NotificationBell } from "@/components/notifications/NotificationBell";

// This is sample data.
const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Daily Operations",
      url: "#",
      icon: LayoutDashboard,
      items: [
        {
          title: "Home",
          url: "/event_calendar",
          icon: Calendar,
        },
        {
          title: "Bookings",
          url: "/manage",
          icon: Book,
        },
        {
          title: "Clients",
          url: "/manage/clients",
          icon: Users,
        },
        {
          title: "Event Types",
          url: "/manage/event-types",
          icon: Cake,
        },
      ],
    },
    {
      title: "Facilities & Resources",
      url: "#",
      icon: Building2,
      items: [
        {
          title: "Pavilion",
          url: "/manage/pavilion",
          icon: Castle,
        },
        {
          title: "Packages",
          url: "/manage/packages",
          icon: Package,
        },
        {
          title: "Rooms",
          url: "/manage/rooms",
          icon: Hotel,
        },
        {
          title: "Inventory",
          url: "/manage/inventory",
          icon: Wine,
        },
      ],
    },
    {
      title: "Staff & Roles",
      url: "#",
      icon: UserCog,
      items: [
        {
          title: "Employees",
          url: "/manage/employees",
          icon: UserCheck,
          permission: "employees:read",
        },
        {
          title: "Roles",
          url: "/manage/roles",
          icon: Shield,
          permission: "employees:read",
        },
      ],
    },
    {
      title: "Finance & Payments",
      url: "#",
      icon: Wallet,
      items: [
        {
          title: "Additional Charges",
          url: "/manage/additional-charges",
          icon: DollarSign,
        },
        {
          title: "Discounts",
          url: "/manage/discounts",
          icon: Percent,
        },
        {
          title: "Discount Requests",
          url: "/discount-requests",
          icon: Receipt,
          permission: "discounts:request",
        },
        {
          title: "Payment Methods",
          url: "/manage/mode-of-payment",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "Reports & Settings",
      url: "#",
      icon: BarChart2,
      items: [
        {
          title: "Reports",
          url: "/reports",
          icon: Notebook,
          permission: "reports:view",
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings2,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Show sidebar only for authenticated users
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  // Filter navigation based on user role and permissions
  const getFilteredNavigation = () => {
    const userRole = session.user.role as Role;

    return data.navMain
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          // If item has a permission requirement, check it
          if ("permission" in item && item.permission) {
            return hasPermission(userRole, item.permission as any);
          }
          // Otherwise, allow it (backward compatibility)
          return true;
        }),
      }))
      .filter(section => section.items.length > 0); // Remove empty sections
  };

  const filteredNavigation = getFilteredNavigation();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex gap-3 justify-between items-center py-2 px-1">
          <Image
            src="/susings_and_rufins_logo.png"
            alt="Susings and Rufins Logo"
            width={60}
            height={60}
          />
          <NotificationBell />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {filteredNavigation.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(item => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a href={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarUserInfo />
    </Sidebar>
  );
}

function SidebarUserInfo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        redirect: false,
      });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  if (status === "loading") {
    return (
      <SidebarFooter>
        <div className="flex items-center space-x-2 p-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="flex-1">
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
            <div className="h-2 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </SidebarFooter>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <SidebarFooter>
      <Separator className="mb-2" />
      <div className="px-2 flex justify-between">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs font-normal text-foreground truncate">{user.role}</p>
          </div>
        </div>

        <div>
          <SidebarMenuButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            className=" justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-50"
          >
            <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? "animate-spin" : ""}`} />
          </SidebarMenuButton>
        </div>
      </div>
    </SidebarFooter>
  );
}
