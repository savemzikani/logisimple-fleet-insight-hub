import { createClient } from '../src/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Test configuration
const TEST_DRIVER_ID = 'test-driver-123';
const TEST_COMPANY_ID = 'test-company-123';
const TEST_USER_ID = 'test-user-123';
const TEST_VEHICLE_ID = 'test-vehicle-123';

// Initialize Supabase client
const supabase = createClient();

// Test data
const TEST_ASSIGNMENT = {
  id: `assign-${uuidv4()}`,
  driver_id: TEST_DRIVER_ID,
  vehicle_id: TEST_VEHICLE_ID,
  company_id: TEST_COMPANY_ID,
  start_date: new Date().toISOString(),
  end_date: null,
  status: 'active',
  assigned_by: TEST_USER_ID,
  notes: 'Test assignment',
};

async function testAssignmentFlow() {
  console.log('🚀 Starting assignment flow tests...');
  
  try {
    // 1. Test assignment creation
    console.log('\n📝 Testing assignment creation...');
    const assignment = await testCreateAssignment();
    console.log('✅ Assignment creation test completed');
    
    // 2. Test getting assignments
    console.log('\n📋 Testing assignment retrieval...');
    const assignments = await testGetAssignments();
    console.log('✅ Assignment retrieval test completed');
    
    // 3. Test ending assignment
    console.log('\n🛑 Testing assignment end...');
    await testEndAssignment(assignment.id);
    console.log('✅ Assignment end test completed');
    
    console.log('\n🎉 All assignment flow tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

async function testCreateAssignment() {
  // First, ensure the test vehicle exists
  const { error: vehicleError } = await supabase
    .from('vehicles')
    .upsert({
      id: TEST_VEHICLE_ID,
      company_id: TEST_COMPANY_ID,
      make: 'Test',
      model: 'Vehicle',
      year: 2023,
      license_plate: 'TEST123',
      status: 'available',
      created_by: TEST_USER_ID,
    }, { onConflict: 'id' });
    
  if (vehicleError) {
    throw new Error(`Failed to create test vehicle: ${vehicleError.message}`);
  }
  
  // Create the assignment
  const response = await fetch(`http://localhost:3000/api/drivers/${TEST_DRIVER_ID}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicle_id: TEST_VEHICLE_ID,
      start_date: new Date().toISOString(),
      notes: 'Test assignment',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create assignment: ${error.message || response.statusText}`);
  }
  
  const assignment = await response.json();
  console.log('📝 Created assignment:', {
    id: assignment.id,
    vehicle: assignment.vehicle ? `${assignment.vehicle.year} ${assignment.vehicle.make} ${assignment.vehicle.model}` : 'No vehicle',
    status: assignment.status,
  });
  
  return assignment;
}

async function testGetAssignments() {
  const response = await fetch(`http://localhost:3000/api/drivers/${TEST_DRIVER_ID}/assignments`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get assignments: ${error.message || response.statusText}`);
  }
  
  const assignments = await response.json();
  console.log(`📋 Found ${assignments.length} assignments`);
  
  if (assignments.length > 0) {
    console.log('Latest assignment:', {
      id: assignments[0].id,
      vehicle: assignments[0].vehicle ? `${assignments[0].vehicle.year} ${assignments[0].vehicle.make} ${assignments[0].vehicle.model}` : 'No vehicle',
      status: assignments[0].status,
    });
  }
  
  return assignments;
}

async function testEndAssignment(assignmentId: string) {
  const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      end_date: new Date().toISOString(),
      notes: 'Test assignment end',
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to end assignment: ${error.message || response.statusText}`);
  }
  
  const result = await response.json();
  console.log('🛑 Ended assignment:', {
    id: result.id,
    status: result.status,
    end_date: result.end_date,
  });
  
  return result;
}

// Run the tests
if (require.main === module) {
  testAssignmentFlow();
}

export { testAssignmentFlow, testCreateAssignment, testGetAssignments, testEndAssignment };
