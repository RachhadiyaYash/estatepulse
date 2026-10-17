// Seed data ported from designida/app.js (CRM_STATE)

export const USERS = {
  admin: {
    id: 'admin-1',
    name: 'Alex Mercer',
    title: 'Managing Director & Broker',
    email: 'alex.mercer@estatepulse.com',
    avatar: 'AM',
    role: 'Administrator',
  },
  agent: {
    id: 'agent-1',
    name: 'Marcus Vance',
    title: 'Senior Sales Consultant',
    email: 'marcus.vance@estatepulse.com',
    avatar: 'MV',
    role: 'Real Estate Agent',
  },
}

export const CURRENT_AGENT_ID = 'agent-1'

export const AGENTS = [
  { id: 'agent-1', name: 'Marcus Vance', title: 'Senior Luxury Consultant', avatar: 'MV', activeLeads: 18, dealsClosed: 14, salesVolume: '$18.4M', target: '$20.0M', attainment: 92, label: '92% Met', tone: 'success', avatarClass: 'bg-accent text-on-accent' },
  { id: 'agent-2', name: 'Elena Rostova', title: 'Waterfront Portfolio Director', avatar: 'ER', activeLeads: 24, dealsClosed: 19, salesVolume: '$26.8M', target: '$25.0M', attainment: 107, label: '107% Exceeded', tone: 'success', avatarClass: 'bg-brand-deep text-white' },
  { id: 'agent-3', name: 'Derrick Hayes', title: 'Commercial Leasing Specialist', avatar: 'DH', activeLeads: 12, dealsClosed: 9, salesVolume: '$11.2M', target: '$15.0M', attainment: 74, label: '74% In Progress', tone: 'warning', avatarClass: 'bg-brand text-on-brand' },
  { id: 'agent-4', name: 'Priya Sharma', title: 'Residential Sales Partner', avatar: 'PS', activeLeads: 21, dealsClosed: 16, salesVolume: '$21.5M', target: '$22.0M', attainment: 97, label: '97% Met', tone: 'success', avatarClass: 'bg-success text-on-accent' },
]

export const STAGES = [
  { key: 'new', label: 'New Lead', column: 'New Leads', badge: 'primary', step: '1. New Lead' },
  { key: 'contacted', label: 'Contacted', column: 'Contacted / Qualified', badge: 'primary', step: '2. Contacted / Qualified' },
  { key: 'site_visit', label: 'Visit Scheduled', column: 'Site Visit Scheduled', badge: 'warning', step: '3. Site Visit Scheduled' },
  { key: 'negotiation', label: 'Negotiation', column: 'Negotiation / Proposal', badge: 'orange', step: '4. Negotiation / Proposal' },
  { key: 'won', label: 'Deal Won', column: 'Deal Won / Closed', badge: 'success', step: '5. Deal Closed (Won)' },
  { key: 'lost', label: 'Lost/Closed', column: 'Lost / Postponed', badge: 'neutral', step: '6. Lost / Inactive' },
]

export const STAGE_NAMES = {
  new: 'New Lead',
  contacted: 'Contacted',
  site_visit: 'Site Visit Scheduled',
  negotiation: 'Negotiation',
  won: 'Deal Won',
  lost: 'Lost / Closed',
}

