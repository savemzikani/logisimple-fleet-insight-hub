import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Users, MapPin, Wrench, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  // Mock data for demonstration
  const fleetStats = [
    { title: "Total Vehicles", value: "24", icon: Truck, change: "+2", trend: "up" },
    { title: "Active Drivers", value: "18", icon: Users, change: "0", trend: "neutral" },
    { title: "On Route", value: "12", icon: MapPin, change: "+3", trend: "up" },
    { title: "Maintenance Due", value: "3", icon: Wrench, change: "-1", trend: "down" },
  ];

  const fuelData = [
    { month: "Jan", cost: 2400 },
    { month: "Feb", cost: 2100 },
    { month: "Mar", cost: 2800 },
    { month: "Apr", cost: 2300 },
    { month: "May", cost: 2600 },
    { month: "Jun", cost: 2900 },
  ];

  const vehicleStatusData = [
    { name: "Active", value: 18, color: "hsl(var(--status-active))" },
    { name: "Maintenance", value: 3, color: "hsl(var(--status-maintenance))" },
    { name: "Inactive", value: 3, color: "hsl(var(--status-inactive))" },
  ];

  const recentAlerts = [
    { id: 1, type: "maintenance", message: "Vehicle FL-001 scheduled maintenance due in 2 days", time: "2 hours ago" },
    { id: 2, type: "fuel", message: "High fuel consumption detected for TR-456", time: "4 hours ago" },
    { id: 3, type: "route", message: "Driver John Doe completed route ahead of schedule", time: "6 hours ago" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Fleet Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor your fleet performance and operations in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {fleetStats.map((stat, index) => (
          <Card key={index} className="fleet-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className={`mr-1 h-3 w-3 ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`} />
                {stat.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fuel Costs Chart */}
        <Card className="fleet-card">
          <CardHeader>
            <CardTitle>Fuel Costs Trend</CardTitle>
            <CardDescription>Monthly fuel expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fuelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Fuel Cost']} />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Vehicle Status Distribution */}
        <Card className="fleet-card">
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
            <CardDescription>Current status distribution of your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {vehicleStatusData.map((status, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <span className="text-sm">{status.name}: {status.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="fleet-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Alerts
          </CardTitle>
          <CardDescription>Important notifications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  alert.type === 'maintenance' ? 'bg-yellow-500' : 
                  alert.type === 'fuel' ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                </div>
                <Badge variant={alert.type === 'maintenance' ? 'outline' : 'secondary'}>
                  {alert.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;