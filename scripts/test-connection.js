import { createClient } from '@supabase/supabase-js';

// Load environment variables
import 'dotenv/config';

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing required environment variables');
      console.log('VITE_SUPABASE_URL:', !!supabaseUrl);
      console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseKey);
      return;
    }
    
    console.log('🔑 Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by listing tables
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('📋 Available tables:');
    tables.forEach(table => console.log(`- ${table.tablename}`));
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