export const PROJECTS = [
  {
    id: 'proj-1',
    name: 'The Grand Meridian',
    location: 'Downtown Financial District, Bay Blvd',
    type: 'Ultra Luxury Apartments',
    status: 'Under Construction',
    tone: 'primary',
    priceRange: '$1.4M - $4.8M',
    totalUnits: 120,
    availableUnits: 34,
    bookedUnits: 86,
    completion: 'Q3 2027',
    assignedAgents: ['agent-1', 'agent-2'],
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    description: 'Iconic 48-story architectural masterpiece featuring panoramic city views, private sky gardens, infinity pool, and concierge hospitality.',
    unitTypes: ['2 BHK (1,450 sq.ft)', '3 BHK Sky Suite (2,200 sq.ft)', '4 BHK Penthouse (4,100 sq.ft)'],
  },
  {
    id: 'proj-2',
    name: 'Azure Waterfront Villas',
    location: 'Palm Coastline & Marina Way',
    type: 'Private Oceanfront Villas',
    status: 'Ready to Move',
    tone: 'success',
    priceRange: '$3.5M - $8.9M',
    totalUnits: 32,
    availableUnits: 7,
    bookedUnits: 25,
    completion: 'Ready Now',
    assignedAgents: ['agent-1', 'agent-4'],
    cover: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    description: 'Exclusive collection of bespoke 5-bedroom waterfront villas with private yacht berths, infinity ocean-decks, and private smart home automation.',
    unitTypes: ['4 BHK Waterfront (4,800 sq.ft)', '5 BHK Grand Villa (7,200 sq.ft)'],
  },
  {
    id: 'proj-3',
    name: 'Skyline Park Residences',
    location: 'Central Park West Avenue',
    type: 'Modern High-Rise Condos',
    status: 'Pre-Launch',
    tone: 'warning',
    priceRange: '$850K - $2.2M',
    totalUnits: 210,
    availableUnits: 172,
    bookedUnits: 38,
    completion: 'Q1 2028',
    assignedAgents: ['agent-2', 'agent-3'],
    cover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    description: 'Biophilic high-rise designed for modern professionals, featuring green terraces, rooftop co-working hub, and high-tech fitness studio.',
    unitTypes: ['1 BHK Studio (780 sq.ft)', '2 BHK Executive (1,250 sq.ft)', '3 BHK Deluxe (1,850 sq.ft)'],
  },
  {
    id: 'proj-4',
    name: 'Apex Commercial Tower',
    location: 'Silicon Boulevard Tech Corridor',
    type: 'Grade-A Office Suites',
    status: 'Under Construction',
    tone: 'primary',
    priceRange: '$1.8M - $12.5M',
    totalUnits: 65,
    availableUnits: 22,
    bookedUnits: 43,
    completion: 'Q4 2026',
    assignedAgents: ['agent-3', 'agent-4'],
    cover: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    description: 'LEED Platinum certified corporate tower with high-speed elevator banks, helipad, conference auditoriums, and fiber redundancy.',
    unitTypes: ['Single Floor Suite (5,000 sq.ft)', 'Duplex HQ Wing (12,000 sq.ft)'],
  },
]

