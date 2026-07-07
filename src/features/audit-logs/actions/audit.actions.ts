"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseAuditRow } from "@/types";

export async function getAuditLogs() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select(`
      id,
      user_id,
      users ( name ),
      action,
      entity_type,
      entity_id,
      before_value,
      after_value,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: SupabaseAuditRow) => ({
    id: row.id,
    userId: row.user_id,
    userName: row.users?.[0]?.name ?? "",
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    beforeValue: row.before_value,
    afterValue: row.after_value,
    createdAt: row.created_at,
  }));
}
