import { notFound } from "next/navigation";
import { getWarehouseById } from "@/features/warehouses/actions/warehouse.actions";
import { MapPin } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WarehouseDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getWarehouseById(id);

  if (!data) notFound();

  const { warehouse, inventory } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{warehouse.name}</h2>
        <p className="mt-1 text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {warehouse.location}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total Capacity</p>
          <p className="text-2xl font-bold mt-1">{formatNumber(warehouse.capacity)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Current Stock</p>
          <p className="text-2xl font-bold mt-1">
            {inventory.reduce((s, i) => s + i.quantity, 0)}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Utilization</p>
          <p className="text-2xl font-bold mt-1">
            {warehouse.capacity
              ? `${Math.round((inventory.reduce((s, i) => s + i.quantity, 0) / warehouse.capacity) * 100)}%`
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-right p-4 font-medium">Qty</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-4 text-muted-foreground font-mono">-</td>
                  <td className="p-4 font-medium">Item #{item.id.slice(0, 8)}</td>
                  <td className="p-4 text-right">{formatNumber(item.quantity)}</td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-muted-foreground">
                    No inventory in this warehouse
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}