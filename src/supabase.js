import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xsettvgdvzqzgtqogdkr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZXR0dmdkdnpxemd0cW9nZGtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4OTA0ODYsImV4cCI6MjA5NTQ2NjQ4Nn0.E9WiBt_8mbsBLIwyLsftBPN_-C65Fq0YSB-Poc7iuK0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
