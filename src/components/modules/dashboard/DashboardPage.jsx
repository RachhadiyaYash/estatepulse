import { Link } from "react-router-dom";
import { Card, CardHeader } from "../../ui/Card";
import { Badge, ScoreBadge, StageBadge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import KpiCard from "../../ui/KpiCard";
import AppointmentItem from "../appointments/AppointmentItem";
import LeadQuickActions from "../leads/LeadQuickActions";
import { useUiStore } from "../../store/useUiStore";
import { useUserStore } from "../../store/useUserStore";
import { useLeads } from "../../../supabase/services/leads/useLeads";
import { useVisits } from "../../../supabase/services/visit/useVisits";

export default function DashboardPage() {
  const { openModal } = useUiStore();
  const isAgent = useUserStore((s) => s.role) === "agent";
  const visibleLeads = useLeads();
  const visibleAppointments = useVisits();

  const hot = visibleLeads.filter((l) => l.score === "HOT").length;
  const upcoming = visibleAppointments.filter(
    (a) => a.status === "Scheduled",
  ).length;
  const won = visibleLeads.filter((l) => l.stage === "won").length;
  const recent = [...visibleLeads].reverse().slice(0, 5);
  const schedule = visibleAppointments.slice(0, 4);

  return (
    <>
      <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[1.1rem]">
        <KpiCard
          title="Active Leads"
          icon="fa-user-group"
          tone="blue"
          value={visibleLeads.length}
          badgeIcon="fa-arrow-trend-up"
          badge="+14%"
          footer="vs last 30 days"
        />
        <KpiCard
          title="Hot Inquiries"
          icon="fa-fire"
          tone="orange"
          value={hot}
          valueClass="text-brand-text"
          badgeIcon="fa-check"
          badge="High Priority"
          footer="Decision window < 7 days"
        />
        <KpiCard
          title="Upcoming Site Visits"
          icon="fa-calendar-check"
          tone="slate"
          value={upcoming}
          badgeIcon="fa-clock"
          badge="Active schedule"
          footer="4 completed this week"
        />
        <KpiCard
          title={isAgent ? "My Closed Deals" : "Agency Closed Deals"}
          icon="fa-handshake"
          tone="green"
          value={won}
          valueClass="text-success"
          badgeIcon="fa-arrow-trend-up"
          badge="$4.45M"
          footer="Revenue locked Q3"
        />
      </div>

      <div className="grid items-start gap-6 min-[1560px]:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader
            title="Recent High-Intent Leads"
            subtitle="Inbound inquiries requiring immediate agent follow-up"
          >
            <Link to="/leads">
              <Button variant="secondary" size="sm">
                View All Pipeline <i className="fas fa-arrow-right" />
              </Button>
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-[0.84rem]">
              <thead>
                <tr>
                  {[
                    "Lead Contact",
                    "Project",
                    "Budget",
                    "Score",
                    "Stage",
                    "Last Contact",
                    "Actions",
                  ].map((h) => (
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
                {recent.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-6 text-center text-on-surface-muted"
                    >
                      No leads found.
                    </td>
                  </tr>
                )}
                {recent.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openModal("leadDetail", { leadId: lead.id })}
                    className="cursor-pointer transition duration-200 hover:bg-surface-card-hover [&:last-child>td]:border-b-0"
                  >
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem]">
                      <div className="font-semibold text-on-surface">
                        {lead.name}
                      </div>
                      <div className="text-[0.74rem] text-on-surface-muted">
                        {lead.company || lead.email}
                      </div>
                    </td>
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem]">
                      <Badge>{lead.projectName}</Badge>
                    </td>
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem] font-semibold">
                      {lead.budget}
                    </td>
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem]">
                      <ScoreBadge score={lead.score} />
                    </td>
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem]">
                      <StageBadge stage={lead.stage} />
                    </td>
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem] text-[0.75rem] text-on-surface-muted">
                      {lead.lastContacted}
                    </td>
                    <td className="border-b border-outline-subtle px-5 py-[0.95rem]">
                      <LeadQuickActions lead={lead} schedule={false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Site Visits Today"
            subtitle="Scheduled property walkthroughs & calls"
          />
          <div className="flex flex-col gap-3 p-5">
            {schedule.length === 0 && (
              <div className="p-4 text-center text-on-surface-muted">
                No site visits scheduled for today.
              </div>
            )}
            {schedule.map((apt) => (
              <AppointmentItem key={apt.id} apt={apt} compact />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
