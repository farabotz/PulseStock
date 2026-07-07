"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Movement, CategoryDatum } from "@/types";

export async function getDashboardKPIs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_dashboard_kpis");

  if (error) throw new Error(error.message);

  const row = data?.[0] ?? {
    total_inventory_value: 0,
    low_stock_alerts: 0,
    total_warehouses: 0,
    monthly_movements: 0,
  };

  return {
    totalInventoryValue: Number(row.total_inventory_value),
    lowStockAlerts: Number(row.low_stock_alerts),
    totalWarehouses: Number(row.total_warehouses),
    monthlyMovements: Number(row.monthly_movements),
  };
}

export async function getStockMovementHistory() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_stock_movement_history");

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Movement) => ({
    date: row.date,
    count: Number(row.count),
    total: Number(row.total),
  }));
}

export async function getInventoryByCategory() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_inventory_by_category");

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: CategoryDatum) => ({
    category: row.category,
    value: Number(row.value),
  }));
}
