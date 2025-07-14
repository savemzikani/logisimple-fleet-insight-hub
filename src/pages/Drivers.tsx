import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Search, Filter, Phone, Mail, Calendar, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Driver {
  id: string;
  employee_id: string;
  personal_info: any;
  license_info: any;
  certifications: any;
  emergency_contacts: any;
  performance_metrics: any;
  status: string;
  created_at: string;
}

const Drivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    license_number: "",
    license_class: "CDL-A",
    license_expiry: "",
    hire_date: "",
    status: "active"
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDrivers(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch drivers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get the user's company_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profileError) throw profileError;

      const driverData = {
        company_id: profile.company_id,
        employee_id: formData.employee_id,
        personal_info: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          hire_date: formData.hire_date
        },
        license_info: {
          license_number: formData.license_number,
          license_class: formData.license_class,
          license_expiry: formData.license_expiry
        },
        certifications: {},
        emergency_contacts: {},
        performance_metrics: {
          total_trips: 0,
          miles_driven: 0,
          safety_score: 100,
          fuel_efficiency: 0
        },
        status: formData.status
      };

      const { error } = await supabase
        .from('drivers')
        .insert([driverData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Driver added successfully",
      });

      setIsDialogOpen(false);
      setFormData({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        license_number: "",
        license_class: "CDL-A",
        license_expiry: "",
        hire_date: "",
        status: "active"
      });
      fetchDrivers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add driver",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const fullName = `${driver.personal_info?.first_name || ''} ${driver.personal_info?.last_name || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      driver.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.personal_info?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex-1 p-6">Loading drivers...</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Drivers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your fleet drivers and track their performance
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>
                Enter the driver details to add them to your fleet.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Employee ID</Label>
                  <Input
                    id="employee_id"
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_class">License Class</Label>
                  <Select
                    value={formData.license_class}
                    onValueChange={(value) => setFormData({ ...formData, license_class: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDL-A">CDL Class A</SelectItem>
                      <SelectItem value="CDL-B">CDL Class B</SelectItem>
                      <SelectItem value="CDL-C">CDL Class C</SelectItem>
                      <SelectItem value="Regular">Regular License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="license_expiry">License Expiry</Label>
                <Input
                  id="license_expiry"
                  type="date"
                  value={formData.license_expiry}
                  onChange={(e) => setFormData({ ...formData, license_expiry: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Add Driver
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
            placeholder="Search drivers..."
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
            <SelectItem value="on-leave">On Leave</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drivers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="fleet-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {driver.personal_info?.first_name} {driver.personal_info?.last_name}
                    </CardTitle>
                    <CardDescription>
                      ID: {driver.employee_id}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(driver.status)}>
                  {driver.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{driver.personal_info?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{driver.personal_info?.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{driver.license_info?.license_class}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    Hired: {driver.personal_info?.hire_date ? new Date(driver.personal_info.hire_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {driver.performance_metrics?.total_trips || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Trips</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {driver.performance_metrics?.safety_score || 100}
                    </div>
                    <div className="text-xs text-muted-foreground">Safety</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {Math.round(driver.performance_metrics?.miles_driven || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Miles</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No drivers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first driver to the fleet"
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Driver
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Drivers;