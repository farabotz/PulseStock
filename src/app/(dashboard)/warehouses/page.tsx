import { getWarehouses } from "@/features/warehouses/actions/warehouse.actions";
import { Warehouse, MapPin, Plus } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
          <p className="text-muted-foreground mt-1">
            Manage your storage locations
          </p>
        </div>
        <Link
          href="/warehouses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Warehouse
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {warehouses.map((wh) => (
          <Link
            key={wh.id}
            href={`/warehouses/${wh.id}`}
            className="rounded-lg border bg-card p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <Warehouse className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                {formatNumber(wh.capacity)} units
              </span>
            </div>
            <h3 className="mt-4 font-semibold">{wh.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {wh.location}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}