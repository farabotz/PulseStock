import { getProducts } from "@/features/products/actions/product.actions";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog and SKUs
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-4 font-medium">SKU</th>
                <th className="text-left p-4 font-medium">Name</th>
                <th className="text-left p-4 font-medium">Category</th>
                <th className="text-right p-4 font-medium">Price</th>
                <th className="text-right p-4 font-medium">Threshold</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 font-mono text-muted-foreground">{p.sku}</td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">{p.categoryName}</td>
                  <td className="p-4 text-right">{formatCurrency(p.price)}</td>
                  <td className="p-4 text-right">{p.criticalStockThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}