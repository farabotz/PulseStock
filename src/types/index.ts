export type Role = "admin" | "warehouse_manager" | "staff";

export interface KPI {
  label: string;
  value: string | number;
  icon: string;
  trend: "up" | "down" | "neutral";
  change: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  createdAt: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: string;
  criticalStockThreshold: number;
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  warehouseName: string;
  productName: string;
  sku: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  productId: string;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  fromWarehouse: string;
  toWarehouse: string;
  productName: string;
  quantity: number;
  transferType: string;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeValue: Record<string, unknown> | null;
  afterValue: Record<string, unknown> | null;
  createdAt: Date;
}

export interface Movement {
  date: string;
  count: number;
  total: number;
}

export interface CategoryDatum {
  category: string;
  value: number;
}

export interface SupabaseProductRow {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  categories: { name: string } | null;
  price: string | number;
  critical_stock_threshold: number;
  created_at: string;
}

export interface SupabaseInventoryRow {
  id: string;
  product_id: string;
  warehouse_id: string;
  warehouses: { name: string } | null;
  products: { name: string; sku: string } | null;
  quantity: number;
}

export interface SupabaseTransferRow {
  id: string;
  product_id: string;
  products: { name: string } | null;
  from_warehouse: { name: string } | null;
  to_warehouse: { name: string } | null;
  quantity: number;
  transfer_type: string;
  notes: string | null;
  created_at: string;
}

export interface SupabaseAuditRow {
  id: string;
  user_id: string;
  users: { name: string } | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before_value: Record<string, unknown> | null;
  after_value: Record<string, unknown> | null;
  created_at: string;
}