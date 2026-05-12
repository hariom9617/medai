import { Filter, X } from "lucide-react";
import type { AlertType } from "@/types";

export type FilterType = "all" | "unread" | "today" | "week" | "medication" | "adherence" | "intervention" | "emergency";

interface NotificationFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  unreadCount?: number;
}

const FILTER_LABELS: Record<FilterType, string> = {
  all: "All",
  unread: "Unread",
  today: "Today",
  week: "This Week",
  medication: "Medication",
  adherence: "Adherence",
  intervention: "Intervention",
  emergency: "Emergency",
};

export function NotificationFilter({ currentFilter, onFilterChange, unreadCount }: NotificationFilterProps) {
  const filters: FilterType[] = ["all", "unread", "today", "week"];
  const typeFilters: FilterType[] = ["medication", "adherence", "intervention", "emergency"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              currentFilter === filter
                ? "bg-primary text-primary-foreground"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {FILTER_LABELS[filter]}
            {filter === "unread" && unreadCount !== undefined && unreadCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="pt-2">
        <p className="text-xs font-medium text-slate-500 mb-2">By Type</p>
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                currentFilter === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {FILTER_LABELS[filter]}
            </button>
          ))}
        </div>
      </div>

      {currentFilter !== "all" && (
        <button
          onClick={() => onFilterChange("all")}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <X className="h-3 w-3" />
          Clear filter
        </button>
      )}
    </div>
  );
}