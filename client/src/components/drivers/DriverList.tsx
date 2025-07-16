import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDriverManagement } from '@/hooks/useDriverManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Filter, Loader2, User, Phone, Mail, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Driver, DriverStatus } from '@/lib/types';

const statusVariant: Record<DriverStatus, 'default' | 'destructive' | 'outline' | 'secondary' | 'success'> = {
  active: 'success',
  inactive: 'outline',
  'on-leave': 'default',
  suspended: 'destructive',
};

const statusIcon: Record<DriverStatus, React.ReactNode> = {
  active: <CheckCircle2 className="h-4 w-4 mr-1" />,
  inactive: <XCircle className="h-4 w-4 mr-1" />,
  'on-leave': <Clock className="h-4 w-4 mr-1" />,
  suspended: <AlertCircle className="h-4 w-4 mr-1" />,
};

interface DriverListProps {
  onSelectDriver?: (driver: Driver) => void;
  selectedDriverId?: string;
  showActions?: boolean;
  className?: string;
}

export function DriverList({ onSelectDriver, selectedDriverId, showActions = true, className = '' }: DriverListProps) {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  
  const {
    drivers,
    isLoading,
    error,
    refetch,
    deleteDriver,
  } = useDriverManagement();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsFormOpen(true);
  };

  const handleDelete = async (driverId: string) => {
    if (window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      deleteDriver.mutate(driverId, {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Driver deleted successfully.',
          });
        }
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingDriver(null);
    refetch();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
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
          <h2 className="text-2xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">
            Manage your drivers and their information
          </p>
        </div>
        <Button onClick={() => {
          setEditingDriver(null);
          setIsFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Driver
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
                  placeholder="Search drivers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  
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
                  <TableHead>Driver</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading drivers...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !drivers || (Array.isArray(drivers) && drivers.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 6 : 5} className="h-24 text-center">
                      No drivers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  Array.isArray(drivers) && drivers.map((driver) => (
                    <TableRow 
                      key={driver.id} 
                      className={selectedDriverId === driver.id ? 'bg-muted/50' : ''}
                      onClick={() => onSelectDriver?.(driver)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium">{driver.first_name} {driver.last_name}</div>
                            <div className="text-sm text-muted-foreground">{driver.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 mr-1" />
                          {driver.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{driver.license_number || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {driver.license_expiry && `Exp ${formatDate(driver.license_expiry)}`}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={driver.is_active ? 'success' : 'outline'}>
                          {driver.is_active ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                          {driver.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {driver.created_at ? formatDate(driver.created_at) : 'N/A'}
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(driver);
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
                                handleDelete(driver.id);
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
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingDriver ? 'Edit Driver' : 'Add Driver'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Driver form will be implemented here
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingDriver(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleFormSuccess}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
