import { supabase } from "@/services/supabase";
import type { Certification, Profile } from "@/types/domain";

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role, credits_balance, onboarding_completed, home_workshop_id")
    .eq("id", userId)
    .single<Profile>();

  if (error) throw new Error(error.message);

  return data;
}

export async function fetchCertifications(): Promise<Certification[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select("id, category, status, created_at")
    .order("created_at", { ascending: false })
    .returns<Certification[]>();

  if (error) throw new Error(error.message);

  return data;
}
