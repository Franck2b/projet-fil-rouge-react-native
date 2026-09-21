import type { MachineCategory } from "@/types/domain";

/**
 * Les photos sont celles du site (Wikimedia Commons, crédits sur
 * /credits). On les sert depuis le site déployé plutôt que de les embarquer :
 * le bundle reste léger et une photo mise à jour sur le web l'est aussi ici.
 * expo-image garde ensuite chaque image en cache sur le téléphone.
 */

const BASE = "https://fil-rouge-next.vercel.app/img/photos";

export const HERO_PHOTO = `${BASE}/hero.jpg`;

export function categoryPhoto(category: MachineCategory) {
  return `${BASE}/machine-${category.replace("_", "-")}.jpg`;
}

export function workshopPhoto(slug: string) {
  return `${BASE}/atelier-${slug}.jpg`;
}
