import type { Booking } from "@/types/domain";

/**
 * Sépare les réservations en « à venir » et « passées ». L'heure courante est
 * lue ici, dans une fonction ordinaire : la lire pendant le rendu d'un composant
 * rendrait celui-ci impur, donc imprévisible d'un rendu à l'autre.
 */
export function splitBookings(bookings: Booking[]) {
  const now = Date.now();

  const upcoming = bookings
    .filter((booking) => booking.status === "confirmed" && new Date(booking.ends_at).getTime() > now)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const past = bookings.filter((booking) => !upcoming.includes(booking));

  return { upcoming, past };
}
