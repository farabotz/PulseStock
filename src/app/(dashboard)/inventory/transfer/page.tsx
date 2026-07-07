import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import StockTransferForm from "./_form";

export default async function StockTransferPage() {
  const user = await getCurrentUser();
  if (user.role === "staff") redirect("/inventory");
  return <StockTransferForm />;
}
