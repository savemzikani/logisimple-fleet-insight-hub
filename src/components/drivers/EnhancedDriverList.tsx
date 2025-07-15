import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDriverManagement } from '@/hooks/useDriverManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Filter, Loader2, User, Phone, Mail, AlertCircle, CheckCircle2, XCircle, Clock, MoreVertical, FileText, Download, Calendar, Car } from 'lucide-react';
import { Driver, DriverStatus } from '@/types';

export function EnhancedDriverList({
  onSelectDriver,
  selectedDriverId,
  showActions = true,
  className = '',
  onAddDocument,
  onViewHistory,
  onExport,
  onAssignVehicle,
  onStatusChange,
  showBulkActions = false,
  onBulkAction
}: {
  onSelectDriver?: (driver: Driver) => void;
  selectedDriverId?: string;
  showActions?: boolean;
  className?: string;
  onAddDocument?: (driver: Driver) => void;
  onViewHistory?: (driver: Driver) => void;
  onExport?: (driver: Driver) => void;
  onAssignVehicle?: (driver: Driver) => void;
  onStatusChange?: (driver: Driver, newStatus: DriverStatus) => void;
  showBulkActions?: boolean;
  onBulkAction?: (action: string, driverIds: string[]) => void;
}) {
  const { companyId } = useParams<{ companyId: string }>();
  const { toast } = useToast();
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseExpiring, setLicenseExpiring] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    drivers, 
    loading, 
    pagination, 
    loadNextPage, 
    deleteDriver, 
    updateDriverStatus 
  } = useDriverManagement({
    companyId: companyId || '',
    status: 'active',
    pageSize: 10,
  });

  // Filter drivers based on search and filters
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      // Status filter
      if (statusFilter !== 'all' && driver.status !== statusFilter) {
        return false;
      }
      
      // License expiring filter
      if (licenseExpiring) {
        if (!driver.license_expiry) return false;
        const expiryDate = new Date(driver.license_expiry);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry > 30) return false; // Only show licenses expiring within 30 days
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${driver.first_name} ${driver.last_name}`.toLowerCase();
        const matchesName = fullName.includes(query);
        const matchesEmail = driver.email?.toLowerCase().includes(query) || false;
        const matchesPhone = driver.phone?.toLowerCase().includes(query) || false;
        const matchesLicense = driver.license_number?.toLowerCase().includes(query) || false;
        
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesLicense) {
          return false;
        }
      }
      
      return true;
    });
  }, [drivers, statusFilter, licenseExpiring, searchQuery]);

  const handleStatusChange = async (driver: Driver, newStatus: DriverStatus) => {
    try {
      await updateDriverStatus(driver.id, newStatus);
      toast({
        title: 'Success',
        description: `Driver status updated to ${newStatus}`,
      });
      onStatusChange?.(driver, newStatus);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update driver status',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedDrivers.length === 0) {
      toast({
        title: 'No drivers selected',
        description: 'Please select at least one driver',
        variant: 'destructive',
      });
      return;
    }
    
    onBulkAction?.(action, selectedDrivers);
    setSelectedDrivers([]);
  };

  const toggleDriverSelection = (driverId: string) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDrivers.length === filteredDrivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(filteredDrivers.map(driver => driver.id));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search drivers..."
              className="w-full pl-8 sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="on-leave">On Leave</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={() => setLicenseExpiring(!licenseExpiring)}>
            <AlertCircle className={`h-4 w-4 mr-2 ${licenseExpiring ? 'text-amber-500' : 'text-muted-foreground'}`} />
            License Expiring
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport?.('current')}>
                Current View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('all')}>
                All Drivers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport?.('selected')} disabled={selectedDrivers.length === 0}>
                Selected ({selectedDrivers.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Bulk Actions */}
      {showBulkActions && selectedDrivers.length > 0 && (
        <div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
          <div className="text-sm text-muted-foreground">
            {selectedDrivers.length} driver{selectedDrivers.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('email')}>
              <Mail className="h-4 w-4 mr-2" />
              Email Selected
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('status')}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Update Status
            </Button>
            <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleBulkAction('delete')}>
              <XCircle className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      
      {/* Drivers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {showBulkActions && (
                <TableHead className="w-10">
                  <Checkbox 
                    checked={selectedDrivers.length > 0 && selectedDrivers.length === filteredDrivers.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead>Driver</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
              {showActions && <TableHead className="w-10">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && drivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading drivers...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 7 : 6} className="h-24 text-center">
                  No drivers found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow 
                  key={driver.id} 
                  className={selectedDriverId === driver.id ? 'bg-muted/50' : ''}
                  onClick={() => onSelectDriver?.(driver)}
                >
                  {showBulkActions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedDrivers.includes(driver.id)}
                        onCheckedChange={() => toggleDriverSelection(driver.id)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Select ${driver.first_name} ${driver.last_name}`}
                      />
                    </TableCell>
                  )}
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
                        {driver.license_class ? `Class ${driver.license_class}` : ''}
                        {driver.license_expiry && (
                          <span className={new Date(driver.license_expiry) < new Date() ? 'text-destructive' : ''}>
                            {` • Exp ${new Date(driver.license_expiry).toLocaleDateString()}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(driver.status as DriverStatus)}>
                      {getStatusIcon(driver.status as DriverStatus)}
                      {driver.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {driver.hire_date ? new Date(driver.hire_date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onSelectDriver?.(driver);
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAssignVehicle?.(driver);
                          }}>
                            <Car className="h-4 w-4 mr-2" />
                            Assign Vehicle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onAddDocument?.(driver);
                          }}>
                            <FileText className="h-4 w-4 mr-2" />
                            Add Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            onViewHistory?.(driver);
                          }}>
                            <Calendar className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <StatusChangeMenu 
                            currentStatus={driver.status as DriverStatus}
                            onStatusChange={(newStatus) => handleStatusChange(driver, newStatus)}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {pagination.hasMore && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => loadNextPage()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusChangeMenu({ currentStatus, onStatusChange }: { currentStatus: DriverStatus, onStatusChange: (status: DriverStatus) => void }) {
  const statuses: { value: DriverStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'active', label: 'Set as Active', icon: <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> },
    { value: 'inactive', label: 'Set as Inactive', icon: <XCircle className="h-4 w-4 mr-2 text-gray-500" /> },
    { value: 'on-leave', label: 'Set as On Leave', icon: <Clock className="h-4 w-4 mr-2 text-amber-500" /> },
    { value: 'suspended', label: 'Suspend', icon: <AlertCircle className="h-4 w-4 mr-2 text-amber-500" /> },
    { value: 'terminated', label: 'Terminate', icon: <XCircle className="h-4 w-4 mr-2 text-red-500" /> },
  ];

  return (
    <>
      <DropdownMenuLabel>Change Status</DropdownMenuLabel>
      <DropdownMenuSeparator />
      {statuses
        .filter(status => status.value !== currentStatus)
        .map((status) => (
          <DropdownMenuItem 
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            className={status.value === 'terminated' ? 'text-destructive' : ''}
          >
            {status.icon}
            {status.label}
          </DropdownMenuItem>
        ))}
    </>
  );
}

function getStatusVariant(status: DriverStatus) {
  const variants: Record<DriverStatus, 'default' | 'destructive' | 'outline' | 'secondary' | 'success'> = {
    active: 'success',
    inactive: 'outline',
    'on-leave': 'default',
    suspended: 'destructive',
    terminated: 'destructive',
  };
  return variants[status] || 'outline';
}

function getStatusIcon(status: DriverStatus) {
  const icons: Record<DriverStatus, React.ReactNode> = {
    active: <CheckCircle2 className="h-4 w-4 mr-1" />,
    inactive: <XCircle className="h-4 w-4 mr-1" />,
    'on-leave': <Clock className="h-4 w-4 mr-1" />,
    suspended: <AlertCircle className="h-4 w-4 mr-1" />,
    terminated: <XCircle className="h-4 w-4 mr-1" />,
  };
  return icons[status] || null;
}

// Add these missing components if not already available in your UI library
function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-muted" />;
}

function DropdownMenuLabel({ children, className, ...props }: { children: React.ReactNode, className?: string }) {
  return (
    <div 
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    >
      {children}
    </div>
  );
}
