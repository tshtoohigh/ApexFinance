import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vabbtlufkdvgvcomhbxk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhYmJ0bHVma2R2Z3Zjb21oYnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MzQyMDcsImV4cCI6MjEwMzMxMDIwN30.uq54Cu_44siT3ky5Vcr_dMJaanLfk69UoT5CIIN8XQ0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
