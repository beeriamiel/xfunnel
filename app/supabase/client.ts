import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// Client components only
export function createClient() {
  return createClientComponentClient<Database>()
}

export { createClientComponentClient } 