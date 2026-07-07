import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/session";
import NewProductForm from "./_form";

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (user.role === "staff") redirect("/products");
  return <NewProductForm />;
}
