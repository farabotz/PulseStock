"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggle = useCallback(() => setSidebarOpen((o) => !o), []);
  const close = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={close} />
      <main className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={toggle} />
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
