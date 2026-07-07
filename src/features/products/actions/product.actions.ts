"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/supabase/session";

export async function getProducts() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      sku,
      name,
      category_id,
      categories ( name ),
      price,
      critical_stock_threshold,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((p) => ({
    id: p.id as string,
    sku: p.sku as string,
    name: p.name as string,
    categoryId: p.category_id as string,
    categoryName: (p.categories as unknown as { name: string } | null)?.name ?? "",
    price: p.price as string | number,
    criticalStockThreshold: p.critical_stock_threshold as number,
    createdAt: p.created_at as string,
  }));
}

export async function getProductById(id: string) {
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      categories ( name )
    `)
    .eq("id", id)
    .single();

  if (error || !product) throw new Error("Product not found");

  const { data: levels, error: levelsError } = await supabase
    .from("inventory_levels")
    .select("*")
    .eq("product_id", id);

  if (levelsError) throw new Error(levelsError.message);

  return { ...product, categoryName: (product.categories as unknown as { name: string } | null)?.name, inventory: levels ?? [] };
}

export async function createProduct(formData: FormData) {
  const user = await getCurrentUser();
  if (user.role === "staff") throw new Error("Unauthorized");

  const supabase = createAdminClient();
  const { data: prod, error } = await supabase
    .from("products")
    .insert({
      sku: formData.get("sku") as string,
      name: formData.get("name") as string,
      category_id: formData.get("categoryId") as string,
      price: formData.get("price") as string,
      critical_stock_threshold: parseInt(formData.get("threshold") as string) || 10,
    })
    .select()
    .single();

  if (error || !prod) throw new Error(error?.message || "Create failed");

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "CREATE_PRODUCT",
    entity_type: "product",
    entity_id: prod.id,
    before_value: null,
    after_value: { sku: prod.sku, name: prod.name },
  });

  revalidatePath("/products");
  return prod;
}

export async function updateProduct(id: string, formData: FormData) {
  const user = await getCurrentUser();
  if (user.role === "staff") throw new Error("Unauthorized");

  const supabase = createAdminClient();

  const { data: before, error: beforeError } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (beforeError || !before) throw new Error("Product not found");

  const { data: after, error } = await supabase
    .from("products")
    .update({
      name: formData.get("name") as string,
      price: formData.get("price") as string,
      critical_stock_threshold: parseInt(formData.get("threshold") as string) || 10,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !after) throw new Error(error?.message || "Update failed");

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "UPDATE_PRODUCT",
    entity_type: "product",
    entity_id: id,
    before_value: { name: before.name, price: before.price },
    after_value: { name: after.name, price: after.price },
  });

  revalidatePath("/products");
  return after;
}

export async function deleteProduct(id: string) {
  const user = await getCurrentUser();
  if (user.role !== "admin") throw new Error("Unauthorized");

  const supabase = createAdminClient();

  const { data: deleted, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error || !deleted) throw new Error(error?.message || "Delete failed");

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "DELETE_PRODUCT",
    entity_type: "product",
    entity_id: id,
    before_value: { name: deleted.name },
    after_value: null,
  });

  revalidatePath("/products");
  return deleted;
}
