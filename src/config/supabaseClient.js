import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '⚠️ Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY — check your .env file'
  )
}

// Create a basic client with the anon key
export const supabase = createClient(supabaseUrl, supabaseKey)

// Create a client with Auth0 token
export const createSupabaseWithAuth = (authToken) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
  })
}