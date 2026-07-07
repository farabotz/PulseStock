"use server";

import { createAdminClient } from "@/lib/supabase/admin";

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

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    userName: (row.users as unknown as { name: string } | null)?.name ?? "",
    action: row.action as string,
    entityType: row.entity_type as string,
    entityId: row.entity_id as string | null,
    beforeValue: row.before_value as Record<string, unknown> | null,
    afterValue: row.after_value as Record<string, unknown> | null,
    createdAt: row.created_at as string,
  }));
}
