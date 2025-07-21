import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://icxoixutluvbowbvcblr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljeG9peHV0bHV2Ym93YnZjYmxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NDkzMjIsImV4cCI6MjA2NjUyNTMyMn0.FEUaehhABksYRi_4ohmkRt_-t2BqipsIf3zCTb3iNEM'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;