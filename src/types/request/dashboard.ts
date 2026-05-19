export const DASHBOARD_STATS_PERIOD = {
  CURRENT: "current",
  PREVIOUS: "previous",
} as const;

export type DashboardStatsPeriod =
  (typeof DASHBOARD_STATS_PERIOD)[keyof typeof DASHBOARD_STATS_PERIOD];

export type DashboardStatsRequest = {
  period?: DashboardStatsPeriod;
};

export type RoomTimelineRequest = {
  from: string;
  to: string;
};