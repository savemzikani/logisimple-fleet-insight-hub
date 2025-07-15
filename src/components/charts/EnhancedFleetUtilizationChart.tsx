import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DetailModal } from '@/components/modals/DetailModal';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Truck, 
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wrench
} from 'lucide-react';

interface FleetUtilizationData {
  name: string;
  value: number;
  color: string;
  vehicles?: Array<{
    id: string;
    make: string;
    model: string;
    license_plate: string;
    status: string;
    current_location?: string;
    assignment?: {
      driver_name: string;
      route: string;
      start_time: string;
    };
  }>;
}

interface EnhancedFleetUtilizationChartProps {
  data: FleetUtilizationData[];
  isLoading?: boolean;
  onSegmentClick?: (segment: string) => void;
  vehicles?: Array<any>;
}

const SEGMENT_ICONS = {
  'In Use': MapPin,
  'Available': CheckCircle,
  'Maintenance': Wrench,
  'Inactive': AlertTriangle
};

export function EnhancedFleetUtilizationChart({ 
  data, 
  isLoading = false, 
  onSegmentClick,
  vehicles = []
}: EnhancedFleetUtilizationChartProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const handleSegmentClick = (data: any) => {
    if (data && data.name) {
      setSelectedSegment(data.name);
      onSegmentClick?.(data.name);
    }
  };

  const getSegmentVehicles = (segmentName: string) => {
    return vehicles.filter(v => {
      const vehicleStatus = v.status?.toLowerCase();
      const segment = segmentName.toLowerCase();
      
      switch (segment) {
        case 'in use':
          return vehicleStatus === 'active' || vehicleStatus === 'in_use';
        case 'available':
          return vehicleStatus === 'available';
        case 'maintenance':
          return vehicleStatus === 'maintenance';
        case 'inactive':
          return vehicleStatus === 'inactive';
        default:
          return false;
      }
    });
  };

  const renderDetailedView = () => {
    if (!selectedSegment) return null;

    const segmentVehicles = getSegmentVehicles(selectedSegment);
    const SegmentIcon = SEGMENT_ICONS[selectedSegment as keyof typeof SEGMENT_ICONS];
    const segmentData = data.find(d => d.name === selectedSegment);

    return (
      <DetailModal
        isOpen={!!selectedSegment}
        onClose={() => setSelectedSegment(null)}
        title={`${selectedSegment} Vehicles`}
        description={`Detailed view of ${segmentVehicles.length} vehicles in ${selectedSegment.toLowerCase()} category`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Segment Summary */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <div className="p-3 rounded-full bg-background">
              <SegmentIcon className="h-6 w-6" style={{ color: segmentData?.color }} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedSegment}</h3>
              <p className="text-muted-foreground">
                {segmentVehicles.length} vehicle{segmentVehicles.length !== 1 ? 's' : ''} in this category
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{segmentData?.value || 0}</div>
              <div className="text-sm text-muted-foreground">
                {data.length > 0 ? Math.round((segmentData?.value || 0) / data.reduce((acc, curr) => acc + curr.value, 0) * 100) : 0}%
              </div>
            </div>
          </div>

          {/* Vehicles List */}
          <div className="space-y-3">
            {segmentVehicles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No vehicles found in {selectedSegment.toLowerCase()} category
              </p>
            ) : (
              segmentVehicles.map((vehicle) => (
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
                      {vehicle.current_location && (
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {vehicle.current_location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" style={{ 
                      borderColor: segmentData?.color,
                      color: segmentData?.color
                    }}>
                      {vehicle.status}
                    </Badge>
                    {vehicle.assignment && (
                      <div className="text-xs text-muted-foreground text-right">
                        <div>Driver: {vehicle.assignment.driver_name}</div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(vehicle.assignment.start_time).toLocaleTimeString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              View Analytics
            </Button>
          </div>
        </div>
      </DetailModal>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization</CardTitle>
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
            <CardTitle>Fleet Utilization</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'pie' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  onClick={handleSegmentClick}
                  cursor="pointer"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value, 
                    `${name} (${Math.round((value / data.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%)`
                  ]}
                />
                <Legend />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Vehicles']}
                  labelFormatter={(label) => `Category: ${label}`}
                  cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Vehicles" 
                  radius={[4, 4, 0, 0]}
                  onClick={handleSegmentClick}
                  cursor="pointer"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {renderDetailedView()}
    </>
  );
}