"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ClipboardList,
  History,
  ArrowLeftRight,
} from "lucide-react";

const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "warehouse_manager", "staff"] },
  { href: "/warehouses", label: "Warehouses", icon: Warehouse, roles: ["admin", "warehouse_manager", "staff"] },
  { href: "/products", label: "Products", icon: Package, roles: ["admin", "warehouse_manager", "staff"] },
  { href: "/inventory", label: "Inventory", icon: ClipboardList, roles: ["admin", "warehouse_manager", "staff"] },
  { href: "/inventory/transfer", label: "Stock Transfers", icon: ArrowLeftRight, roles: ["admin", "warehouse_manager"] },
  { href: "/audit-logs", label: "Audit Logs", icon: History, roles: ["admin", "warehouse_manager", "staff"] },
];

export function Sidebar({
  open,
  onClose,
  role,
}: {
  open?: boolean;
  onClose?: () => void;
  role?: string;
}) {
  const pathname = usePathname();
  const navItems = allNavItems.filter((item) => !role || item.roles.includes(role));

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r bg-card shrink-0 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight">PulseStock</h1>
          <p className="text-sm text-muted-foreground mt-1">Inventory Manager</p>
        </div>
        <nav className="space-y-1 px-3" onClick={onClose}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
