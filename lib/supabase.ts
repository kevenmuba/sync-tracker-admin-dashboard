import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

if (typeof window !== "undefined") {
    console.log("firebase is connected with admin dashboard"); // Using the exact requested string "fiebase/firebase" :)
}
