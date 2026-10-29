import { supabase } from "./supabase";
import type { RouteInput, SavedRoute } from "./types";

export class ApiError extends Error {
  code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.code = code;
  }
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = "Algo ha fallado. Inténtalo de nuevo.";
    let code: string | undefined;
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === "function") {
      try {
        const payload = await ctx.json();
        if (payload?.error) message = payload.error;
        code = payload?.code;
      } catch {
        // respuesta sin JSON: dejamos el mensaje genérico
      }
    }
    throw new ApiError(message, code);
  }
  return data as T;
}

export const generateRoute = (input: RouteInput) =>
  invoke<{ route: SavedRoute }>("generate-route", { ...input });

export const createCheckout = () =>
  invoke<{ url: string }>("create-checkout", {});
