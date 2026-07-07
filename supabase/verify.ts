import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  console.log("Verifying Supabase integration...\n");

  // Test auth sign-in via public anon client
  const publicClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: signInData, error: signInError } = await publicClient.auth.signInWithPassword({
    email: "admin@pulsestock.com",
    password: "admin123",
  });
  if (signInError) throw new Error(`Sign-in failed: ${signInError.message}`);
  console.log("  Sign-in OK:", signInData.user?.email);

  // Test data queries
  const { data: users } = await supabase.from("users").select("*").limit(5);
  console.log("  Users:", users?.length ?? 0);

  const { data: warehouses } = await supabase.from("warehouses").select("*");
  console.log("  Warehouses:", warehouses?.length ?? 0);

  const { data: products } = await supabase.from("products").select("*");
  console.log("  Products:", products?.length ?? 0);

  const { data: kpi, error: kpiError } = await supabase.rpc("get_dashboard_kpis");
  if (kpiError) throw kpiError;
  console.log("  KPIs:", kpi?.[0]);

  console.log("\nVerification passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
