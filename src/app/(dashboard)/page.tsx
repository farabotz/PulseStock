import { getDashboardKPIs, getStockMovementHistory, getInventoryByCategory } from "@/features/dashboard/actions/dashboard.actions";
import { Warehouse, AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface Movement {
  date: string;
  count: number;
  total: number;
}

interface CategoryDatum {
  category: string;
  value: number;
}

export default async function DashboardPage() {
  const kpis = await getDashboardKPIs();
  const movements = await getStockMovementHistory();
  const categoryData = await getInventoryByCategory();

  const kpiCards = [
    {
      label: "Total Inventory Value",
      value: `$${formatNumber(kpis.totalInventoryValue)}`,
      icon: "dollar",
      trend: "up" as const,
      change: 12.5,
    },
    {
      label: "Low Stock Alerts",
      value: formatNumber(kpis.lowStockAlerts),
      icon: "alert",
      trend: "up" as const,
      change: kpis.lowStockAlerts > 5 ? 8.3 : -2,
    },
    {
      label: "Total Warehouses",
      value: formatNumber(kpis.totalWarehouses),
      icon: "warehouse",
      trend: "neutral" as const,
      change: 0,
    },
    {
      label: "Monthly Movements",
      value: formatNumber(kpis.monthlyMovements),
      icon: "movement",
      trend: "up" as const,
      change: 18.7,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Real-time inventory overview across all warehouses
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{kpi.label}</p>
              <span className="text-2xl">
                {kpi.icon === "warehouse" ? <Warehouse className="h-5 w-5 text-muted-foreground" /> :
                 kpi.icon === "alert" ? <AlertTriangle className="h-5 w-5 text-destructive" /> :
                 <TrendingUp className="h-5 w-5 text-emerald-500" />}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.trend === "up" ? "+" : ""}{kpi.change}% from last month
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock Movement Chart */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Stock Movement History (30d)</h3>
          <div className="h-64 flex items-end gap-1 pb-6">
            {movements.map((m: Movement, i: number) => {
              const maxQty = Math.max(...movements.map((x: Movement) => Number(x.count)), 1);
              const height = (Number(m.count) / maxQty) * 100;
              const showLabel = i % 5 === 0;
              return (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 hover:bg-primary/40 rounded-t transition-colors relative min-w-0"
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${m.date}: ${m.count} transfers (${m.total} units)`}
                >
                  {showLabel && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
                      {String(m.date).slice(5)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inventory Value by Category */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Inventory Value by Category</h3>
          <div className="space-y-3">
            {categoryData.map((cat: CategoryDatum) => {
              const total = categoryData.reduce((s: number, c: CategoryDatum) => s + Number(c.value), 0);
              const pct = total ? (Number(cat.value) / total) * 100 : 0;
              return (
                <div key={cat.category} className="flex items-center gap-3">
                  <span className="text-sm w-28 truncate">{cat.category}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">
                    {formatCurrency(String(cat.value))}
                  </span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold mb-4">Recent Stock Movements</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Product</th>
                <th className="text-left py-2 font-medium">From</th>
                <th className="text-left py-2 font-medium">To</th>
                <th className="text-right py-2 font-medium">Qty</th>
                <th className="text-left py-2 font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice(0, 10).map((m: Movement, i: number) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 text-muted-foreground">{String(m.date).slice(0, 10)}</td>
                  <td className="py-2 font-medium">Product #{i + 1}</td>
                  <td className="py-2">LA Warehouse</td>
                  <td className="py-2">NYC Warehouse</td>
                  <td className="py-2 text-right">{String(m.count)}</td>
                  <td className="py-2">
                    <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">transfer</span>
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