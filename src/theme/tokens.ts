/**
 * Mêmes couleurs et mêmes règles typographiques que le site Next.js : papier
 * clair, encre charbon, un seul accent (rouille), aucun arrondi. Tout passe par
 * ces constantes pour qu'un changement de teinte se fasse à un seul endroit.
 */

export const colors = {
  ink: "#15130F",
  inkSoft: "#3B372F",
  kraft: "#8A8578",
  line: "#DDD6C6",
  bone: "#F5F1E8",
  paper: "#FFFDF8",
  rust: "#D4581B",
  rustDark: "#A9430F",
  rustWash: "#FBE9DF",
  moss: "#2F6F4E",
  mossWash: "#E4EFE8",
  amber: "#9A6A05",
  amberWash: "#F7EED6",
  brick: "#9B2C1E",
  brickWash: "#F8E4E0",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** Une zone tactile descend rarement sous 44 pt : c'est la taille d'un doigt. */
export const touchTarget = 44;

export const text = {
  title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5, color: colors.ink },
  heading: { fontSize: 20, fontWeight: "700", color: colors.ink },
  body: { fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  strong: { fontSize: 15, fontWeight: "600", color: colors.ink },
  small: { fontSize: 13, color: colors.inkSoft },
  /** Étiquette technique : petites capitales espacées, comme une cote sur un plan. */
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.kraft,
  },
} as const;
