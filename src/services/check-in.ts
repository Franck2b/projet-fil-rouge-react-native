import { supabase } from "@/services/supabase";
import type { CheckIn } from "@/types/domain";

export type CheckInResult = {
  booking_id: string;
  machine_name: string;
  workshop_name: string;
  starts_at: string;
  ends_at: string;
  distance_m: number | null;
};

/**
 * Valide une arrivée à partir du QR code collé sur la machine. Le téléphone
 * n'envoie que le slug lu et, si le membre l'a autorisée, sa position : c'est
 * la fonction SQL qui vérifie la réservation, le créneau et la distance.
 */
export async function checkIn(input: {
  machineSlug: string;
  latitude: number | null;
  longitude: number | null;
}): Promise<CheckInResult> {
  const { data, error } = await supabase.rpc("check_in_with_code", {
    p_machine_slug: input.machineSlug,
    p_latitude: input.latitude,
    p_longitude: input.longitude,
  });

  if (error) throw new Error(error.message);

  return data as CheckInResult;
}

export async function fetchMyCheckIns(): Promise<CheckIn[]> {
  const { data, error } = await supabase.rpc("my_check_ins");

  if (error) throw new Error(error.message);

  return data as CheckIn[];
}
