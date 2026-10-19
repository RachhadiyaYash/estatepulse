export const NAV = [
  {
    section: "Operations",
    items: [
      {
        to: "/",
        end: true,
        icon: "fa-chart-pie",
        label: "Dashboard",
        title: "Executive CRM Dashboard",
      },
      {
        to: "/leads",
        icon: "fa-users-viewfinder",
        label: "Leads & Pipeline",
        title: "Leads Pipeline & Follow-up",
      },
      {
        to: "/projects",
        icon: "fa-building-user",
        label: "Projects & Inventory",
        title: "Projects & Inventory Management",
      },
      {
        to: "/appointments",
        icon: "fa-calendar-check",
        label: "Site Visits & Visits",
        title: "Site Visits & Appointments",
      },
    ],
  },
  {
    section: "Intelligence",
    items: [
      {
        to: "/analytics",
        icon: "fa-chart-line",
        label: "Performance & ROI",
        title: "Performance & Intelligence Analytics",
      },
      {
        to: "/agents",
        icon: "fa-id-badge",
        label: "Agent Roster & Targets",
        title: "Sales Team & Agent Roster",
        adminOnly: true,
      },
    ],
  },
];

export const PAGE_TITLES = {
  "/design": "Design System",
  ...Object.fromEntries(
    NAV.flatMap((g) => g.items).map((i) => [i.to, i.title]),
  ),
};
