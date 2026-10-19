import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, IconButton } from "../ui/Button";
import ThemeSwitch from "../ui/ThemeSwitch";
import { useUiStore } from "../store/useUiStore";
import { PAGE_TITLES } from "./navItems";

export default function Header({ onMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { openModal } = useUiStore();
  const [search, setSearch] = useState("");

  const onSearch = (e) => {
    setSearch(e.target.value);
    if (e.target.value && pathname !== "/leads") navigate("/leads");
  };

  return (
    <header className="sticky top-0 z-90 flex py-3 items-center justify-between gap-4 border-b border-outline-subtle bg-surface-base/85 px-4 backdrop-blur-[14px] sm:px-8">
      <div className="flex min-w-0 items-center gap-5">
        <IconButton
          className="lg:hidden"
          aria-label="Open menu"
          onClick={onMenu}
        >
          <i className="fas fa-bars" />
        </IconButton>
        <h2 className="text-[1.2rem] font-extrabold tracking-[-0.04em] whitespace-nowrap text-on-surface max-xl:hidden">
          {PAGE_TITLES[pathname] || "Real Estate CRM"}
        </h2>
        <div className="relative w-[320px] max-w-full max-xl:w-55 max-md:hidden">
          <i className="fas fa-search absolute top-1/2 left-3.5 -translate-y-1/2 text-[0.9rem] text-on-surface-muted" />
          <input
            type="text"
            value={search}
            onChange={onSearch}
            placeholder="Search leads, projects, clients, phone..."
            className="h-10 w-full rounded-md border border-outline-subtle bg-field-bg pr-4 pl-10 text-[0.82rem] text-on-surface transition duration-200 placeholder:text-on-surface-muted focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-[0.7rem]">
        <Button
          variant="secondary"
          onClick={() => openModal("bookAppointment")}
          className="max-xl:hidden"
        >
          <i className="fas fa-calendar-plus" /> <span>Book Visit</span>
        </Button>
        <Button onClick={() => openModal("addLead")}>
          <i className="fas fa-user-plus" />{" "}
          <span className="max-sm:hidden">Add Lead</span>
        </Button>
        <ThemeSwitch />
        <IconButton
          title="Notifications"
          aria-label="Notifications"
          className="max-sm:hidden"
        >
          <i className="far fa-bell" />
          <span className="absolute top-2.25 right-2.5 size-2 rounded-full border-2 border-surface-card bg-brand" />
        </IconButton>
      </div>
    </header>
  );
}