export const LEADS = [
  {
    id: 'lead-101', name: 'Robert Sterling', company: 'Sterling Capital Partners',
    phone: '+1 (555) 382-9012', email: 'r.sterling@sterlingcap.com',
    projectId: 'proj-1', projectName: 'The Grand Meridian', budget: '$2.5M - $3.2M',
    score: 'HOT', stage: 'site_visit', source: 'Google Ads',
    assignedAgentId: 'agent-1', assignedAgentName: 'Marcus Vance', lastContacted: '2 hours ago',
    timeline: [
      { type: 'Site Visit Scheduled', timestamp: 'Today, 09:30 AM', agent: 'Marcus Vance', note: 'Confirmed VIP site tour for 3BHK Sky Suite on Friday 3:00 PM.' },
      { type: 'Phone Call', timestamp: 'Yesterday, 04:15 PM', agent: 'Marcus Vance', note: 'Discussed floor plans and payment milestones. Client requested developer financing details.' },
      { type: 'WhatsApp Sent', timestamp: 'Sep 29, 02:00 PM', agent: 'Marcus Vance', note: 'Shared digital brochure and high-res floor plans via WhatsApp.' },
      { type: 'Lead Ingested', timestamp: 'Sep 28, 11:10 AM', agent: 'System', note: 'Inbound inquiry captured via Google Search Campaign.' },
    ],
  },
  {
    id: 'lead-102', name: 'Samantha & David Cole', company: 'Cole Healthcare Group',
    phone: '+1 (555) 749-1829', email: 'dcole@colehealth.org',
    projectId: 'proj-2', projectName: 'Azure Waterfront Villas', budget: '$4.5M - $6.0M',
    score: 'HOT', stage: 'negotiation', source: 'Direct Referral',
    assignedAgentId: 'agent-1', assignedAgentName: 'Marcus Vance', lastContacted: '1 day ago',
    timeline: [
      { type: 'Offer Submitted', timestamp: 'Yesterday, 02:00 PM', agent: 'Marcus Vance', note: 'Client offered $5.2M for Villa #14 with private boat dock inclusion. Sent for broker approval.' },
      { type: 'Site Visit Completed', timestamp: 'Sep 27, 03:30 PM', agent: 'Marcus Vance', note: 'Completed 90-minute walkthrough of the waterfront show villa. Excellent engagement.' },
      { type: 'Phone Call', timestamp: 'Sep 24, 10:00 AM', agent: 'Marcus Vance', note: 'Initial qualification call. Budget approved, looking for immediate possession.' },
    ],
  },
  {
    id: 'lead-103', name: 'Jonathan Miller', company: 'Apex Logistics LLC',
    phone: '+1 (555) 923-4411', email: 'jmiller@apexlog.com',
    projectId: 'proj-4', projectName: 'Apex Commercial Tower', budget: '$3.0M - $5.0M',
    score: 'WARM', stage: 'contacted', source: 'LinkedIn B2B',
    assignedAgentId: 'agent-3', assignedAgentName: 'Derrick Hayes', lastContacted: '3 days ago',
    timeline: [
      { type: 'Email Sent', timestamp: 'Sep 29, 01:15 PM', agent: 'Derrick Hayes', note: 'Sent commercial lease vs purchase ROI deck and floor plate schematics.' },
      { type: 'Phone Call', timestamp: 'Sep 27, 04:45 PM', agent: 'Derrick Hayes', note: 'First phone contact. Client expanding headquarters to 8,000 sq.ft.' },
    ],
  },
  {
    id: 'lead-104', name: 'Sophia Chen', company: 'Chen Venture Labs',
    phone: '+1 (555) 612-8833', email: 'sophia@chenventures.io',
    projectId: 'proj-3', projectName: 'Skyline Park Residences', budget: '$1.2M - $1.8M',
    score: 'WARM', stage: 'new', source: 'Meta Campaign',
    assignedAgentId: 'agent-2', assignedAgentName: 'Elena Rostova', lastContacted: '5 hours ago',
    timeline: [
      { type: 'Lead Ingested', timestamp: 'Today, 06:45 AM', agent: 'System', note: 'Form submitted on Instagram Ad for 2BHK Pre-Launch.' },
    ],
  },
  {
    id: 'lead-105', name: 'Alexander Wright', company: 'Private Wealth Family Trust',
    phone: '+1 (555) 890-2341', email: 'awright@wrightfamily.co',
    projectId: 'proj-1', projectName: 'The Grand Meridian', budget: '$4.2M - $5.0M',
    score: 'HOT', stage: 'won', source: 'Private Broker Channel',
    assignedAgentId: 'agent-2', assignedAgentName: 'Elena Rostova', lastContacted: '4 days ago',
    timeline: [
      { type: 'Deal Closed', timestamp: 'Sep 28, 05:00 PM', agent: 'Elena Rostova', note: 'Contract signed for Penthouse 42B at $4.45M. 10% escrow deposit wired.' },
      { type: 'Meeting', timestamp: 'Sep 26, 11:00 AM', agent: 'Elena Rostova', note: 'Final legal contract review with client attorney.' },
    ],
  },
  {
    id: 'lead-106', name: 'Lucas Dupont', company: 'Dupont Hospitality',
    phone: '+1 (555) 431-7722', email: 'lucas@duponthotels.fr',
    projectId: 'proj-2', projectName: 'Azure Waterfront Villas', budget: '$3.5M',
    score: 'COLD', stage: 'lost', source: 'Website Walk-in',
    assignedAgentId: 'agent-4', assignedAgentName: 'Priya Sharma', lastContacted: '1 week ago',
    timeline: [
      { type: 'Status Changed', timestamp: 'Sep 25, 09:00 AM', agent: 'Priya Sharma', note: 'Client postponed investment to next fiscal year due to international reallocation.' },
    ],
  },
]

