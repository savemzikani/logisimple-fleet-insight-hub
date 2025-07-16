import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  Plus,
  Bell,
  HelpCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  {
    title: "Overview",
    items: [
      { 
        title: "Dashboard", 
        url: "/dashboard", 
        icon: LayoutDashboard,
        badge: null
      },
      { 
        title: "Fleet Map", 
        url: "/fleet-map", 
        icon: MapPin,
        badge: null
      },
      { 
        title: "Analytics", 
        url: "/analytics", 
        icon: BarChart3,
        badge: { count: 3, variant: "default" }
      },
    ]
  },
  {
    title: "Fleet Management",
    items: [
      { 
        title: "Vehicles", 
        url: "/vehicles", 
        icon: Truck,
        badge: { count: 12, variant: "secondary" }
      },
      { 
        title: "Drivers", 
        url: "/drivers", 
        icon: Users,
        badge: { count: 8, variant: "secondary" }
      },
      { 
        title: "Maintenance", 
        url: "/maintenance", 
        icon: Wrench,
        badge: { count: 5, variant: "destructive" }
      },
      { 
        title: "Fuel Records", 
        url: "/fuel", 
        icon: Fuel,
        badge: null
      },
    ]
  },
  {
    title: "Business",
    items: [
      { 
        title: "Customers", 
        url: "/customers", 
        icon: UserCheck,
        badge: { count: 24, variant: "secondary" }
      },
      { 
        title: "Company", 
        url: "/company", 
        icon: Building2,
        badge: null
      },
      { 
        title: "Settings", 
        url: "/settings", 
        icon: Settings,
        badge: null
      },
    ]
  }
];

interface NavItemBadge {
  count: number;
  variant: "default" | "secondary" | "destructive";
}

interface NavItem {
  title: string;
  url: string;
  icon: any;
  badge: NavItemBadge | null;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Set initial active group based on current path
  useEffect(() => {
    const activeItem = navigationItems.flatMap(group => group.items).find(item => 
      currentPath.startsWith(item.url)
    );
    
    if (activeItem) {
      const group = navigationItems.find(group => 
        group.items.some(item => item.url === activeItem.url)
      );
      if (group) setActiveGroup(group.title);
    }
  }, [currentPath]);

  const toggleGroup = (title: string) => {
    setActiveGroup(activeGroup === title ? null : title);
  };

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (group: NavGroup) => 
    group.items.some(item => currentPath.startsWith(item.url));

  const getNavCls = (path: string) => {
    const baseClasses = "flex items-center w-full text-left text-sm rounded-md transition-colors";
    const activeClasses = isActive(path) 
      ? "bg-primary/10 text-primary font-medium" 
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground";
    return `${baseClasses} ${activeClasses}`;
  };

  const getBadgeVariant = (variant: string) => {
    switch (variant) {
      case 'destructive':
        return 'bg-destructive text-destructive-foreground';
      case 'secondary':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon" className="border-r bg-background">
        <SidebarHeader className="border-b p-0">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <div>
                  <h1 className="text-base font-semibold">LogiSimple</h1>
                  <p className="text-xs text-muted-foreground">Fleet Management</p>
                </div>
              )}
            </div>
            <SidebarTrigger className="h-8 w-8 p-0" />
          </div>
        </SidebarHeader>

        <div className="flex-1 overflow-y-auto">
          <SidebarContent className="px-2 py-4">
            <div className="mb-6 px-2">
              <Button
                variant="default"
                size="sm"
                className="w-full font-medium"
                onClick={() => navigate('/vehicles/add')}
              >
                <Plus className="mr-2 h-4 w-4" />
                {!isCollapsed && 'Add Vehicle'}
              </Button>
            </div>

            {navigationItems.map((group) => (
              <SidebarGroup key={group.title} className="mb-6 last:mb-0">
                {!isCollapsed && (
                  <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground">
                    {group.title}
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent className="mt-2">
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <Tooltip key={item.title} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <NavLink 
                                to={item.url} 
                                className={getNavCls(item.url)}
                              >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                {!isCollapsed && (
                                  <span className="ml-2 truncate">{item.title}</span>
                                )}
                                {item.badge && !isCollapsed && (
                                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeVariant(item.badge.variant)}`}>
                                    {item.badge.count}
                                  </span>
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right" sideOffset={4}>
                            <div className="flex items-center">
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${getBadgeVariant(item.badge.variant)}`}>
                                  {item.badge.count}
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
        </div>

        <SidebarFooter className="border-t p-2">
          <div className="space-y-2">
            {/* Quick Actions */}
            {!isCollapsed && (
              <div className="mb-2 space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:bg-accent"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </Button>
              </div>
            )}

            {/* User Profile */}
            <div className="flex items-center p-2 hover:bg-accent rounded-md transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                <AvatarFallback>
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile?.email || user?.email}
                  </p>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-auto h-8 w-8"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}