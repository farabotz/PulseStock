import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import NewWarehouseForm from "./_form";

export default async function NewWarehousePage() {
  const user = await getCurrentUser();
  if (user.role !== "admin") redirect("/warehouses");
  return <NewWarehouseForm />;
}
