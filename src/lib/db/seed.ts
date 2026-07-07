import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createOrGetUser(email: string, password: string, name: string, role: string) {
  // Try to create a confirmed user; if already exists, fetch existing.
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createData.user) {
    await supabase.from("users").upsert({ id: createData.user.id, email, name, role });
    return createData.user.id;
  }

  if (createError && (createError.code === "email_exists" || /already registered/i.test(createError.message || ""))) {
    const { data: listData } = await supabase.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      await supabase.from("users").upsert({ id: existing.id, email, name, role });
      return existing.id;
    }
  }

  throw new Error(`Failed to create/get user ${email}: ${createError?.message}`);
}

async function main() {
  console.log("Seeding PulseStock to Supabase...\n");

  const adminId = await createOrGetUser("admin@pulsestock.com", "admin123", "Alex Rivera", "admin");
  await createOrGetUser("manager@pulsestock.com", "manager123", "Jordan Chen", "warehouse_manager");
  await createOrGetUser("staff@pulsestock.com", "staff123", "Taylor Kim", "staff");
  console.log("  3 users");

  const { data: cats, error: catError } = await supabase
    .from("categories")
    .upsert([
      { name: "Electronics", description: "Gadgets, devices, tech accessories" },
      { name: "Home & Garden", description: "Household essentials" },
      { name: "Sporting Goods", description: "Athletic equipment" },
      { name: "Office Supplies", description: "Workstation essentials" },
      { name: "Automotive", description: "Car parts and tools" },
    ], { onConflict: "name" })
    .select();

  if (catError) throw catError;
  console.log("  5 categories");

  const { data: whs, error: whError } = await supabase
    .from("warehouses")
    .upsert([
      { name: "Central Distribution - Los Angeles", location: "Los Angeles, CA", capacity: 10000 },
      { name: "East Coast Hub - New York", location: "New York, NY", capacity: 8000 },
      { name: "Midwest Depot - Chicago", location: "Chicago, IL", capacity: 6500 },
    ], { onConflict: "name" })
    .select();

  if (whError) throw whError;
  console.log("  3 warehouses");

  const { data: prods, error: prodError } = await supabase
    .from("products")
    .upsert([
      { sku: "SKU-ELEC-001", name: "Wireless Bluetooth Headphones", category_id: cats![0].id, price: "89.99", critical_stock_threshold: 20 },
      { sku: "SKU-ELEC-002", name: "USB-C 65W Laptop Charger", category_id: cats![0].id, price: "34.99", critical_stock_threshold: 50 },
      { sku: "SKU-ELEC-003", name: "4K Webcam with Mic", category_id: cats![0].id, price: "129.99", critical_stock_threshold: 15 },
      { sku: "SKU-ELEC-004", name: "Mechanical Keyboard (Cherry MX)", category_id: cats![0].id, price: "149.99", critical_stock_threshold: 10 },
      { sku: "SKU-ELEC-005", name: '27" 4K IPS Monitor', category_id: cats![0].id, price: "449.99", critical_stock_threshold: 5 },
      { sku: "SKU-HOME-001", name: "Insulated Water Bottle 32oz", category_id: cats![1].id, price: "24.99", critical_stock_threshold: 30 },
      { sku: "SKU-HOME-002", name: "Smart LED Bulb (WiFi)", category_id: cats![1].id, price: "19.99", critical_stock_threshold: 40 },
      { sku: "SKU-HOME-003", name: "Stainless Steel Trash Can 13gal", category_id: cats![1].id, price: "59.99", critical_stock_threshold: 20 },
      { sku: "SKU-SPRT-001", name: "Yoga Mat 6mm Premium", category_id: cats![2].id, price: "39.99", critical_stock_threshold: 25 },
      { sku: "SKU-SPRT-002", name: "Adjustable Dumbbell Set 50lb", category_id: cats![2].id, price: "299.99", critical_stock_threshold: 5 },
      { sku: "SKU-SPRT-003", name: "Resistance Bands Set (5-pack)", category_id: cats![2].id, price: "29.99", critical_stock_threshold: 30 },
      { sku: "SKU-OFFC-001", name: "Ergonomic Office Chair", category_id: cats![3].id, price: "399.99", critical_stock_threshold: 8 },
      { sku: "SKU-OFFC-002", name: "Standing Desk Converter", category_id: cats![3].id, price: "249.99", critical_stock_threshold: 10 },
      { sku: "SKU-OFFC-003", name: "Noise-Cancelling Earbuds (TWS)", category_id: cats![3].id, price: "79.99", critical_stock_threshold: 15 },
      { sku: "SKU-AUTO-001", name: "Dash Cam 4K with GPS", category_id: cats![4].id, price: "149.99", critical_stock_threshold: 12 },
      { sku: "SKU-AUTO-002", name: "Jump Starter 2000A Peak", category_id: cats![4].id, price: "89.99", critical_stock_threshold: 10 },
    ], { onConflict: "sku" })
    .select();

  if (prodError) throw prodError;
  console.log(`  ${prods?.length} products`);

  const inventoryValues = [
    { product_id: prods![0].id, warehouse_id: whs![0].id, quantity: 120 },
    { product_id: prods![1].id, warehouse_id: whs![0].id, quantity: 200 },
    { product_id: prods![2].id, warehouse_id: whs![0].id, quantity: 45 },
    { product_id: prods![4].id, warehouse_id: whs![0].id, quantity: 12 },
    { product_id: prods![5].id, warehouse_id: whs![0].id, quantity: 85 },
    { product_id: prods![6].id, warehouse_id: whs![0].id, quantity: 300 },
    { product_id: prods![8].id, warehouse_id: whs![0].id, quantity: 60 },
    { product_id: prods![9].id, warehouse_id: whs![0].id, quantity: 8 },
    { product_id: prods![11].id, warehouse_id: whs![0].id, quantity: 15 },
    { product_id: prods![12].id, warehouse_id: whs![0].id, quantity: 25 },
    { product_id: prods![14].id, warehouse_id: whs![0].id, quantity: 40 },
    { product_id: prods![0].id, warehouse_id: whs![1].id, quantity: 65 },
    { product_id: prods![3].id, warehouse_id: whs![1].id, quantity: 30 },
    { product_id: prods![4].id, warehouse_id: whs![1].id, quantity: 50 },
    { product_id: prods![7].id, warehouse_id: whs![1].id, quantity: 22 },
    { product_id: prods![10].id, warehouse_id: whs![1].id, quantity: 35 },
    { product_id: prods![13].id, warehouse_id: whs![1].id, quantity: 18 },
    { product_id: prods![1].id, warehouse_id: whs![2].id, quantity: 5 },
    { product_id: prods![2].id, warehouse_id: whs![2].id, quantity: 12 },
    { product_id: prods![5].id, warehouse_id: whs![2].id, quantity: 3 },
    { product_id: prods![8].id, warehouse_id: whs![2].id, quantity: 10 },
    { product_id: prods![11].id, warehouse_id: whs![2].id, quantity: 4 },
    { product_id: prods![14].id, warehouse_id: whs![2].id, quantity: 7 },
  ];

  const { error: invError } = await supabase
    .from("inventory_levels")
    .upsert(inventoryValues, { onConflict: "product_id,warehouse_id" });

  if (invError) throw invError;
  console.log(`  ${inventoryValues.length} inventory levels`);

  const now = Date.now();
  const transfers = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(now - (i * 24 * 60 * 60 * 1000 + randInt(0, 3600000)));
    transfers.push({
      product_id: prods![randInt(0, prods!.length - 1)].id,
      from_warehouse_id: whs![randInt(0, 2)].id,
      to_warehouse_id: whs![randInt(0, 2)].id,
      quantity: randInt(5, 50),
      transfer_type: "transfer" as const,
      created_by: adminId,
      created_at: date.toISOString(),
    });
  }
  for (const t of transfers) {
    while (t.from_warehouse_id === t.to_warehouse_id) {
      t.to_warehouse_id = whs![randInt(0, 2)].id;
    }
  }

  const { error: transferError } = await supabase.from("stock_transfers").insert(transfers);
  if (transferError) throw transferError;
  console.log("  30 stock transfers (30d history)");

  const { error: auditError } = await supabase.from("audit_logs").insert([
    { user_id: adminId, action: "SEED_DATABASE", entity_type: "system", before_value: null, after_value: { seeded: true } },
    { user_id: adminId, action: "INITIALIZE_WAREHOUSES", entity_type: "warehouse", entity_id: whs![0].id, before_value: null, after_value: { warehouses: 3 } },
    { user_id: adminId, action: "CREATE_PRODUCTS", entity_type: "product", before_value: null, after_value: { count: prods?.length } },
  ]);

  if (auditError) throw auditError;

  console.log("\nDone!");
  console.log("  admin@pulsestock.com / admin123");
  console.log("  manager@pulsestock.com / manager123");
  console.log("  staff@pulsestock.com / staff123");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
