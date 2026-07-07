"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/session";

export async function getWarehouses() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("warehouses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getWarehouseById(id: string) {
  const supabase = createAdminClient();

  const { data: warehouse, error } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !warehouse) throw new Error("Warehouse not found");

  const { data: inventory, error: invError } = await supabase
    .from("inventory_levels")
    .select("*")
    .eq("warehouse_id", id);

  if (invError) throw new Error(invError.message);

  return { warehouse, inventory: inventory ?? [] };
}

export async function createWarehouse(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role !== "admin") throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { data: wh, error } = await supabase
    .from("warehouses")
    .insert({
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      capacity: parseInt(formData.get("capacity") as string) || 0,
    })
    .select()
    .single();

  if (error || !wh) throw new Error(error?.message || "Create failed");

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "CREATE_WAREHOUSE",
    entity_type: "warehouse",
    entity_id: wh.id,
    before_value: null,
    after_value: { name: wh.name, location: wh.location, capacity: wh.capacity },
  });

  revalidatePath("/warehouses");
  return wh;
}

export async function updateWarehouse(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (user.role === "staff") throw new Error("Unauthorized");

  const supabase = createAdminClient();

  const { data: before, error: beforeError } = await supabase
    .from("warehouses")
    .select("*")
    .eq("id", id)
    .single();

  if (beforeError || !before) throw new Error("Warehouse not found");

  const { data: after, error } = await supabase
    .from("warehouses")
    .update({
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      capacity: parseInt(formData.get("capacity") as string) || 0,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !after) throw new Error(error?.message || "Update failed");

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "UPDATE_WAREHOUSE",
    entity_type: "warehouse",
    entity_id: id,
    before_value: { name: before.name, location: before.location, capacity: before.capacity },
    after_value: { name: after.name, location: after.location, capacity: after.capacity },
  });

  revalidatePath("/warehouses");
  return after;
}

export async function deleteWarehouse(id: string) {
  const user = await getCurrentUser();
  if (user.role !== "admin") throw new Error("Unauthorized");

  const supabase = createAdminClient();

  const { data: deleted, error } = await supabase
    .from("warehouses")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !deleted) throw new Error(error?.message || "Delete failed");

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "DELETE_WAREHOUSE",
    entity_type: "warehouse",
    entity_id: id,
    before_value: { name: deleted.name },
    after_value: null,
  });

  revalidatePath("/warehouses");
  return deleted;
}
