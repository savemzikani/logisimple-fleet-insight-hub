import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the driver with company info
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('company_id')
      .eq('id', driverId)
      .single();

    if (driverError || !driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', driver.company_id)
      .single();

    if (companyError || !companyMember) {
      return NextResponse.json(
        { error: 'Unauthorized access to driver' },
        { status: 403 }
      );
    }

    // Check if user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', driver.company_id)
      .eq('status', 'active')
      .in('role', ['admin', 'manager', 'dispatcher'])
      .single();

    if (companyError) {
      console.error('Error verifying user permissions:', companyError);
      return NextResponse.json(
        { 
          error: 'Failed to verify user permissions',
          details: companyError.message
        },
        { status: 500 }
      );
    }

    if (!companyMember) {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get assignments with vehicle details
    const { data: assignments, error: assignmentsError } = await supabase
      .from('driver_assignments')
      .select(`
        *,
        vehicle:vehicles(*),
        assigned_by:user_profiles(id, email, full_name)
      `)
      .eq('driver_id', driverId)
      .order('start_date', { ascending: false });

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch assignments',
          details: assignmentsError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      assignments,
      total: assignments?.length || 0,
      driver_status: driver.status
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Must be authenticated' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validation = AssignmentRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { vehicle_id, start_date, notes } = validation.data;

    // Get the driver with company info
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, company_id, status')
      .eq('id', driverId)
      .single();

    if (driverError) {
      console.error('Error fetching driver:', driverError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch driver information',
          details: driverError.message
        },
        { status: 500 }
      );
    }

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', driver.company_id)
      .eq('status', 'active')
      .in('role', ['admin', 'manager', 'dispatcher'])
      .single();

    if (companyError) {
      console.error('Error verifying user permissions:', companyError);
      return NextResponse.json(
        { 
          error: 'Failed to verify user permissions',
          details: companyError.message
        },
        { status: 500 }
      );
    }

    if (!companyMember) {
      return NextResponse.json(
        { error: 'Unauthorized: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if the vehicle exists and belongs to the same company
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, company_id, status')
      .eq('id', vehicle_id)
      .eq('company_id', driver.company_id)
      .single();

    if (vehicleError) {
      console.error('Error fetching vehicle:', vehicleError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch vehicle information',
          details: vehicleError.message
        },
        { status: 500 }
      );
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to this company' },
        { status: 404 }
      );
    }

    if (vehicle.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot assign inactive vehicle' },
        { status: 403 }
      );
    }

    // Check if the driver is active
    if (driver.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot assign vehicle to inactive driver' },
        { status: 403 }
      );
    }

    // Check if the driver already has an active assignment
    const { data: activeAssignment, error: activeError } = await supabase
      .from('driver_assignments')
      .select('id')
      .eq('driver_id', driverId)
      .is('end_date', null)
      .single();

    if (activeError) {
      console.error('Error checking active assignments:', activeError);
      return NextResponse.json(
        { 
          error: 'Failed to check active assignments',
          details: activeError.message
        },
        { status: 500 }
      );
    }

    if (activeAssignment) {
      return NextResponse.json(
        { error: 'Driver already has an active assignment' },
        { status: 403 }
      );
    }

    // Create the assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('driver_assignments')
      .insert({
        driver_id: driverId,
        vehicle_id,
        start_date: new Date(start_date).toISOString(),
        assigned_by: user.id,
        notes,
        status: 'active',
        assigned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError || !assignment) {
      console.error('Error creating assignment:', createError);
      return NextResponse.json(
        { error: 'Failed to create assignment' },
        { status: 500 }
      );
    }

    // Update the vehicle status to 'assigned'
    const { error: updateVehicleError } = await supabase
      .from('vehicles')
      .update({ status: 'assigned' })
      .eq('id', vehicle_id);

    if (updateVehicleError) {
      console.error('Error updating vehicle status:', updateVehicleError);
      // Continue even if this fails, as the assignment was created
    }

    // Get the full assignment data with vehicle info
    const { data: fullAssignment, error: fetchError } = await supabase
      .from('driver_assignments')
      .select(`
        *,
        vehicle:vehicles(
          id, make, model, year, license_plate, vin, status,
          vehicle_type:vehicle_types(name)
        )
      `)
      .eq('id', assignment.id)
      .single();

    if (fetchError || !fullAssignment) {
      console.error('Error fetching assignment details:', fetchError);
      return NextResponse.json(assignment);
    }

    // Format the response
    const formattedAssignment = {
      id: fullAssignment.id,
      vehicle_id: fullAssignment.vehicle_id,
      vehicle: fullAssignment.vehicle ? {
        id: fullAssignment.vehicle.id,
        name: `${fullAssignment.vehicle.year} ${fullAssignment.vehicle.make} ${fullAssignment.vehicle.model}`,
        make: fullAssignment.vehicle.make,
        model: fullAssignment.vehicle.model,
        year: fullAssignment.vehicle.year,
        license_plate: fullAssignment.vehicle.license_plate,
        vin: fullAssignment.vehicle.vin,
        status: fullAssignment.vehicle.status,
        type: fullAssignment.vehicle.vehicle_type?.name || 'N/A',
      } : null,
      start_date: fullAssignment.start_date,
      end_date: fullAssignment.end_date,
      status: fullAssignment.status,
      notes: fullAssignment.notes,
      created_at: fullAssignment.created_at,
      updated_at: fullAssignment.updated_at,
    };

    return NextResponse.json(formattedAssignment, { status: 201 });
  } catch (error) {
    console.error('Error in assignment creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
