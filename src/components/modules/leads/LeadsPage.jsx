import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardHeader } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { FilterSelect, Input } from "../../ui/Form";
import { SegmentedControl } from "../../ui/SegmentedControl";
import { StageDot } from "../../ui/Badge";
import LeadCard from "./LeadCard";
import LeadsTable from "./LeadsTable";
import AddLeadModal from "./AddLeadModal";
import { STAGES } from "../../constants/pipeline";
import {
  getLeadsFiltered,
  deserializeLead,
} from "../../../supabase/services/leads/leads";
import { useProfiles } from "../../../supabase/services/profiles/useProfiles";
import { useToast } from "../../store/useToast";

const SEARCH_DEBOUNCE_MS = 400;
const SKELETON_COUNT = 4;

const LeadsPage = () => {
  const { toast } = useToast();
  const { users: portalUsers, loading: portalUsersLoading } = useProfiles();

  const [view, setView] = useState("table");
  const [stage, setStage] = useState("");
  const [score, setScore] = useState("");
  const [agent, setAgent] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [leads, setLeads] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);

  const requestIdRef = useRef(0);
  const firstLoadRef = useRef(true);
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // DB stores the agent display name — resolve portal user id -> name.
  const agentFilterName = useMemo(() => {
    if (!agent) return "";
    const user = portalUsers.find(
      (u) => String(u.id) === String(agent) || u.name === agent,
    );
    return user ? user.name : String(agent);
  }, [agent, portalUsers]);

  const hasActiveFilters = Boolean(stage || score || debouncedSearch || agent);

  // Debounce the search box — only the debounced value hits the server.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Single server fetch — filters + DB search (no pagination).
  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const isFirst = firstLoadRef.current;

    const fetchLeads = async () => {
      if (isFirst) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const res = await getLeadsFiltered({
          search: debouncedSearch || undefined,
          stage: stage || undefined,
          score: score || undefined,
          agentName: agentFilterName || undefined,
          signal: controller.signal,
        });
        if (requestIdRef.current !== requestId) return;
        const rows = (res.data ?? []).map(deserializeLead).filter(Boolean);
        setLeads(rows);
        setTotalCount(res.count ?? rows.length);
        setLastUpdated(new Date());
        firstLoadRef.current = false;
      } catch (err) {
        if (controller.signal.aborted) return;
        if (requestIdRef.current !== requestId) return;
        const msg = err?.message || "Failed to load leads.";
        setError(msg);
        toastRef.current(msg, "error");
        // eslint-disable-next-line no-console
        console.error("Failed to load leads:", err);
      } finally {
        if (requestIdRef.current === requestId) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchLeads();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    stage,
    score,
    agentFilterName,
    portalUsers,
    refreshTick,
  ]);
  const handleRefresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
    toastRef.current("Refreshing leads…", "info");
  }, []);

  const handleLeadCreated = useCallback(() => {
    setIsAddLeadOpen(false);
    setRefreshTick((t) => t + 1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setStage("");
    setScore("");
    setAgent("");
    setSearchInput("");
    setDebouncedSearch("");
  }, []);

  const kanbanItems = useMemo(() => {
    const map = {};
    STAGES.forEach((s) => {
      map[s.key] = [];
    });
    leads.forEach((l) => {
      if (map[l.stage]) map[l.stage].push(l);
      else map[l.stage] = [l];
    });
    return map;
  }, [leads]);

  const showSkeleton = loading && leads.length === 0 && !error;

  return (
    <Card>
      <CardHeader
        title="Leads Pipeline & Relationship Manager"
        subtitle="Track prospective buyers through qualification, site tours, and negotiations"
      >
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
            }}
            aria-label="Filter by pipeline stage"
          >
            <option value="">All Stages</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={score}
            onChange={(e) => {
              setScore(e.target.value);
            }}
            aria-label="Filter by intent score"
          >
            <option value="">All Scores</option>
            <option value="HOT">Hot Lead</option>
            <option value="WARM">Warm Lead</option>
            <option value="COLD">Cold Lead</option>
          </FilterSelect>
          <FilterSelect
            value={agent}
            onChange={(e) => {
              setAgent(e.target.value);
            }}
            aria-label="Filter by assigned agent"
          >
            <option value="">All Agents</option>
            {portalUsersLoading ? (
              <option value="" disabled>
                Loading portal users…
              </option>
            ) : portalUsers.length === 0 ? (
              <option value="" disabled>
                No portal users found
              </option>
            ) : (
              portalUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))
            )}
          </FilterSelect>
          <SegmentedControl
            value={view}
            onChange={setView}
            options={[
              { value: "kanban", label: "Kanban", icon: "fa-table-columns" },
              { value: "table", label: "Table", icon: "fa-list" },
            ]}
          />
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search name, project, phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-56"
              aria-label="Search leads"
            />
            <Button
              variant="secondary"
              onClick={handleRefresh}
              loading={refreshing}
              aria-label="Refresh leads"
              title={lastUpdated ? "Last updated" : "Refresh leads"}
            >
              <i className="fas fa-rotate-right" /> Refresh
            </Button>
            <Button onClick={() => setIsAddLeadOpen(true)}>
              <i className="fas fa-plus" /> Add Lead
            </Button>
          </div>
        </div>
      </CardHeader>

      {showSkeleton ? (
        <div className="p-6">
          <div className="flex flex-wrap gap-4">
            {[...Array(SKELETON_COUNT)].map((_, i) => (
              <div
                key={i}
                className="h-48 w-full animate-pulse rounded-lg border border-outline-subtle bg-surface-dim p-4 sm:w-85"
              >
                <div className="mb-3 h-3 w-3/4 rounded bg-surface-card" />
                <div className="mb-2 h-2.5 w-1/2 rounded bg-surface-card" />
                <div className="h-2 w-1/3 rounded bg-surface-card" />
              </div>
            ))}
          </div>
        </div>
      ) : error && leads.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full border border-outline-subtle bg-surface-dim">
            <i className="fas fa-exclamation-triangle text-[1.5rem] text-on-surface-muted" />
          </div>
          <h3 className="mb-1 text-[0.95rem] font-semibold text-on-surface">
            Unable to load leads
          </h3>
          <p className="mx-auto mb-6 max-w-xs text-[0.8rem] text-on-surface-muted">
            {error}
          </p>
          <Button onClick={handleRefresh} loading={refreshing}>
            <i className="fas fa-rotate-right" /> Retry
          </Button>
        </div>
      ) : view === "table" ? (
        <>
          <div className="flex items-center justify-between px-6 pt-4 text-[0.76rem] text-on-surface-muted">
            <span>
              <b className="text-on-surface">{totalCount}</b> result
              {totalCount === 1 ? "" : "s"}
              {debouncedSearch && (
                <>
                  {" "}
                  for “<span className="font-semibold">{debouncedSearch}</span>”
                </>
              )}
            </span>
            {lastUpdated && (
              <span>
                Updated{" "}
                {lastUpdated.toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
          {leads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full border border-outline-subtle bg-surface-dim">
                <i className="fas fa-filter text-[1.5rem] text-on-surface-muted" />
              </div>
              <h3 className="mb-1 text-[0.95rem] font-semibold text-on-surface">
                No leads found
              </h3>
              <p className="mx-auto mb-6 max-w-xs text-[0.8rem] text-on-surface-muted">
                Try widening the stage, score, agent or search criteria. If no
                filters are active, no leads exist yet — add your first lead.
              </p>
              {hasActiveFilters ? (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setIsAddLeadOpen(true)}>
                  <i className="fas fa-plus" /> Add Lead
                </Button>
              )}
            </div>
          ) : (
            <LeadsTable leads={leads} />
          )}
        </>
      ) : (
        <div className="relative">
          {leads.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full border border-outline-subtle bg-surface-dim">
                <i className="fas fa-filter text-[1.5rem] text-on-surface-muted" />
              </div>
              <h3 className="mb-1 text-[0.95rem] font-semibold text-on-surface">
                No leads found
              </h3>
              <p className="mx-auto mb-6 max-w-xs text-[0.8rem] text-on-surface-muted">
                Try widening the stage, score, agent or search criteria.
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto p-6">
              {STAGES.map((s) => (
                <div
                  key={s.key}
                  className="flex w-80 shrink-0 flex-col self-start rounded-lg border border-outline-subtle bg-surface-dim"
                >
                  <div className="flex items-center gap-2 border-b border-outline-subtle px-4 py-3">
                    <StageDot stage={s.key} />
                    <h3 className="text-[0.8rem] font-extrabold text-on-surface">
                      {s.column || s.label}
                    </h3>
                    <span className="ml-auto rounded-full bg-surface-card px-2 py-0.5 text-[0.68rem] font-bold text-on-surface-muted">
                      {(kanbanItems[s.key] ?? []).length}
                    </span>
                  </div>
                  <div className="flex max-h-[65vh] flex-col gap-3 overflow-y-auto p-3">
                    {(kanbanItems[s.key] ?? []).length === 0 ? (
                      <p className="rounded-md border border-dashed border-outline-subtle px-3 py-6 text-center text-[0.74rem] text-on-surface-muted">
                        No leads
                      </p>
                    ) : (
                      (kanbanItems[s.key] ?? []).map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isAddLeadOpen && (
        <AddLeadModal
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          onCreated={handleLeadCreated}
        />
      )}
    </Card>
  );
};

export default LeadsPage;
