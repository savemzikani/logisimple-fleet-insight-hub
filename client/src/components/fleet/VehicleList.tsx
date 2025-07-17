import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useVehicleManagement } from '@/hooks/useVehicleManagement';
import { Vehicle, VehicleStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Loader2, Truck, AlertCircle, Wrench, CheckCircle2, XCircle } from 'lucide-react';
import { VehicleForm } from './VehicleForm';
import { format } from 'date-fns';

const statusVariant: Record<VehicleStatus, 'default' | 'destructive' | 'outline' | 'secondary' | 'success'> = {
  available: 'success',
  'in-use': 'default',
  maintenance: 'destructive',
  'out-of-service': 'destructive',
};

const statusIcon: Record<VehicleStatus, React.ReactNode> = {
  available: <CheckCircle2 className="h-4 w-4 mr-1" />,
  'in-use': <Truck className="h-4 w-4 mr-1" />,
  maintenance: <Wrench className="h-4 w-4 mr-1" />,
  'out-of-service': <XCircle className="h-4 w-4 mr-1" />,
};

interface VehicleListProps {
  onSelectVehicle?: (vehicle: Vehicle) => void;
  selectedVehicleId?: string;
  showActions?: boolean;
  className?: string;
}

export function VehicleList({ onSelectVehicle, selectedVehicleId, showActions = true, className = '' }: VehicleListProps) {
  const { companyId } = useParams<{ companyId: string }>();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
  
  const {
    vehicles,
    isLoading,
    error,
    refetch,
    deleteVehicle,
  } = useVehicleManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      deleteVehicle.mutate(vehicleId, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Vehicle deleted successfully.',
          });
        }
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingVehicle(undefined);
    refetch();
  };

  if (!companyId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No company selected.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Management</h2>
          <p className="text-muted-foreground">
            Manage your vehicles and their status
          </p>
        </div>
        <Button onClick={() => {
          setEditingVehicle(undefined);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search vehicles..."
                  className="w-full pl-8 sm:w-[300px]"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
                <Select
                  value={statusFilter}
                  onValueChange={handleStatusFilter}
                >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="in-use">In Use</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out-of-service">Out of Service</SelectItem>
                  </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>VIN</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 7 : 6} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading vehicles...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !vehicles || (Array.isArray(vehicles) && vehicles.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 7 : 6} className="h-24 text-center">
                      No vehicles found.
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(vehicles) && vehicles.map((vehicle) => (
                    <TableRow 
                      key={vehicle.id} 
                      className={selectedVehicleId === vehicle.id ? 'bg-muted/50' : ''}
                      onClick={() => onSelectVehicle?.(vehicle)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Truck className="mr-2 h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                            <div className="text-sm text-muted-foreground">Vehicle</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{vehicle.license_plate}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {vehicle.vin}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[vehicle.status as VehicleStatus] || 'outline'}>
                          {statusIcon[vehicle.status as VehicleStatus]}
                          {vehicle.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vehicle.updated_at 
                          ? format(new Date(vehicle.updated_at), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(vehicle);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(vehicle.id);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <VehicleForm
            vehicle={editingVehicle || undefined}
            onSubmit={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
