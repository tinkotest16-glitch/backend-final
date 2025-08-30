
import { createClient } from '@supabase/supabase-js'

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined' && typeof import.meta !== 'undefined'

// Get Supabase credentials from environment variables
const supabaseUrl = isBrowser 
  ? import.meta.env.VITE_SUPABASE_URL 
  : process.env.VITE_SUPABASE_URL || 'https://kymxeebmfnojodpvxonv.supabase.co'

const supabaseAnonKey = isBrowser 
  ? import.meta.env.VITE_SUPABASE_ANON_KEY 
  : process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bXhlZWJtZm5vam9kcHZ4b252Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NjYzNjksImV4cCI6MjA3MTQ0MjM2OX0.tys8X5tBdLXhxHovgvDTnrtGjlYeAkw4bY5DvS1QH0I'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export for server-side usage with service role
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bXhlZWJtZm5vam9kcHZ4b252Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg2NjM2OSwiZXhwIjoyMDcxNDQyMzY5fQ.FcufBcIQLdQe446wQHoHARVf8S5VYsYzXtY6iCppwZs'
  
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
