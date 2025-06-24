import { createClient } from '@supabase/supabase-js'
import { REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY } from '../config';

const supabaseUrl = REACT_APP_SUPABASE_URL
console.log('Supabase URL:', supabaseUrl)
const supabaseKey = REACT_APP_SUPABASE_ANON_KEY
console.log('Supabase Key:', supabaseKey)
export const supabase = createClient(supabaseUrl, supabaseKey)