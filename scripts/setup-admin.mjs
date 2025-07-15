import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

async function setupAdmin() {
  try {
    console.log('🚀 Starting admin setup...');
    
    // Get environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }
    
    console.log('🔑 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Create a new company
    console.log('🏢 Creating company...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: 'Admin Company',
        address: {
          street: '123 Admin St',
          city: 'Adminville',
          state: 'AD',
          zip: '00000',
          country: 'Adminland'
        },
        contact_info: {
          email: 'admin@example.com',
          phone: '123-456-7890'
        },
        subscription_tier: 'enterprise',
        settings: {}
      })
      .select()
      .single();
    
    if (companyError) throw companyError;
    console.log(`✅ Company created: ${company.id}`);
    
    // 2. Create admin user
    const adminEmail = `admin+${Date.now()}@example.com`;
    const adminPassword = 'Admin@1234';
    
    console.log('👤 Creating admin user...');
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: 'Admin User',
          email: adminEmail
        }
      }
    });
    
    if (signUpError) throw signUpError;
    console.log(`✅ Admin user created: ${authData.user.id}`);
    
    // 3. Update profile with admin role and company
    console.log('🔄 Updating admin profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        company_id: company.id,
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        phone: '123-456-7890'
      })
      .eq('user_id', authData.user.id);
    
    if (profileError) throw profileError;
    
    console.log('\n🎉 Setup complete!');
    console.log('==================');
    console.log('Admin Email:', adminEmail);
    console.log('Admin Password:', adminPassword);
    console.log('Company ID:', company.id);
    console.log('==================\n');
    console.log('You can now log in to the admin dashboard with these credentials.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdmin();
