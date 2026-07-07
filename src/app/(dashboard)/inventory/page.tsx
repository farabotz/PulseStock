import { getInventoryLevels } from "@/features/inventory/actions/inventory.actions";

export default async function InventoryPage() {
  const inventory = await getInventoryLevels();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
        <p className="text-muted-foreground mt-1">
          Stock levels across all warehouses
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Warehouse</th>
                <th className="text-right p-4 font-medium">Quantity</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-medium">{item.productName}</td>
                  <td className="p-4 font-mono text-muted-foreground">{item.sku}</td>
                  <td className="p-4">{item.warehouseName}</td>
                  <td className="p-4 text-right">{item.quantity}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.quantity < 10
                        ? "bg-destructive/10 text-destructive"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {item.quantity < 10 ? "Low" : "OK"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}