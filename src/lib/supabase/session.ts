"use server";

import { createClient } from "./server";
import { createAdminClient } from "./admin";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "warehouse_manager" | "staff";
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const admin = createAdminClient();
  const { data: profile, error } = await admin
    .from("users")
    .select("id, email, name, role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Profile not found");
  }

  return profile as CurrentUser;
}
