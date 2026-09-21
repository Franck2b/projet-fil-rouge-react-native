import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Cache local des données non sensibles (catalogue, réservations déjà vues).
 * Il sert à afficher quelque chose immédiatement à l'ouverture et à survivre à
 * une perte de réseau. Ce n'est pas une base : la vérité reste Supabase.
 */

type Entry<T> = { savedAt: number; value: T };

export async function readCache<T>(key: string, maxAgeMs: number): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`cache.${key}`);
    if (!raw) return null;

    const entry = JSON.parse(raw) as Entry<T>;
    if (Date.now() - entry.savedAt > maxAgeMs) return null;

    return entry.value;
  } catch {
    // Un cache illisible ne doit jamais casser l'écran : on l'ignore.
    return null;
  }
}

export async function writeCache<T>(key: string, value: T) {
  const entry: Entry<T> = { savedAt: Date.now(), value };
  try {
    await AsyncStorage.setItem(`cache.${key}`, JSON.stringify(entry));
  } catch {
    // Disque plein ou quota : tant pis, l'app fonctionne sans cache.
  }
}

export async function clearCache() {
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove(keys.filter((key) => key.startsWith("cache.")));
}
