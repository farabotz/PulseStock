import { notFound } from "next/navigation";
import { getProductById } from "@/features/products/actions/product.actions";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface InventoryLevel {
  id: string;
  warehouse_id: string;
  quantity: number;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const levels = product.inventory ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
        <p className="mt-1 text-muted-foreground font-mono">{product.sku}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Category</p>
          <p className="text-lg font-semibold mt-1">{product.categoryName}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="text-lg font-semibold mt-1">{formatCurrency(String(product.price))}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Threshold</p>
          <p className="text-lg font-semibold mt-1">{product.critical_stock_threshold}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Stock Levels</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-4 font-medium">Warehouse</th>
                <th className="text-right p-4 font-medium">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level: InventoryLevel) => (
                <tr key={level.id} className="border-b">
                  <td className="p-4">{level.warehouse_id}</td>
                  <td className="p-4 text-right">{formatNumber(level.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
