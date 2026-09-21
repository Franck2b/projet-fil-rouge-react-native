import { supabase } from "@/services/supabase";
import { readCache, writeCache } from "@/storage/cache";
import type { Booking } from "@/types/domain";

/**
 * Réservations du membre connecté. La lecture passe par la table (protégée par
 * RLS : un membre ne voit que ses lignes) ; la création et l'annulation passent
 * par des fonctions SQL, seules habilitées à toucher aux crédits.
 */

const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

const BOOKING_FIELDS =
  "id, machine_id, starts_at, ends_at, status, credits, project," +
  " machine:machines (slug, name, category, workshop:workshops (slug, name, city))";

export async function fetchMyBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(BOOKING_FIELDS)
    .order("starts_at", { ascending: false })
    .returns<Booking[]>();

  if (error) throw new Error(error.message);

  await writeCache("bookings", data);
  return data;
}

export function cachedBookings() {
  return readCache<Booking[]>("bookings", CACHE_MAX_AGE);
}

/** Créneaux déjà pris sur une machine, sans rien révéler des autres membres. */
export async function fetchBusySlots(machineId: string, day: string) {
  const { data, error } = await supabase.rpc("machine_busy_slots", {
    p_machine_id: machineId,
    p_day: day,
  });

  if (error) throw new Error(error.message);

  return data as { starts_at: string; ends_at: string }[];
}

export async function bookMachine(input: {
  machineId: string;
  startsAt: Date;
  endsAt: Date;
  project: string;
}) {
  const { data, error } = await supabase.rpc("book_machine", {
    p_machine_id: input.machineId,
    p_starts_at: input.startsAt.toISOString(),
    p_ends_at: input.endsAt.toISOString(),
    p_project: input.project,
  });

  if (error) throw new Error(error.message);

  return data as string;
}

export async function cancelBooking(bookingId: string) {
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });

  if (error) throw new Error(error.message);
}
