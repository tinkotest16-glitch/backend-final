
import { createClient } from '@supabase/supabase-js'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export for server-side usage with service role
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
