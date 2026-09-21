import { supabase } from "@/services/supabase";
import type { MachineCategory } from "@/types/domain";

/**
 * Lectures et décisions réservées aux responsables d'atelier. Aucune clé
 * privilégiée n'est embarquée : le client porte le jeton de l'administrateur et
 * ce sont les politiques RLS `is_admin()` qui ouvrent ces lignes. Un membre qui
 * appellerait ces fonctions ne verrait que les siennes.
 */

export type PendingCertification = {
  id: string;
  category: MachineCategory;
  motivation: string;
  created_at: string;
  profile: { id: string; full_name: string } | null;
};

/**
 * `certifications` porte deux clés étrangères vers `profiles` (user_id et
 * reviewed_by) : sans nommer la contrainte, PostgREST ne sait pas laquelle
 * joindre. D'où le `!certifications_user_id_fkey`.
 */
const SELECT =
  "id, category, motivation, created_at, profile:profiles!certifications_user_id_fkey (id, full_name)";

export async function fetchPendingCertifications(): Promise<PendingCertification[]> {
  const { data, error } = await supabase
    .from("certifications")
    .select(SELECT)
    .eq("status", "pending")
    .order("created_at")
    .returns<PendingCertification[]>();

  if (error) throw new Error(error.message);

  return data;
}

export async function reviewCertification(input: {
  certificationId: string;
  decision: "approved" | "rejected";
  reviewerId: string;
}) {
  const { error } = await supabase
    .from("certifications")
    .update({
      status: input.decision,
      reviewed_by: input.reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", input.certificationId);

  if (error) throw new Error(error.message);
}
