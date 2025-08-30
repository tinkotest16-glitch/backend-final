
import { createServerClient } from "../client/src/lib/supabase.js";

export async function verifySupabaseConnection() {
  try {
    console.log('🔍 Verifying Supabase connection...');
    
    const supabase = createServerClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    console.log('📊 Database accessible');
    
    // Test auth service
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('⚠️  Supabase Auth service error:', authError.message);
    } else {
      console.log(`✅ Supabase Auth working - ${authData.users.length} users found`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Supabase verification failed:', error);
    return false;
  }
}
