import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Vehicle } from '@/lib/types';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: vehicle || {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      license_plate: '',
      status: 'available',
      mileage: 0,
    },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input id="make" {...register('make', { required: true })} />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...register('model', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                {...register('year', { required: true, valueAsNumber: true })}
              />
            </div>
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                {...register('mileage', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vin">VIN</Label>
            <Input id="vin" {...register('vin')} />
          </div>

          <div>
            <Label htmlFor="license_plate">License Plate</Label>
            <Input id="license_plate" {...register('license_plate')} />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="in-use">In Use</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="out-of-service">Out of Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit">
              {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};