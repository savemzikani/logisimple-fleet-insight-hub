import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for verification
const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const TEST_COMPANY = {
  name: 'Test Company RLS',
  address: { street: '123 Test St', city: 'Testville', state: 'TS', zip: '12345' },
  contact_info: { email: 'test@example.com', phone: '123-456-7890' }
};

const TEST_USER = {
  email: `test+${Date.now()}@example.com`,
  password: 'testpassword123',
  user_metadata: { name: 'Test User' }
};

const TEST_VEHICLE = {
  make: 'Toyota',
  model: 'Camry',
  year: 2023,
  vin: `TESTVIN${Date.now()}`,
  license_plate: `TEST${Math.floor(Math.random() * 1000)}`,
  vehicle_type: 'sedan',
  status: 'active'
};

const TEST_DRIVER = {
  employee_id: `EMP${Date.now()}`,
  personal_info: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890'
  },
  license_info: {
    number: `DL${Date.now()}`,
    class: 'D',
    expiry: '2030-12-31'
  },
  status: 'active'
};

async function runTests() {
  console.log('🚀 Starting RLS Policy Verification Tests...\n');

  try {
    // 1. Test Company Creation (should be done by service role)
    console.log('1. Testing Company Creation...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert(TEST_COMPANY)
      .select()
      .single();
    
    if (companyError) throw companyError;
    console.log('✅ Company created successfully:', company.id);

    // 2. Test User Registration and Profile Creation
    console.log('\n2. Testing User Registration...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: TEST_USER.user_metadata
      }
    });
    
    if (signUpError) throw signUpError;
    const testUser = authData.user;
    console.log('✅ Test user created:', testUser.id);

    // 3. Update user profile with company ID (using service role)
    console.log('\n3. Updating user profile with company...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        company_id: company.id,
        role: 'admin',
        first_name: 'Test',
        last_name: 'User'
      })
      .eq('user_id', testUser.id);
    
    if (profileError) throw profileError;
    console.log('✅ User profile updated with company');

    // 4. Test Vehicle CRUD Operations
    console.log('\n4. Testing Vehicle CRUD Operations...');
    
    // Create a vehicle as the test user
    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.signInWithPassword({
            email: TEST_USER.email,
            password: TEST_USER.password
          })).data.session.access_token}`
        }
      }
    });

    // Test vehicle creation
    const { data: vehicle, error: vehicleError } = await userClient
      .from('vehicles')
      .insert({ ...TEST_VEHICLE, company_id: company.id })
      .select()
      .single();
    
    if (vehicleError) throw vehicleError;
    console.log('✅ Vehicle created successfully:', vehicle.id);

    // 5. Test Driver CRUD Operations
    console.log('\n5. Testing Driver CRUD Operations...');
    
    const { data: driver, error: driverError } = await userClient
      .from('drivers')
      .insert({ ...TEST_DRIVER, company_id: company.id })
      .select()
      .single();
    
    if (driverError) throw driverError;
    console.log('✅ Driver created successfully:', driver.id);

    // 6. Test Vehicle Tracking
    console.log('\n6. Testing Vehicle Tracking...');
    
    const { data: tracking, error: trackingError } = await userClient
      .from('vehicle_tracking')
      .insert({
        vehicle_id: vehicle.id,
        latitude: 40.7128,
        longitude: -74.0060,
        speed: 60.5,
        heading: 90,
        accuracy: 5.0
      })
      .select()
      .single();
    
    if (trackingError) throw trackingError;
    console.log('✅ Vehicle tracking data created successfully');

    // 7. Test Data Isolation
    console.log('\n7. Testing Data Isolation...');
    
    // Create a second company and user
    const { data: company2 } = await supabase
      .from('companies')
      .insert({ ...TEST_COMPANY, name: 'Second Test Company' })
      .select()
      .single();
    
    const testUser2 = {
      email: `test2+${Date.now()}@example.com`,
      password: 'testpassword123'
    };
    
    const { data: authData2 } = await supabase.auth.signUp({
      email: testUser2.email,
      password: testUser2.password,
      options: {
        data: { name: 'Test User 2' }
      }
    });
    
    // Update second user's profile with second company
    await supabase
      .from('profiles')
      .update({ 
        company_id: company2.id,
        role: 'admin',
        first_name: 'Test',
        last_name: 'User 2'
      })
      .eq('user_id', authData2.user.id);
    
    // Try to access first company's data with second user
    const user2Client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.signInWithPassword({
            email: testUser2.email,
            password: testUser2.password
          })).data.session.access_token}`
        }
      }
    });
    
    // Should return empty array due to RLS
    const { data: otherCompanyVehicles } = await user2Client
      .from('vehicles')
      .select('*')
      .eq('company_id', company.id);
    
    if (otherCompanyVehicles && otherCompanyVehicles.length === 0) {
      console.log('✅ Data isolation working: User cannot access other company\'s data');
    } else {
      throw new Error('Data isolation failed: User can access other company\'s data');
    }

    console.log('\n🎉 All RLS policy tests passed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
