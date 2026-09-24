export type ContentPlanItem = {
  id: string;
  date: string;
  time?: string;
  format: "feed" | "story" | "reel";
  productId?: string;
  title: string;
  caption: string;
  mediaSuggestion: string;
  callToAction?: string;
  status: "planned" | "ready" | "scheduled" | "published" | "skipped";
  notes?: string;
};
