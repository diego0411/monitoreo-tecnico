// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gfllialqcraacjhkgblm.supabase.co'; // reemplazar
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbGxpYWxxY3JhYWNqaGtnYmxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwMzYzMjEsImV4cCI6MjA1OTYxMjMyMX0.XoLFBlGvhSvmHOky776Re6fuQIc12HV6XeUX4DJSFLU'; // reemplazar

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
