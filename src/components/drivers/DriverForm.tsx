import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, User, Mail, Phone, Home, FileText, Car, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Driver, DriverStatus } from '@/types';

// Define the form schema using Zod
const driverFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  license_number: z.string().min(1, 'License number is required'),
  license_expiry: z.date().optional(),
  license_class: z.string().min(1, 'License class is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  hire_date: z.date().optional(),
  status: z.string().min(1, 'Status is required'),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  notes: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverFormSchema>;

interface DriverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  driver?: Driver | null;
  onSuccess?: () => void;
}

export function DriverForm({ open, onOpenChange, companyId, driver, onSuccess }: DriverFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      license_number: '',
      license_class: 'C',
      status: 'active',
    },
  });

  // Set form values when editing a driver
  useEffect(() => {
    if (driver) {
      const driverData = {
        ...driver,
        license_expiry: driver.license_expiry ? new Date(driver.license_expiry) : undefined,
        hire_date: driver.hire_date ? new Date(driver.hire_date) : undefined,
      };
      
      // Set each field individually to ensure proper type conversion
      Object.entries(driverData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as keyof DriverFormValues, value as any);
        }
      });
    } else {
      form.reset();
    }
  }, [driver, form, open]);

  const onSubmit = async (data: DriverFormValues) => {
    try {
      setLoading(true);
      
      // Format dates to ISO strings for the API
      const formattedData = {
        ...data,
        license_expiry: data.license_expiry?.toISOString(),
        hire_date: data.hire_date?.toISOString(),
      };

      // Call the appropriate API based on whether we're creating or updating
      const response = driver
        ? await fetch(`/api/drivers/${driver.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedData),
          })
        : await fetch('/api/drivers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formattedData, company_id: companyId }),
          });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      toast({
        title: 'Success',
        description: driver ? 'Driver updated successfully' : 'Driver created successfully',
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving driver:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save driver',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {driver 
              ? 'Update the driver details below.' 
              : 'Fill in the details to add a new driver to your fleet.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="first_name"
                      placeholder="John"
                      className="pl-9"
                      {...form.register('first_name')}
                    />
                  </div>
                  {form.formState.errors.first_name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="last_name"
                      placeholder="Doe"
                      className="pl-9"
                      {...form.register('last_name')}
                    />
                  </div>
                  {form.formState.errors.last_name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="pl-9"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(123) 456-7890"
                      className="pl-9"
                      {...form.register('phone')}
                    />
                  </div>
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium pt-4">Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="123 Main St"
                      className="pl-9"
                      {...form.register('address')}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="City" {...form.register('city')} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input id="state" placeholder="State" {...form.register('state')} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input id="postal_code" placeholder="12345" {...form.register('postal_code')} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Country" {...form.register('country')} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* License & Employment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Driver's License</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="license_number">License Number *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="license_number"
                      placeholder="DL12345678"
                      className="pl-9"
                      {...form.register('license_number')}
                    />
                  </div>
                  {form.formState.errors.license_number && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.license_number.message}
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license_class">License Class *</Label>
                    <Select 
                      onValueChange={(value) => form.setValue('license_class', value)}
                      defaultValue={form.watch('license_class')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select license class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Class A (Tractor-Trailer)</SelectItem>
                        <SelectItem value="B">Class B (Straight Truck)</SelectItem>
                        <SelectItem value="C">Class C (Car/Light Truck)</SelectItem>
                        <SelectItem value="D">Class D (Car)</SelectItem>
                        <SelectItem value="M">Class M (Motorcycle)</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.license_class && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.license_class.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="license_expiry">Expiration Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.watch('license_expiry') && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('license_expiry') ? (
                            format(form.watch('license_expiry'), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch('license_expiry')}
                          onSelect={(date) => form.setValue('license_expiry', date || undefined)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select 
                    onValueChange={(value) => form.setValue('status', value as DriverStatus)}
                    defaultValue={form.watch('status')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.status.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.watch('hire_date') && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('hire_date') ? (
                          format(form.watch('hire_date'), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.watch('hire_date')}
                        onSelect={(date) => form.setValue('hire_date', date || undefined)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <h3 className="text-lg font-medium pt-4">Emergency Contact</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_name">Contact Name</Label>
                  <Input 
                    id="emergency_contact_name" 
                    placeholder="Emergency contact name" 
                    {...form.register('emergency_contact_name')} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="emergency_contact_phone"
                      type="tel"
                      placeholder="(123) 456-7890"
                      className="pl-9"
                      {...form.register('emergency_contact_phone')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional notes about this driver..." 
                  className="min-h-[100px]" 
                  {...form.register('notes')} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {driver ? 'Update Driver' : 'Add Driver'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dialog components (shadcn/ui)
function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[50%] sm:rounded-lg md:w-full">
        {children}
      </div>
    </div>
  );
}

function DialogContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("grid gap-4 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}
