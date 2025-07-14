import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  Fuel,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Fleet Map", url: "/fleet-map", icon: MapPin },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Fleet Management",
    items: [
      { title: "Vehicles", url: "/vehicles", icon: Truck },
      { title: "Drivers", url: "/drivers", icon: Users },
      { title: "Maintenance", url: "/maintenance", icon: Wrench },
      { title: "Fuel Records", url: "/fuel", icon: Fuel },
    ]
  },
  {
    title: "Business",
    items: [
      { title: "Customers", url: "/customers", icon: UserCheck },
      { title: "Company", url: "/company", icon: Building2 },
      { title: "Settings", url: "/settings", icon: Settings },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="p-2 bg-primary rounded-lg">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">LogiSimple</h1>
              <p className="text-xs text-sidebar-foreground/60">Fleet Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            {!isCollapsed && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}