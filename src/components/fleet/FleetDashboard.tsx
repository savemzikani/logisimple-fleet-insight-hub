import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { VehicleList } from './VehicleList';
import { VehicleDetail } from './VehicleDetail';
import { VehicleForm } from './VehicleForm';
import { Plus, X, PanelLeft, PanelRight } from 'lucide-react';

export function FleetDashboard() {
  const { companyId, vehicleId } = useParams<{ companyId: string; vehicleId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [showDetail, setShowDetail] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any>(null);

  // Check if we're in a detail view based on URL
  const isDetailView = !!vehicleId;

  // Handle back to list view
  const handleBackToList = () => {
    navigate(`/company/${companyId}/fleet`);
  };

  // Handle vehicle selection
  const handleSelectVehicle = (vehicle: any) => {
    navigate(`/company/${companyId}/fleet/vehicle/${vehicle.id}`);
  };

  // Handle edit vehicle
  const handleEditVehicle = (vehicle: any) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingVehicle(null);
    
    // If we were editing a vehicle, refresh the detail view
    if (editingVehicle) {
      // Force a remount of the detail view by navigating away and back
      const currentVehicleId = editingVehicle.id;
      navigate(`/company/${companyId}/fleet`);
      setTimeout(() => {
        navigate(`/company/${companyId}/fleet/vehicle/${currentVehicleId}`);
      }, 0);
    }
  };

  // Toggle detail view on mobile
  const toggleDetailView = () => {
    setShowDetail(!showDetail);
  };

  // Auto-show detail view on desktop when a vehicle is selected
  useEffect(() => {
    if (isDesktop && vehicleId) {
      setShowDetail(true);
    } else if (!isDesktop) {
      setShowDetail(false);
    }
  }, [isDesktop, vehicleId]);

  // Handle browser back/forward navigation
  useEffect(() => {
    if (isDesktop && vehicleId) {
      setShowDetail(true);
    }
  }, [location, isDesktop, vehicleId]);

  // If no company ID, show error
  if (!companyId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No company selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile header with back button when in detail view */}
      {!isDesktop && isDetailView && (
        <div className="flex items-center p-4 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToList}
            className="mr-2"
          >
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-semibold">Vehicle Details</h2>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Vehicle List (always visible on desktop, conditionally on mobile) */}
        {(!isDetailView || isDesktop) && (
          <div 
            className={cn(
              'w-full lg:w-1/3 xl:w-1/4 border-r',
              !isDesktop && !showDetail ? 'block' : 'hidden',
              isDesktop ? 'block' : 'absolute inset-0 z-10 bg-background',
              isDesktop ? 'h-auto' : 'h-full',
            )}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Fleet</h2>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingVehicle(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </div>
            <ScrollArea className="h-[calc(100%-65px)]">
              <VehicleList 
                onSelectVehicle={(vehicle) => {
                  handleSelectVehicle(vehicle);
                  if (!isDesktop) {
                    setShowDetail(true);
                  }
                }}
                selectedVehicleId={vehicleId}
                className="p-2"
              />
            </ScrollArea>
          </div>
        )}

        {/* Detail View */}
        {((isDesktop && vehicleId) || (showDetail && isDetailView)) && (
          <div className={cn(
            'flex-1',
            !isDesktop ? 'w-full' : 'w-2/3 xl:w-3/4',
            isDesktop ? 'block' : 'absolute inset-0 z-20 bg-background',
            isDesktop ? 'h-auto' : 'h-full',
          )}>
            {isDesktop && (
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Vehicle Details</h2>
                {vehicleId && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const vehicle = { id: vehicleId };
                      handleEditVehicle(vehicle);
                    }}
                  >
                    Edit Vehicle
                  </Button>
                )}
              </div>
            )}
            <ScrollArea className="h-[calc(100vh-65px)] lg:h-[calc(100vh-65px)]">
              <div className="p-4 lg:p-6">
                {vehicleId ? (
                  <VehicleDetail 
                    onEdit={handleEditVehicle} 
                    className="max-w-6xl mx-auto"
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    Select a vehicle to view details
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Mobile navigation buttons */}
      {!isDesktop && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-30">
          {!showDetail ? (
            <Button 
              variant="default" 
              size="icon" 
              className="rounded-full w-12 h-12 shadow-lg"
              onClick={() => {
                setEditingVehicle(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12 shadow-lg"
              onClick={toggleDetailView}
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
          
          {!showDetail && isDetailView && (
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12 shadow-lg"
              onClick={toggleDetailView}
            >
              <PanelRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      {/* Vehicle Form Modal */}
      <VehicleForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingVehicle(null);
          }
        }}
        companyId={companyId}
        vehicle={editingVehicle}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

// Utility function to conditionally join class names
function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
