import { Navigate } from "react-router-dom";
import { Card, CardHeader } from "../../ui/Card";
import { Avatar } from "../../ui/Avatar";
import { Badge } from "../../ui/Badge";
import { useUserStore } from "../../store/useUserStore";
import { useProfiles } from "../../../supabase/services/profiles/useProfiles";

const HEADS = ["Portal User", "Email", "Contact", "Role"];
const TD = "border-b border-outline-subtle px-5 py-[0.95rem]";

export default function AgentsPage() {
  const isAgent = useUserStore((s) => s.role) === "agent";
  const { users, loading } = useProfiles();
  // the roster is an admin-only screen (nav link is hidden for agents too)
  if (isAgent) return <Navigate to="/" replace />;

  const initials = (name) =>
    String(name || "?")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Card>
      <CardHeader
        title="Portal Users"
        subtitle="Actual users of the portal (first_name + last_name from profiles)"
      />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[0.84rem]">
          <thead>
            <tr>
              {HEADS.map((h) => (
                <th
                  key={h}
                  className="kicker border-b border-outline-subtle bg-surface-dim px-5 py-3 text-[0.6rem] whitespace-nowrap text-on-surface-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={HEADS.length}
                  className={`${TD} text-center text-on-surface-muted`}
                >
                  Loading portal users…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={HEADS.length}
                  className={`${TD} text-center text-on-surface-muted`}
                >
                  No portal users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="transition duration-200 hover:bg-surface-card-hover [&:last-child>td]:border-b-0"
                >
                  <td className={TD}>
                    <div className="flex items-center gap-[0.6rem]">
                      <Avatar>{initials(u.name)}</Avatar>
                      <div>
                        <div className="font-semibold">{u.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className={TD}>{u.email || "—"}</td>
                  <td className={TD}>{u.contactNumber || "—"}</td>
                  <td className={TD}>
                    <Badge tone={u.role === "admin" ? "primary" : "neutral"}>
                      {u.role}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
