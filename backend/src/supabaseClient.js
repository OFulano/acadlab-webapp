import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRole) {
  throw new Error("Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.");
}

export const supabase = createClient(supabaseUrl, serviceRole, {
  auth: {
    persistSession: false
  }
});
