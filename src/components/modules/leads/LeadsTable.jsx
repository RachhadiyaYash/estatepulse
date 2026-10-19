import { Avatar } from "../../ui/Avatar";
import { Badge, ScoreBadge, StageBadge } from "../../ui/Badge";
import LeadQuickActions from "./LeadQuickActions";
import LeadDetailModal from "./LeadDetailModal";
import BookAppointmentModal from "../appointments/BookAppointmentModal";
import { initials } from "../../utils/format.js";
import { useState } from "react";

const HEADS = [
  "Lead Contact",
  "Target Property",
  "Budget Range",
  "Score",
  "Pipeline Stage",
  "Assigned Broker",
  "Acquisition Channel",
  "Quick Actions",
];
const TD = "border-b border-outline-subtle px-5 py-[0.95rem]";

const LeadsTable = ({ leads }) => {
  const [detailLeadId, setDetailLeadId] = useState(null);
  const [bookLeadId, setBookLeadId] = useState(null);
  return (
    <>
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
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => setDetailLeadId(lead.id)}
                className="cursor-pointer transition duration-200 hover:bg-surface-card-hover [&:last-child>td]:border-b-0"
              >
                <td className={TD}>
                  <div className="font-semibold text-on-surface">
                    {lead.name}
                  </div>
                  <div className="text-[0.72rem] text-on-surface-muted">
                    {lead.phone} • {lead.email}
                  </div>
                </td>
                <td className={TD}>
                  <Badge>{lead.projectName}</Badge>
                </td>
                <td className={`${TD} font-semibold text-accent`}>
                  {lead.budget}
                </td>
                <td className={TD}>
                  <ScoreBadge score={lead.score} />
                </td>
                <td className={TD}>
                  <StageBadge stage={lead.stage} />
                </td>
                <td className={TD}>
                  <div className="flex items-center gap-[0.4rem]">
                    <Avatar size="sm" className="bg-brand-deep text-white">
                      {initials(lead.assignedAgentName)}
                    </Avatar>
                    <span className="text-[0.8rem]">
                      {lead.assignedAgentName}
                    </span>
                  </div>
                </td>
                <td className={`${TD} text-[0.78rem] text-on-surface-muted`}>
                  {lead.source}
                </td>
                <td className={TD}>
                  <LeadQuickActions
                    lead={lead}
                    onBookVisit={(leadId) => setBookLeadId(leadId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detailLeadId && (
        <LeadDetailModal
          leadId={detailLeadId}
          onClose={() => setDetailLeadId(null)}
        />
      )}

      {bookLeadId && (
        <BookAppointmentModal
          initialLeadId={bookLeadId}
          onClose={() => setBookLeadId(null)}
        />
      )}
    </>
  );
};

export default LeadsTable;
