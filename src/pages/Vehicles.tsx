import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Plus, Search, Filter, MapPin, Wrench, Fuel } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  vehicle_type: string;
  status: string;
  created_at: string;
}

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    license_plate: "",
    vehicle_type: "truck",
    status: "active"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch vehicles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, get the user's company_id from their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from('vehicles')
        .insert([{ ...formData, company_id: profile.company_id }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        vin: "",
        license_plate: "",
        vehicle_type: "truck",
        status: "active"
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'out-of-service': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex-1 p-6">Loading vehicles...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fleet Vehicles</h1>
          <p className="text-muted-foreground mt-1">
            Manage your fleet vehicles and track their status
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Enter the vehicle details to add it to your fleet.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Type</Label>
                  <Select
                    value={formData.vehicle_type}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="trailer">Trailer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_plate">License Plate</Label>
                <Input
                  id="license_plate"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Add Vehicle
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search vehicles..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="out-of-service">Out of Service</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="fleet-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription>
                      {vehicle.year} • {vehicle.vehicle_type}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(vehicle.status)}>
                  {vehicle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License Plate:</span>
                  <span className="font-medium">{vehicle.license_plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VIN:</span>
                  <span className="font-mono text-xs">{vehicle.vin.slice(-8)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  Track
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Wrench className="w-4 h-4 mr-1" />
                  Service
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Fuel className="w-4 h-4 mr-1" />
                  Fuel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No vehicles found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first vehicle to the fleet"
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Vehicles;