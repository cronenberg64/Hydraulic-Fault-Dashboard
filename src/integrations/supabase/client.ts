// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ionuxivcuxvpohyljssb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvbnV4aXZjdXh2cG9oeWxqc3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTIxNjgsImV4cCI6MjA2NjM4ODE2OH0.N1ZLi8jKNvu_zsJwyj_FiNd-dbRmbvUcS9BuY0b08KE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);