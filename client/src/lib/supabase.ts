
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

// Session configuration - maximum duration
const SESSION_EXPIRY = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'edge-market-auth',
    storage: {
      getItem: (key) => {
        try {
          const item = localStorage.getItem(key)
          const data = item ? JSON.parse(item) : null
          
          // Check if session is expired
          if (data?.expires_at) {
            const expiresAt = new Date(data.expires_at).getTime()
            if (Date.now() >= expiresAt) {
              localStorage.removeItem(key)
              return null
            }
          }
          
          return item
        } catch {
          return null
        }
      },
      setItem: (key, value) => {
        try {
          // Parse the value to add extended expiration
          const data = JSON.parse(value)
          if (data?.expires_at) {
            data.expires_at = new Date(Date.now() + SESSION_EXPIRY).toISOString()
            localStorage.setItem(key, JSON.stringify(data))
          } else {
            localStorage.setItem(key, value)
          }
        } catch {
          localStorage.setItem(key, value)
        }
      },
      removeItem: (key) => localStorage.removeItem(key)
    }
  }
})

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
