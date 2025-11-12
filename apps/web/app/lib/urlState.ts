//[P2][UI][CODE] Type-safe URL state management with nuqs
// Tags: P2, UI, CODE, url-state, nuqs

import {
  useQueryState,
  parseAsString,
  parseAsInteger,
  parseAsStringEnum,
  parseAsIsoDateTime,
  parseAsBoolean,
} from "nuqs";

/**
 * Schedule view modes
 */
export type ScheduleView = "day" | "week" | "month";

/**
 * Hook: Calendar view state (day/week/month)
 * URL: ?view=week
 */
export function useScheduleView(defaultValue: ScheduleView = "week") {
  return useQueryState(
    "view",
    parseAsStringEnum<ScheduleView>(["day", "week", "month"]).withDefault(defaultValue),
  );
}

/**
 * Hook: Selected date state
 * URL: ?date=2025-11-06
 */
export function useSelectedDate(defaultValue?: Date) {
  return useQueryState("date", parseAsIsoDateTime.withDefault(defaultValue || new Date()));
}

/**
 * Hook: Filter by position ID
 * URL: ?position=pos-123
 */
export function usePositionFilter() {
  return useQueryState("position", parseAsString);
}

/**
 * Hook: Filter by user ID
 * URL: ?user=user-456
 */
export function useUserFilter() {
  return useQueryState("user", parseAsString);
}

/**
 * Hook: Show archived schedules
 * URL: ?archived=true
 */
export function useShowArchived() {
  return useQueryState("archived", parseAsBoolean.withDefault(false));
}

/**
 * Hook: Pagination - page number
 * URL: ?page=2
 */
export function usePage() {
  return useQueryState("page", parseAsInteger.withDefault(1));
}

/**
 * Hook: Pagination - items per page
 * URL: ?limit=50
 */
export function usePageSize(defaultSize = 25) {
  return useQueryState("limit", parseAsInteger.withDefault(defaultSize));
}

/**
 * Hook: Search query
 * URL: ?q=search+term
 */
export function useSearchQuery() {
  return useQueryState("q", parseAsString.withDefault(""));
}

/**
 * Combined hook for schedule filters
 * Returns all common filters in one object
 */
export function useScheduleFilters() {
  const [view, setView] = useScheduleView();
  const [date, setDate] = useSelectedDate();
  const [position, setPosition] = usePositionFilter();
  const [user, setUser] = useUserFilter();
  const [archived, setArchived] = useShowArchived();

  return {
    view,
    setView,
    date,
    setDate,
    position,
    setPosition,
    user,
    setUser,
    archived,
    setArchived,
  };
}
