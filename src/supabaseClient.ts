import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vubwsgglvkcljtzirajl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1YndzZ2dsdmtjbGp0emlyYWpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzUzMTUsImV4cCI6MjA1NjgxMTMxNX0.WtolnctY8DmQwv1fopSx90C4ugHZLBb30ufY0tmLZkk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
