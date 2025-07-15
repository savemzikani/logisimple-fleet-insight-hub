import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useDriverManagement } from '@/hooks/useDriverManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Phone, Mail, Home, FileText, Calendar, AlertCircle, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react';
import { DriverStatus } from '@/types';

const statusVariant: Record<DriverStatus, 'default' | 'destructive' | 'outline' | 'secondary' | 'success'> = {
  active: 'success',
  inactive: 'outline',
  'on-leave': 'default',
  suspended: 'destructive',
  terminated: 'destructive',
};

const statusIcon: Record<DriverStatus, React.ReactNode> = {
  active: <CheckCircle2 className="h-4 w-4 mr-1" />,
  inactive: <XCircle className="h-4 w-4 mr-1" />,
  'on-leave': <Clock className="h-4 w-4 mr-1" />,
  suspended: <AlertCircle className="h-4 w-4 mr-1" />,
  terminated: <XCircle className="h-4 w-4 mr-1" />,
};

interface DriverDetailProps {
  onEdit?: (driver: any) => void;
  className?: string;
}

export function DriverDetail({ onEdit, className = '' }: DriverDetailProps) {
  const { companyId, driverId } = useParams<{ companyId: string; driverId: string }>();
  
  const { 
    selectedDriver, 
    loading, 
    loadDriver,
  } = useDriverManagement({
    companyId: companyId || '',
  });

  // Load driver details when component mounts or driverId changes
  useEffect(() => {
    if (driverId && companyId) {
      loadDriver(driverId);
    }
  }, [driverId, companyId, loadDriver]);

  if (loading && !selectedDriver) {
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

  if (!selectedDriver) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">No driver selected</h3>
        <p className="text-muted-foreground mt-2">
          Select a driver from the list to view details
        </p>
      </div>
    );
  }

  const {
    first_name,
    last_name,
    email,
    phone,
    license_number,
    license_class,
    license_expiry,
    status,
    hire_date,
    address,
    city,
    state,
    postal_code,
    country,
    emergency_contact_name,
    emergency_contact_phone,
    notes,
    updated_at
  } = selectedDriver;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const daysSinceHire = hire_date 
    ? Math.floor((new Date().getTime() - new Date(hire_date).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const isLicenseExpired = license_expiry ? new Date(license_expiry) < new Date() : false;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {first_name} {last_name}
              <Badge variant={statusVariant[status as DriverStatus] || 'outline'} className="ml-3">
                {statusIcon[status as DriverStatus]}
                {status.replace('-', ' ')}
              </Badge>
            </h2>
            <p className="text-muted-foreground">
              {email} • {phone}
            </p>
          </div>
        </div>
        <Button onClick={() => onEdit?.(selectedDriver)}>
          Edit Driver
        </Button>
      </div>

      <Separator />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Driver Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hire_date ? formatDate(hire_date) : 'N/A'}
            </div>
            {daysSinceHire !== null && (
              <p className="text-sm text-muted-foreground">
                {daysSinceHire} days with the company
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Driver's License</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {license_number || 'N/A'}
              {license_class && <span className="ml-2 text-base font-normal">(Class {license_class})</span>}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              {license_expiry ? (
                <>
                  <Calendar className="h-4 w-4 mr-1" />
                  Expires {formatDate(license_expiry)}
                  {isLicenseExpired && (
                    <Badge variant="destructive" className="ml-2">
                      Expired
                    </Badge>
                  )}
                </>
              ) : 'Expiration not set'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <a href={`mailto:${email}`} className="hover:underline">
                {email}
              </a>
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              {phone || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address</CardTitle>
          </CardHeader>
          <CardContent>
            {address ? (
              <div className="space-y-2">
                <p>{address}</p>
                <p>
                  {[city, state, postal_code].filter(Boolean).join(', ')}
                  {country && <br />}
                  {country}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No address provided</p>
            )}
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent>
            {emergency_contact_name ? (
              <div className="space-y-2">
                <p className="font-medium">{emergency_contact_name}</p>
                {emergency_contact_phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {emergency_contact_phone}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No emergency contact provided</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {(notes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
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

      <div className="text-xs text-muted-foreground text-right">
        Last updated: {updated_at ? formatDate(updated_at) : 'Unknown'}
      </div>
    </div>
  );
}
