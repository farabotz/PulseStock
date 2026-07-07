"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeftRight } from "lucide-react";
import { createStockTransfer } from "@/features/inventory/actions/inventory.actions";

export default function StockTransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createStockTransfer(new FormData(e.currentTarget));
      router.push("/inventory");
      router.refresh();
    } catch {
      setError("Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Stock Transfer</h2>
        <p className="text-muted-foreground mt-1">
          Move inventory between warehouses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            New Transfer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID</Label>
              <Input id="productId" name="productId" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromWarehouseId">From Warehouse</Label>
              <Input id="fromWarehouseId" name="fromWarehouseId" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toWarehouseId">To Warehouse</Label>
              <Input id="toWarehouseId" name="toWarehouseId" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Input id="notes" name="notes" />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Execute Transfer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}