import { Avatar } from "../../ui/Avatar";
import { ScoreBadge } from "../../ui/Badge";
import LeadQuickActions from "./LeadQuickActions";
import LeadDetailModal from "./LeadDetailModal";
import BookAppointmentModal from "../appointments/BookAppointmentModal";
import { initials } from "../../utils/format.js";
import { useState } from "react";

const LeadCard = ({ lead }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  return (
    <>
      <div
        onClick={() => setIsDetailOpen(true)}
        className="cursor-pointer rounded-md border border-outline-subtle bg-surface-card p-[0.9rem] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/45 hover:shadow-md"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <span className="text-[0.88rem] leading-tight font-extrabold tracking-[-0.02em] text-on-surface">
            {lead.name}
          </span>
          <ScoreBadge score={lead.score} />
        </div>
        <div className="mb-[0.45rem] flex items-center gap-[0.35rem] text-[0.76rem] font-bold text-accent">
          <i className="fas fa-building" /> {lead.projectName}
        </div>
        <div className="num mb-3 text-[0.82rem] font-medium text-on-surface">
          {lead.budget}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-outline-subtle pt-[0.6rem] text-[0.72rem] text-on-surface-muted">
          <div className="flex items-center gap-[0.4rem]">
            <Avatar
              size="sm"
              title={lead.assignedAgentName}
              className="bg-brand-deep text-white"
            >
              {initials(lead.assignedAgentName)}
            </Avatar>
            <span>{lead.source}</span>
          </div>
          <LeadQuickActions
            lead={lead}
            onBookVisit={() => setIsBookOpen(true)}
          />
        </div>
      </div>

      {isDetailOpen && (
        <LeadDetailModal
          leadId={lead.id}
          onClose={() => setIsDetailOpen(false)}
        />
      )}

      {isBookOpen && (
        <BookAppointmentModal
          initialLeadId={lead.id}
          onClose={() => setIsBookOpen(false)}
        />
      )}
    </>
  );
};

export default LeadCard;
