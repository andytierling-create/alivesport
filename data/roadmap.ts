export type RoadmapStatus = "shipped" | "in-progress" | "not-started";

export type RoadmapItem = {
  status: RoadmapStatus;
  label: string;
  detail: string;
};

export const roadmapUpdated = "14 August 2026";

export const roadmap: RoadmapItem[] = [
  {
    status: "shipped",
    label: "SHIPPED · JULY",
    detail:
      "Accessibility filters — step-free, hoist, changing places, chairs provided",
  },
  {
    status: "in-progress",
    label: "IN PROGRESS",
    detail:
      "Club self-serve dashboard — currently we add your sessions for you by email",
  },
  {
    status: "in-progress",
    label: "IN PROGRESS",
    detail:
      "Coverage: Winchester, Eastleigh, Portsmouth — 40 clubs contacted, 11 listed",
  },
  {
    status: "not-started",
    label: "NOT STARTED",
    detail: "Booking and payments. Honestly, this may be next year.",
  },
  {
    status: "not-started",
    label: "NOT STARTED",
    detail:
      "A mobile app. The website works on your phone; that's enough for now.",
  },
];
