export const PACE_OPTIONS = [
  { value: "tranquilo", label: "Tranquilo" },
  { value: "intenso", label: "Intenso" },
] as const;

export const PLAN_OPTIONS = [
  { value: "naturaleza", label: "Naturaleza" },
  { value: "playa", label: "Playa" },
  { value: "pueblos", label: "Pueblos" },
  { value: "gastronomia", label: "Gastronomía" },
] as const;

export type Pace = (typeof PACE_OPTIONS)[number]["value"];
export type PlanType = (typeof PLAN_OPTIONS)[number]["value"];

export interface RouteInput {
  zona: string;
  dias: number;
  ritmo: Pace;
  plan: PlanType;
}

export interface Stop {
  name: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  driving: { from: string; to: string; hours: number };
  stops: Stop[];
  overnight: { name: string; notes: string };
}

export interface Itinerary {
  title: string;
  summary: string;
  days: ItineraryDay[];
}

export interface SavedRoute {
  id: string;
  input: RouteInput;
  itinerary: Itinerary;
  created_at: string;
}

export interface Credits {
  free_used: number;
  paid_credits: number;
}

export const FREE_ROUTES = 1;
export const PACK_ROUTES = 5;
export const PACK_PRICE = "4,99 €";

export const remainingRoutes = (c: Credits | null): number =>
  c ? Math.max(0, FREE_ROUTES - c.free_used) + c.paid_credits : FREE_ROUTES;
