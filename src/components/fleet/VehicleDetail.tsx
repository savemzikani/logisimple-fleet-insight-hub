import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useVehicleManagement } from '@/hooks/useVehicleManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Wrench, Fuel, Calendar, FileText, AlertCircle, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { VehicleStatus } from '@/types';

const statusVariant: Record<VehicleStatus, 'default' | 'destructive' | 'outline' | 'secondary' | 'success'> = {
  active: 'success',
  maintenance: 'destructive',
  inactive: 'outline',
  'in-route': 'default',
  'needs-service': 'destructive',
};

const statusIcon: Record<VehicleStatus, React.ReactNode> = {
  active: <CheckCircle2 className="h-4 w-4 mr-1" />,
  maintenance: <Wrench className="h-4 w-4 mr-1" />,
  inactive: <XCircle className="h-4 w-4 mr-1" />,
  'in-route': <MapPin className="h-4 w-4 mr-1" />,
  'needs-service': <AlertCircle className="h-4 w-4 mr-1" />,
};

interface VehicleDetailProps {
  onEdit?: (vehicle: any) => void;
  className?: string;
}

export function VehicleDetail({ onEdit, className = '' }: VehicleDetailProps) {
  const { companyId, vehicleId } = useParams<{ companyId: string; vehicleId: string }>();
  
  const { 
    selectedVehicle, 
    loading, 
    maintenanceHistory, 
    loadVehicle, 
    loadMaintenanceHistory,
    updateStatus 
  } = useVehicleManagement({
    companyId: companyId || '',
  });

  // Load vehicle details when component mounts or vehicleId changes
  useEffect(() => {
    if (vehicleId && companyId) {
      loadVehicle(vehicleId);
      loadMaintenanceHistory(vehicleId);
    }
  }, [vehicleId, companyId, loadVehicle, loadMaintenanceHistory]);

  if (loading && !selectedVehicle) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!selectedVehicle) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Truck className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No vehicle selected</h3>
        <p className="text-muted-foreground mt-2">
          Select a vehicle from the list to view details
        </p>
      </div>
    );
  }

  const {
    make,
    model,
    year,
    vin,
    license_plate,
    vehicle_type,
    status,
    color,
    fuel_type,
    fuel_efficiency,
    current_mileage,
    last_service_date,
    next_service_mileage,
    insurance_provider,
    insurance_policy_number,
    insurance_expiry,
    registration_expiry,
    notes,
    updated_at
  } = selectedVehicle;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const formatMileage = (miles: number | undefined) => {
    if (miles === undefined || miles === null) return 'N/A';
    return new Intl.NumberFormat('en-US').format(miles);
  };

  const handleStatusChange = async (newStatus: VehicleStatus) => {
    if (newStatus !== status) {
      await updateStatus(selectedVehicle.id, newStatus);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center">
            <Truck className="h-6 w-6 mr-2 text-primary" />
            {year} {make} {model}
            <Badge variant={statusVariant[status as VehicleStatus] || 'outline'} className="ml-3">
              {statusIcon[status as VehicleStatus]}
              {status.replace('-', ' ')}
            </Badge>
          </h2>
          <p className="text-muted-foreground mt-1">
            {vehicle_type} • {license_plate} • VIN: {vin}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit?.(selectedVehicle)}>
            Edit Vehicle
          </Button>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries({
                'active': 'Active',
                'inactive': 'Inactive',
                'in-route': 'In Route',
                'maintenance': 'Maintenance',
                'needs-service': 'Needs Service'
              }).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Mileage</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatMileage(current_mileage)}
              <span className="text-sm text-muted-foreground ml-1">mi</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated {formatDate(updated_at)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {fuel_efficiency || 'N/A'}
              <span className="text-sm text-muted-foreground ml-1">
                {fuel_efficiency ? 'MPG' : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {fuel_type || 'Fuel type not specified'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Service</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {next_service_mileage ? (
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {formatMileage(next_service_mileage)}
                  <span className="text-sm text-muted-foreground ml-1">mi</span>
                </div>
                {current_mileage && next_service_mileage && (
                  <p className="text-xs text-muted-foreground">
                    ~{Math.max(0, next_service_mileage - (current_mileage || 0)).toLocaleString()} miles remaining
                  </p>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Not scheduled</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Service</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(last_service_date) || 'N/A'}
            </div>
            {last_service_date && (
              <p className="text-xs text-muted-foreground">
                {Math.floor((new Date().getTime() - new Date(last_service_date).getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {insurance_provider || 'No provider'}
            </div>
            {insurance_expiry && (
              <div className="mt-1">
                <div className="flex items-center text-xs">
                  <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                  Expires {formatDate(insurance_expiry)}
                </div>
                {new Date(insurance_expiry) < new Date() && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Expired
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {license_plate || 'No plate'}
            </div>
            {registration_expiry && (
              <div className="mt-1">
                <div className="flex items-center text-xs">
                  <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                  Expires {formatDate(registration_expiry)}
                </div>
                {new Date(registration_expiry) < new Date() && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    Expired
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance History</CardTitle>
          <CardDescription>
            Recent service and maintenance records for this vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maintenanceHistory.length > 0 ? (
            <div className="space-y-4">
              {maintenanceHistory.map((record) => (
                <div key={record.id} className="border-l-4 border-primary pl-4 py-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{record.service_type}</h4>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(record.service_date)}
                    </div>
                  </div>
                  {record.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {record.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {record.mileage?.toLocaleString()} mi
                    </Badge>
                    {record.cost && (
                      <Badge variant="outline" className="text-xs">
                        ${record.cost.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Wrench className="h-8 w-8 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium">No maintenance records</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a maintenance record to track service history
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {notes.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
