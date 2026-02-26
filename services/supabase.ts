// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://baryummccshqwzuzzkfg.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcnl1bW1jY3NocXd6dXp6a2ZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Nzg0NTgsImV4cCI6MjA4NjQ1NDQ1OH0.y2XRWE6d7ndOuPWX0ZmZ9mPIHTQFPnotm4_uyRjrZkk';

// ✅ ต้องมีคำว่า export const ตรงนี้เท่านั้นค่ะ!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);