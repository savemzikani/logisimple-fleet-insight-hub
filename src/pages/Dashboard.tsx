import { useState, useCallback, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Loader2, 
  RefreshCw, 
  Truck, 
  Users, 
  Wrench, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Info,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Hooks
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { useCompany } from '@/hooks/useCompany';
import { useAuth } from '@/hooks/useAuth';

// Components
import {
  Button,
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Progress,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Skeleton,
  Separator,
  StatCard,
  VehicleStatusChart,
  FleetUtilizationChart,
  EnhancedVehicleStatusChart,
  EnhancedFleetUtilizationChart,
  EnhancedStatCard,
  ActivityFeed
} from '@/components';

// Types
type VehicleStatus = 'active' | 'maintenance' | 'inactive';

type VehicleStatusCounts = {
  [key in VehicleStatus]: number;
};

type VehicleStatusData = {
  status: string;
  count: number;
}[];

type FleetUtilizationData = {
  name: string;
  value: number;
  color: string;
}[];

type ActivityType = 'warning' | 'success' | 'info' | 'danger';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: Date;
  icon?: React.ReactNode;
}

// Constants
const COLORS = {
  active: 'hsl(142.1, 76.2%, 36.3%)',
  maintenance: 'hsl(38, 92%, 50%)',
  inactive: 'hsl(0, 84.2%, 60.2%)',
  primary: 'hsl(221.2, 83.2%, 53.3%)',
  warning: 'hsl(38, 92%, 50%)',
  success: 'hsl(142.1, 76.2%, 36.3%)',
  danger: 'hsl(0, 84.2%, 60.2%)',
  info: 'hsl(221.2, 83.2%, 53.3%)',
};


