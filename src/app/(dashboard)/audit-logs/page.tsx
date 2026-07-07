import { getAuditLogs } from "@/features/audit-logs/actions/audit.actions";
import { formatDate } from "@/lib/utils";

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
        <p className="text-muted-foreground mt-1">
          Read-only record of all system changes
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left p-4 font-medium">Time</th>
                <th className="text-left p-4 font-medium">User</th>
                <th className="text-left p-4 font-medium">Action</th>
                <th className="text-left p-4 font-medium">Entity</th>
                <th className="text-left p-4 font-medium">Before</th>
                <th className="text-left p-4 font-medium">After</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 text-muted-foreground whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="p-4 font-medium">{log.userName}</td>
                  <td className="p-4">
                    <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{log.entityType}</td>
                  <td className="p-4">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {log.beforeValue ? JSON.stringify(log.beforeValue).slice(0, 40) : "—"}
                    </code>
                  </td>
                  <td className="p-4">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {log.afterValue ? JSON.stringify(log.afterValue).slice(0, 40) : "—"}
                    </code>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No audit logs yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}