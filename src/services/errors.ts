/**
 * Traduction des erreurs techniques en phrases affichables. Les fonctions SQL
 * lèvent des codes stables (CERTIFICATION_REQUIRED, SLOT_TAKEN…) : on les
 * reconnaît ici, une seule fois, au lieu de recopier des messages dans chaque
 * écran.
 */

const MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "Votre session a expiré. Reconnectez-vous.",
  MACHINE_NOT_FOUND: "Cette machine n'existe plus.",
  MACHINE_UNAVAILABLE: "Cette machine est en maintenance.",
  INVALID_RANGE: "Ce créneau est invalide.",
  SLOT_IN_PAST: "Ce créneau est déjà passé.",
  SLOT_TAKEN: "Ce créneau vient d'être pris par un autre membre.",
  CERTIFICATION_REQUIRED: "Il vous faut l'habilitation de cette famille de machines.",
  INSUFFICIENT_CREDITS: "Votre solde de crédits est insuffisant.",
  BOOKING_NOT_FOUND: "Cette réservation n'existe plus.",
  NOT_CANCELLABLE: "Cette réservation ne peut plus être annulée.",
  FORBIDDEN: "Vous n'avez pas accès à cette action.",
  UNKNOWN_CODE: "Ce QR code ne correspond à aucune machine Gabarit.",
  NO_BOOKING: "Aucune réservation en cours sur cette machine.",
  ALREADY_CHECKED_IN: "Votre arrivée est déjà enregistrée pour ce créneau.",
  TOO_FAR: "Vous êtes trop loin de l'atelier pour valider votre arrivée.",
  "Invalid login credentials": "Adresse e-mail ou mot de passe incorrect.",
  "User already registered": "Un compte existe déjà avec cette adresse.",
};

const NETWORK_MESSAGE = "Connexion impossible. Vérifiez votre réseau puis réessayez.";

export function toMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Une erreur est survenue.";

  const raw = error.message;

  for (const [code, message] of Object.entries(MESSAGES)) {
    if (raw.includes(code)) return message;
  }

  if (raw.includes("Network request failed") || raw.includes("fetch")) {
    return NETWORK_MESSAGE;
  }

  return raw;
}
