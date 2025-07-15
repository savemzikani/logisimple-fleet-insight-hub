import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const EndAssignmentRequestSchema = z.object({
  end_date: z.string().optional(),
  notes: z.string().optional(),
});

type EndAssignmentRequest = z.infer<typeof EndAssignmentRequestSchema>;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const assignmentId = params.id;
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
    const validation = EndAssignmentRequestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }

    const { end_date, notes } = validation.data;

    // Get the assignment details
    const { data: assignment, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        driver:drivers(company_id, status),
        vehicle:vehicles(status)
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError) {
      console.error('Error fetching assignment:', assignmentError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch assignment',
          details: assignmentError.message
        },
        { status: 500 }
      );
    }

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if the assignment is already ended
    if (assignment.end_date) {
      return NextResponse.json(
        { error: 'Assignment is already ended' },
        { status: 400 }
      );
    }

    // Check if the driver is active
    if (assignment.driver.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot end assignment for inactive driver' },
        { status: 403 }
      );
    }

    // Check if the vehicle is active
    if (assignment.vehicle.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot end assignment for inactive vehicle' },
        { status: 403 }
      );
    }

    // Check if user has access to this company
    const { data: companyMember, error: companyError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('company_id', assignment.driver.company_id)
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

    // Update the assignment to end it
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('assignments')
      .update({
        end_date: end_date ? new Date(end_date).toISOString() : new Date().toISOString(),
        status: 'ended',
        ended_by: user.id,
        ended_at: new Date().toISOString(),
        end_notes: notes,
      })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error ending assignment:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to end assignment',
          details: updateError.message
        },
        { status: 500 }
      );
    }

    if (!updatedAssignment) {
      return NextResponse.json(
        { error: 'Assignment update failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: updatedAssignment.id,
      end_date: updatedAssignment.end_date,
      status: updatedAssignment.status,
      message: 'Assignment ended successfully'
    });
  } catch (error) {
    console.error('Error ending assignment:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
