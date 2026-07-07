import {
  pgTable, uuid, text, timestamp, integer, decimal, pgEnum, jsonb,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("user_role", ["admin", "warehouse_manager", "staff"]);

export const transferTypeEnum = pgEnum("transfer_type", ["transfer", "adjustment", "initial"]);

// ─── Users ────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
  stockTransfers: many(stockTransfers),
}));

// ─── Categories ───────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ─── Warehouses ───────────────────────────────────────────────────────────

export const warehouses = pgTable("warehouses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const warehousesRelations = relations(warehouses, ({ many }) => ({
  inventoryLevels: many(inventoryLevels),
  transfersFrom: many(stockTransfers, { relationName: "transfersFrom" }),
  transfersTo: many(stockTransfers, { relationName: "transfersTo" }),
}));

// ─── Products ──────────────────────────────────────────────────────────────

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  price: decimal("price", { precision: 12, scale: 2 }).notNull().default("0"),
  criticalStockThreshold: integer("critical_stock_threshold").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventoryLevels: many(inventoryLevels),
  stockTransfers: many(stockTransfers),
}));

// ─── Inventory Levels (Junction: Product ↔ Warehouse) ─────────────────────

export const inventoryLevels = pgTable("inventory_levels", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("product_warehouse_idx").on(table.productId, table.warehouseId),
]);

export const inventoryLevelsRelations = relations(inventoryLevels, ({ one }) => ({
  product: one(products, {
    fields: [inventoryLevels.productId],
    references: [products.id],
  }),
  warehouse: one(warehouses, {
    fields: [inventoryLevels.warehouseId],
    references: [warehouses.id],
  }),
}));

// ─── Stock Transfers ──────────────────────────────────────────────────────

export const stockTransfers = pgTable("stock_transfers", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  fromWarehouseId: uuid("from_warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" }),
  toWarehouseId: uuid("to_warehouse_id")
    .references(() => warehouses.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  transferType: transferTypeEnum("transfer_type").notNull().default("transfer"),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockTransfersRelations = relations(stockTransfers, ({ one }) => ({
  product: one(products, {
    fields: [stockTransfers.productId],
    references: [products.id],
  }),
  fromWarehouse: one(warehouses, {
    fields: [stockTransfers.fromWarehouseId],
    references: [warehouses.id],
    relationName: "transfersFrom",
  }),
  toWarehouse: one(warehouses, {
    fields: [stockTransfers.toWarehouseId],
    references: [warehouses.id],
    relationName: "transfersTo",
  }),
  creator: one(users, {
    fields: [stockTransfers.createdBy],
    references: [users.id],
  }),
}));

// ─── Audit Logs ────────────────────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  beforeValue: jsonb("before_value"),
  afterValue: jsonb("after_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));