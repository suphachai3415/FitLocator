// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-url.supabase.co'; // 👈 ใส่ URL ของแม่
const supabaseAnonKey = 'your-anon-key'; // 👈 ใส่ Anon Key ของแม่

// ✅ ต้องมีคำว่า export const ตรงนี้เท่านั้นค่ะ!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);