import { useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DetailModal } from '@/components/modals/DetailModal';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Truck, 
  Wrench, 
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';

type StatusData = {
  status: string;
  count: number;
  vehicles?: Array<{
    id: string;
    make: string;
    model: string;
    license_plate: string;
    status: string;
    last_service_date?: string;
  }>;
};

interface EnhancedVehicleStatusChartProps {
  data: StatusData[];
  isLoading?: boolean;
  onStatusClick?: (status: string) => void;
  vehicles?: Array<any>;
}

const STATUS_COLORS = {
  'Active': '#10b981',
  'Maintenance': '#f59e0b', 
  'Inactive': '#ef4444'
};

const STATUS_ICONS = {
  'Active': CheckCircle,
  'Maintenance': Wrench,
  'Inactive': AlertTriangle
};

export function EnhancedVehicleStatusChart({ 
  data, 
  isLoading = false, 
  onStatusClick,
  vehicles = []
}: EnhancedVehicleStatusChartProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  const handleBarClick = (data: any) => {
    if (data && data.status) {
      setSelectedStatus(data.status);
      onStatusClick?.(data.status);
    }
  };

  const getStatusVehicles = (status: string) => {
    return vehicles.filter(v => {
      const vehicleStatus = v.status?.toLowerCase();
      const targetStatus = status.toLowerCase();
      return vehicleStatus === targetStatus || 
             (targetStatus === 'active' && vehicleStatus === 'available') ||
             (targetStatus === 'maintenance' && vehicleStatus === 'maintenance') ||
             (targetStatus === 'inactive' && vehicleStatus === 'inactive');
    });
  };

  const renderDetailedView = () => {
    if (!selectedStatus) return null;

    const statusVehicles = getStatusVehicles(selectedStatus);
    const StatusIcon = STATUS_ICONS[selectedStatus as keyof typeof STATUS_ICONS];

    return (
      <DetailModal
        isOpen={!!selectedStatus}
        onClose={() => setSelectedStatus(null)}
        title={`${selectedStatus} Vehicles`}
        description={`Detailed view of ${statusVehicles.length} vehicles in ${selectedStatus.toLowerCase()} status`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Status Summary */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <div className="p-3 rounded-full bg-background">
              <StatusIcon className="h-6 w-6" style={{ color: STATUS_COLORS[selectedStatus as keyof typeof STATUS_COLORS] }} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{selectedStatus} Status</h3>
              <p className="text-muted-foreground">
                {statusVehicles.length} vehicle{statusVehicles.length !== 1 ? 's' : ''} currently in this status
              </p>
            </div>
          </div>

          {/* Vehicles List */}
          <div className="space-y-3">
            {statusVehicles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No vehicles found in {selectedStatus.toLowerCase()} status
              </p>
            ) : (
              statusVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-background rounded-md">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {vehicle.license_plate || 'No license plate'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" style={{ 
                      borderColor: STATUS_COLORS[selectedStatus as keyof typeof STATUS_COLORS],
                      color: STATUS_COLORS[selectedStatus as keyof typeof STATUS_COLORS]
                    }}>
                      {vehicle.status}
                    </Badge>
                    {vehicle.last_service_date && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        Last service: {new Date(vehicle.last_service_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DetailModal>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Status</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle Status</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                <PieChart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="status" 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => [value, 'Vehicles']}
                labelFormatter={(label) => `Status: ${label}`}
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                name="Vehicles" 
                radius={[4, 4, 0, 0]}
                onClick={handleBarClick}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {renderDetailedView()}
    </>
  );
}