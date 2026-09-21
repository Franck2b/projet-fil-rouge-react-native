import * as SecureStore from "expo-secure-store";

/**
 * Stockage de la session Supabase (jeton d'accès et de rafraîchissement) dans le
 * trousseau du téléphone plutôt que dans un simple fichier : c'est ce qui permet
 * de rester connecté après fermeture de l'app sans exposer le jeton.
 *
 * SecureStore refuse les valeurs de plus de 2 Ko et une session JWT les dépasse.
 * On découpe donc la valeur en tranches : la clé principale garde le nombre de
 * tranches, les suivantes gardent le contenu.
 */

const CHUNK_SIZE = 1800;

function chunkKey(key: string, index: number) {
  return `${key}.${index}`;
}

async function removeChunks(key: string, count: number) {
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(chunkKey(key, index));
  }
}

export const secureSessionStorage = {
  async getItem(key: string) {
    const header = await SecureStore.getItemAsync(key);
    if (!header) return null;

    const count = Number(header);
    if (!Number.isInteger(count) || count < 1) return null;

    let value = "";
    for (let index = 0; index < count; index += 1) {
      const chunk = await SecureStore.getItemAsync(chunkKey(key, index));
      // Une tranche manquante rend la session illisible : mieux vaut repartir
      // d'une session vide que de renvoyer un JSON tronqué.
      if (chunk === null) return null;
      value += chunk;
    }

    return value;
  },

  async setItem(key: string, value: string) {
    const previous = Number(await SecureStore.getItemAsync(key));
    if (Number.isInteger(previous) && previous > 0) {
      await removeChunks(key, previous);
    }

    const chunks = value.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "gs")) ?? [""];

    for (const [index, chunk] of chunks.entries()) {
      await SecureStore.setItemAsync(chunkKey(key, index), chunk);
    }

    await SecureStore.setItemAsync(key, String(chunks.length));
  },

  async removeItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(key));
    if (Number.isInteger(count) && count > 0) {
      await removeChunks(key, count);
    }
    await SecureStore.deleteItemAsync(key);
  },
};
