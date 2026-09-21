import { supabase } from "@/services/supabase";
import { readCache, writeCache } from "@/storage/cache";
import type { Machine, Workshop } from "@/types/domain";

/**
 * Lecture du catalogue (ateliers et machines). Il change rarement : on le garde
 * une heure en cache local pour afficher la liste sans attendre le réseau, et
 * pour qu'elle reste consultable hors connexion.
 */

const CACHE_MAX_AGE = 60 * 60 * 1000;

const MACHINE_FIELDS =
  "id, workshop_id, slug, name, category, status, summary, description, hourly_credits," +
  " workshop:workshops (id, slug, name, city, latitude, longitude)";

const WORKSHOP_FIELDS = "id, slug, name, city, address, latitude, longitude, description, opening";

export async function fetchWorkshops(): Promise<Workshop[]> {
  const { data, error } = await supabase
    .from("workshops")
    .select(WORKSHOP_FIELDS)
    .order("city");

  if (error) throw new Error(error.message);

  await writeCache("workshops", data);
  return data;
}

export async function fetchWorkshopBySlug(slug: string): Promise<Workshop> {
  const { data, error } = await supabase
    .from("workshops")
    .select(WORKSHOP_FIELDS)
    .eq("slug", slug)
    .single<Workshop>();

  if (error) throw new Error(error.message);

  return data;
}

export async function fetchMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from("machines")
    .select(MACHINE_FIELDS)
    .neq("status", "retired")
    .order("name")
    .returns<Machine[]>();

  if (error) throw new Error(error.message);

  await writeCache("machines", data);
  return data;
}

export async function fetchMachineBySlug(slug: string): Promise<Machine> {
  const { data, error } = await supabase
    .from("machines")
    .select(MACHINE_FIELDS)
    .eq("slug", slug)
    .single<Machine>();

  if (error) throw new Error(error.message);

  return data;
}

/** Dernière version connue du catalogue, affichée le temps que le réseau réponde. */
export function cachedWorkshops() {
  return readCache<Workshop[]>("workshops", CACHE_MAX_AGE);
}

export function cachedMachines() {
  return readCache<Machine[]>("machines", CACHE_MAX_AGE);
}
