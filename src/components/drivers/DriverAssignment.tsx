import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDriverManagement } from '@/hooks/useDriverManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Car, Clock, Loader2, User, X } from 'lucide-react';
import { format } from 'date-fns';

type Assignment = {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'upcoming' | 'completed' | 'cancelled';
  notes: string | null;
};

type VehicleOption = {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
};

export function DriverAssignment({ driverId }: { driverId: string }) {
  const { companyId } = useParams<{ companyId: string }>();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<VehicleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const { 
    getDriverAssignments, 
    getAvailableVehicles, 
    assignVehicleToDriver, 
    unassignVehicleFromDriver,
    endDriverAssignment 
  } = useDriverManagement({
    companyId: companyId || '',
  });

  // Load assignments and available vehicles
  useEffect(() => {
    if (driverId && companyId) {
      loadData();
    }
  }, [driverId, companyId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load current assignments
      const currentAssignments = await getDriverAssignments(driverId);
      setAssignments(currentAssignments);
      
      // Load available vehicles
      const vehicles = await getAvailableVehicles();
      setAvailableVehicles(vehicles);
      
      // If there are no assignments, show the assignment form by default
      if (currentAssignments.length === 0) {
        setShowAssignmentForm(true);
      }
    } catch (error) {
      console.error('Error loading assignment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicleId) {
      toast({
        title: 'Error',
        description: 'Please select a vehicle',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsAssigning(true);
      
      await assignVehicleToDriver(driverId, selectedVehicleId, {
        start_date: startDate,
        end_date: endDate || null,
        notes: notes || null,
      });
      
      toast({
        title: 'Success',
        description: 'Vehicle assigned successfully',
      });
      
      // Reset form and reload data
      setSelectedVehicleId('');
      setStartDate(format(new Date(), 'yyyy-MM-dd'));
      setEndDate('');
      setNotes('');
      setShowAssignmentForm(false);
      
      await loadData();
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign vehicle',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEndAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to end this assignment?')) {
      return;
    }
    
    try {
      await endDriverAssignment(assignmentId);
      
      toast({
        title: 'Success',
        description: 'Assignment ended successfully',
      });
      
      await loadData();
    } catch (error) {
      console.error('Error ending assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to end assignment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case 'upcoming':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Upcoming</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'Unknown Vehicle';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.license_plate})`;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vehicle Assignments</CardTitle>
            <CardDescription>Manage vehicle assignments for this driver</CardDescription>
          </div>
          {!showAssignmentForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignmentForm(true)}
              disabled={isLoading || isAssigning}
            >
              <Car className="h-4 w-4 mr-2" />
              Assign Vehicle
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showAssignmentForm && (
          <Card className="mb-6 border-dashed">
            <CardContent className="pt-6">
              <form onSubmit={handleAssignVehicle}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Vehicle <span className="text-destructive">*</span>
                    </label>
                    <Select 
                      value={selectedVehicleId} 
                      onValueChange={setSelectedVehicleId}
                      disabled={isAssigning}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableVehicles.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No available vehicles
                          </div>
                        ) : (
                          availableVehicles.map(vehicle => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      Start Date <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      disabled={isAssigning}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={isAssigning}
                    />
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <Button 
                      type="submit" 
                      disabled={!selectedVehicleId || isAssigning}
                      className="w-full"
                    >
                      {isAssigning ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        'Assign Vehicle'
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAssignmentForm(false)}
                      disabled={isAssigning}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="text-sm font-medium leading-none">
                    Notes (Optional)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this assignment"
                    disabled={isAssigning}
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-8">
            <Car className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">No vehicle assignments</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {showAssignmentForm 
                ? 'Select a vehicle to assign' 
                : 'Get started by assigning a vehicle.'}
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Car className="h-5 w-5 mr-2 text-muted-foreground" />
                        {getVehicleName(assignment.vehicle_id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(assignment.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(assignment.start_date), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.end_date ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {format(new Date(assignment.end_date), 'MMM d, yyyy')}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Ongoing</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {assignment.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleEndAssignment(assignment.id)}
                          disabled={isAssigning}
                        >
                          <X className="h-4 w-4 mr-1" />
                          End Assignment
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