const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const { user } = useAuth();
  
  // Fetch data using custom hooks
  const { 
    vehicles = [], 
    isLoading: isLoadingVehicles, 
    statusCounts: vehicleStatusCounts = { active: 0, maintenance: 0, inactive: 0 },
    refetch: refetchVehicles 
  } = useVehicles();
  
  const { 
    drivers = [], 
    isLoading: isLoadingDrivers,
    refetch: refetchDrivers 
  } = useDrivers();
  
  const { 
    stats: companyStats = {
      active_vehicles: 0,
      upcoming_maintenance: 0,
      total_vehicles: 0,
      total_drivers: 0,
    }, 
    isLoading: isLoadingStats 
  } = useCompany();

  // Calculate derived values
  const activeDrivers = useMemo(() => drivers.filter(d => d.status === 'active').length, [drivers]);
  const totalVehicles = vehicles.length;
  const maintenanceDue = companyStats.upcoming_maintenance || 0;
  const onRoute = companyStats.active_vehicles || 0;
  const utilizationRate = vehicles.length > 0 
    ? Math.round((companyStats.active_vehicles / vehicles.length) * 100) 
    : 0;

  // Prepare chart data
  const vehicleStatusData: VehicleStatusData = useMemo(() => [
    { 
      status: 'Active',
      count: vehicleStatusCounts.active || 0
    },
    { 
      status: 'Maintenance',
      count: vehicleStatusCounts.maintenance || 0
    },
    { 
      status: 'Inactive',
      count: vehicleStatusCounts.inactive || 0
    }
  ], [vehicleStatusCounts]);

  const fleetUtilizationData: FleetUtilizationData = useMemo(() => [
    { 
      name: 'In Use', 
      value: onRoute, 
      color: COLORS.primary 
    },
    { 
      name: 'Available', 
      value: Math.max(0, totalVehicles - onRoute), 
      color: COLORS.success 
    },
    { 
      name: 'Maintenance', 
      value: maintenanceDue, 
      color: COLORS.warning 
    }
  ], [onRoute, totalVehicles, maintenanceDue]);

  // Prepare recent activities
  const recentActivities = useMemo<ActivityItem[]>(() => [
    ...(maintenanceDue > 0 ? [{
      id: 'maint-alert',
      type: 'warning' as const,
      title: 'Maintenance Due',
      description: `${maintenanceDue} vehicles require maintenance`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      icon: <Wrench className="h-4 w-4 text-amber-500" />
    }] : []),
    ...(vehicles.length > 0 ? [{
      id: 'vehicles-count',
      type: 'info' as const,
      title: 'Fleet Update',
      description: `${vehicles.length} vehicles in your fleet`,
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      icon: <Truck className="h-4 w-4 text-blue-500" />
    }] : []),
    ...(drivers.length > 0 ? [{
      id: 'drivers-count',
      type: 'success' as const,
      title: 'Drivers',
      description: `${activeDrivers} of ${drivers.length} drivers active`,
      timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      icon: <Users className="h-4 w-4 text-green-500" />
    }] : []),
    ...(vehicles.length === 0 ? [{
      id: 'no-vehicles',
      type: 'info' as const,
      title: 'Get Started',
      description: 'Add your first vehicle to begin tracking',
      timestamp: new Date(),
      icon: <AlertCircle className="h-4 w-4 text-blue-500" />
    }] : []),
    {
      id: '1',
      type: 'info' as const,
      title: 'System Update',
      description: 'Dashboard has been updated with new features',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      icon: <Info className="h-4 w-4 text-blue-500" />
    },
    {
      id: '2',
      type: 'warning' as const,
      title: 'Maintenance Due',
      description: `${maintenanceDue} vehicles due for maintenance`,
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />
    },
    {
      id: '3',
      type: 'success' as const,
      title: 'New Driver Added',
      description: 'A new driver has been added to the system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />
    },
    {
      id: '4',
      type: 'info' as const,
      title: 'Scheduled Maintenance',
      description: 'Quarterly maintenance check scheduled for next week',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      icon: <Wrench className="h-4 w-4 text-blue-500" />
    }
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5), 
  [vehicles.length, drivers.length, activeDrivers, maintenanceDue]);

  // Prepare fleet stats for the stats grid with drill-down data
  const fleetStats = useMemo(() => [
    {
      id: 'total-vehicles',
      title: 'Total Vehicles',
      value: totalVehicles,
      description: 'In your fleet',
      icon: Truck,
      trend: {
        value: '+12%',
        direction: 'up',
        change: 'from last month'
      },
      color: 'bg-blue-100 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      drillDownData: {
        items: vehicles.slice(0, 5).map(v => ({
          id: v.id,
          name: `${v.make} ${v.model}`,
          value: v.license_plate || 'No plate',
          status: v.status || 'unknown',
          details: `Year: ${v.year}, Mileage: ${v.mileage || 0} km`
        })),
        metrics: {
          total: totalVehicles,
          active: vehicleStatusCounts.active,
          inactive: vehicleStatusCounts.inactive + vehicleStatusCounts.maintenance,
          change: { value: '+12%', direction: 'up' }
        }
      }
    },
    {
      id: 'active-drivers',
      title: 'Active Drivers',
      value: activeDrivers,
      description: 'On the road now',
      icon: Users,
      trend: {
        value: '+5%',
        direction: 'up',
        change: 'from last week'
      },
      color: 'bg-green-100 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      drillDownData: {
        items: drivers.filter(d => d.is_active).slice(0, 5).map(d => ({
          id: d.id,
          name: `${d.first_name} ${d.last_name}`,
          value: d.phone || 'No phone',
          status: d.is_active ? 'active' : 'inactive',
          details: `License: ${d.license_number || 'Not provided'}`
        })),
        metrics: {
          total: drivers.length,
          active: activeDrivers,
          inactive: drivers.length - activeDrivers,
          change: { value: '+5%', direction: 'up' }
        }
      }
    },
    {
      id: 'on-route',
      title: 'On Route',
      value: onRoute,
      description: 'Currently in transit',
      icon: MapPin,
      trend: {
        value: '+3',
        direction: 'up',
        change: 'active routes'
      },
      color: 'bg-purple-100 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      drillDownData: {
        items: vehicles.filter(v => v.status === 'active').slice(0, 5).map(v => ({
          id: v.id,
          name: `${v.make} ${v.model}`,
          value: 'Route #' + Math.floor(Math.random() * 1000),
          status: 'active',
          details: 'Currently on delivery route'
        })),
        metrics: {
          total: onRoute,
          active: onRoute,
          inactive: 0,
          change: { value: '+3', direction: 'up' }
        }
      }
    },
    {
      id: 'maintenance-due',
      title: 'Maintenance Due',
      value: maintenanceDue,
      description: 'Requiring attention',
      icon: Wrench,
      trend: maintenanceDue > 0 
        ? {
            value: `${maintenanceDue} due`,
            direction: 'down',
            change: 'needs attention'
          }
        : undefined,
      color: 'bg-amber-100 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      drillDownData: {
        items: vehicles.filter(v => v.status === 'maintenance').slice(0, 5).map(v => ({
          id: v.id,
          name: `${v.make} ${v.model}`,
          value: 'Overdue',
          status: 'maintenance',
          details: `Last service: ${v.last_service_date || 'Unknown'}`
        })),
        metrics: {
          total: maintenanceDue,
          active: 0,
          inactive: maintenanceDue,
          change: { value: maintenanceDue > 0 ? '+' + maintenanceDue : '0', direction: maintenanceDue > 0 ? 'down' : 'neutral' }
        }
      }
    }
  ], [totalVehicles, activeDrivers, onRoute, maintenanceDue, vehicles, drivers, vehicleStatusCounts]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([refetchVehicles(), refetchDrivers()]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchVehicles, refetchDrivers]);

  // Loading state
  const isLoading = isLoadingVehicles || isLoadingDrivers || isLoadingStats;

  // Show full page loading state on initial load
  if (isLoading && !isRefreshing) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your fleet.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            <span className="hidden md:inline">Last updated</span>
            <span className="mx-1">•</span>
            <time dateTime={lastUpdated.toISOString()}>
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </time>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
            disabled={isRefreshing}
            className="shrink-0"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {fleetStats.map((stat) => (
          <EnhancedStatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            trend={stat.trend}
            color={stat.color}
            iconColor={stat.iconColor}
            isLoading={isRefreshing}
            drillDownData={stat.drillDownData}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnhancedVehicleStatusChart 
          data={vehicleStatusData} 
          isLoading={isRefreshing || isLoading}
          vehicles={vehicles}
        />
        <EnhancedFleetUtilizationChart 
          data={fleetUtilizationData}
          isLoading={isRefreshing || isLoading}
          vehicles={vehicles}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fleet Overview */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Fleet Overview</CardTitle>
            <CardDescription>Summary of your fleet status and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="utilization">Utilization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Vehicles</p>
                    <p className="text-2xl font-bold">{totalVehicles}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Active</p>
                    <p className="text-2xl font-bold">{vehicleStatusCounts.active || 0}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Fleet Utilization</span>
                    <span>{utilizationRate}%</span>
                  </div>
                  <Progress value={utilizationRate} className="h-2" />
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{vehicleStatusCounts.active || 0}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{vehicleStatusCounts.maintenance || 0}</div>
                    <div className="text-xs text-muted-foreground">Maintenance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{vehicleStatusCounts.inactive || 0}</div>
                    <div className="text-xs text-muted-foreground">Inactive</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="utilization" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">On Route</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Progress value={(onRoute / (totalVehicles || 1)) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{onRoute}/{totalVehicles}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Available</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Progress 
                          value={((totalVehicles - onRoute) / (totalVehicles || 1)) * 100} 
                          className="h-2" 
                        />
                      </div>
                      <span className="text-sm font-medium">{totalVehicles - onRoute}/{totalVehicles}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Maintenance Due</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{
                              width: `${(maintenanceDue / (totalVehicles || 1)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{maintenanceDue}/{totalVehicles}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <ActivityFeed 
          activities={recentActivities}
          isLoading={isRefreshing || isLoading}
        />
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button variant="outline" className="flex flex-col h-24">
              <Truck className="h-5 w-5 mb-2" />
              <span>Add Vehicle</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-24">
              <Users className="h-5 w-5 mb-2" />
              <span>Add Driver</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-24">
              <MapPin className="h-5 w-5 mb-2" />
              <span>Track Vehicle</span>
            </Button>
            <Button variant="outline" className="flex flex-col h-24">
              <Wrench className="h-5 w-5 mb-2" />
              <span>Schedule Maintenance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