export const APPOINTMENTS = [
  {
    id: 'apt-1', title: 'Grand Meridian Penthouse VIP Tour', leadId: 'lead-101',
    clientName: 'Robert Sterling', clientPhone: '+1 (555) 382-9012',
    projectId: 'proj-1', projectName: 'The Grand Meridian',
    agentId: 'agent-1', agentName: 'Marcus Vance',
    date: '2026-10-03', displayDate: 'Tomorrow, Oct 3', time: '03:00 PM',
    type: 'Site Visit Tour', status: 'Scheduled',
    pickupRequired: true, pickupLocation: 'Sterling Capital HQ, Financial Center',
  },
  {
    id: 'apt-2', title: 'Azure Villa #14 Contract Negotiation', leadId: 'lead-102',
    clientName: 'David Cole', clientPhone: '+1 (555) 749-1829',
    projectId: 'proj-2', projectName: 'Azure Waterfront Villas',
    agentId: 'agent-1', agentName: 'Marcus Vance',
    date: '2026-10-04', displayDate: 'Saturday, Oct 4', time: '11:30 AM',
    type: 'In-Office Legal Meeting', status: 'Scheduled', pickupRequired: false,
  },
  {
    id: 'apt-3', title: 'Apex Tower 12th Floor Layout Walkthrough', leadId: 'lead-103',
    clientName: 'Jonathan Miller', clientPhone: '+1 (555) 923-4411',
    projectId: 'proj-4', projectName: 'Apex Commercial Tower',
    agentId: 'agent-3', agentName: 'Derrick Hayes',
    date: '2026-10-05', displayDate: 'Sunday, Oct 5', time: '02:00 PM',
    type: 'Commercial Walkthrough', status: 'Scheduled', pickupRequired: false,
  },
  {
    id: 'apt-4', title: 'Skyline Park Pre-Launch Presentation', leadId: 'lead-104',
    clientName: 'Sophia Chen', clientPhone: '+1 (555) 612-8833',
    projectId: 'proj-3', projectName: 'Skyline Park Residences',
    agentId: 'agent-2', agentName: 'Elena Rostova',
    date: '2026-10-02', displayDate: 'Today, Oct 2', time: '05:30 PM',
    type: 'Video Call Consultation', status: 'Completed', pickupRequired: false,
  },
]

// Demo credentials used by the login page
export const DEMO_PASSWORD = 'estate123'
export const DEMO_ACCOUNTS = {
  'alex.mercer@estatepulse.com': { role: 'admin', name: 'Alex Mercer' },
  'agent@estatepulse.com': { role: 'agent', name: 'Sam Rivera' },
}

// Analytics page data
export const LEAD_SOURCES = [
  { label: 'Google Ads / Search', value: '42% (28 leads)', pct: 42, bar: 'bg-accent' },
  { label: 'Direct Referral / HNIs', value: '28% (19 leads)', pct: 28, bar: 'bg-success' },
  { label: 'Meta / Instagram Video', value: '18% (12 leads)', pct: 18, bar: 'bg-brand' },
  { label: 'Property Portals & Walk-in', value: '12% (8 leads)', pct: 12, bar: 'bg-on-surface-muted' },
]

export const FUNNEL = [
  { label: '1. Ingested Leads', value: '67 Leads (100%)', color: 'accent' },
  { label: '2. Qualified / Contacted', value: '48 Leads (71%)', color: 'stage-contacted' },
  { label: '3. Site Tours Completed', value: '29 Tours (43%)', color: 'warning' },
  { label: '4. Deals Closed & Won', value: '14 Deals (20.8%)', color: 'success' },
]
