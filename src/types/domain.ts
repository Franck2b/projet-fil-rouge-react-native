// Types du domaine, alignés sur le schéma Supabase partagé avec le site web
// (supabase/migrations/0001_init.sql du projet Next.js).

export const MACHINE_CATEGORY_VALUES = [
  "laser",
  "impression_3d",
  "bois",
  "metal",
  "textile",
  "electronique",
] as const;

export type MachineCategory = (typeof MACHINE_CATEGORY_VALUES)[number];

export type MachineStatus = "available" | "maintenance" | "retired";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type CertificationStatus = "pending" | "approved" | "rejected";

export type Workshop = {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  opening: string;
};

export type Machine = {
  id: string;
  workshop_id: string;
  slug: string;
  name: string;
  category: MachineCategory;
  status: MachineStatus;
  summary: string;
  description: string;
  hourly_credits: number;
  workshop: Pick<Workshop, "id" | "slug" | "name" | "city" | "latitude" | "longitude"> | null;
};

export type Profile = {
  id: string;
  full_name: string;
  credits_balance: number;
  onboarding_completed: boolean;
  home_workshop_id: string | null;
};

export type Certification = {
  id: string;
  category: MachineCategory;
  status: CertificationStatus;
  created_at: string;
};

export type Booking = {
  id: string;
  machine_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  credits: number;
  project: string;
  machine: Pick<Machine, "slug" | "name" | "category"> & {
    workshop: Pick<Workshop, "slug" | "name" | "city"> | null;
  };
};

export type CheckIn = {
  id: string;
  created_at: string;
  distance_m: number | null;
  machine_name: string;
  machine_slug: string;
  workshop_name: string;
};

export const CATEGORY_LABELS: Record<MachineCategory, string> = {
  laser: "Découpe laser",
  impression_3d: "Impression 3D",
  bois: "Bois",
  metal: "Métal",
  textile: "Textile",
  electronique: "Électronique",
};

export const MACHINE_STATUS_LABELS: Record<MachineStatus, string> = {
  available: "Disponible",
  maintenance: "En maintenance",
  retired: "Retirée",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  completed: "Terminée",
};
