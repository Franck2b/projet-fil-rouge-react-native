import { createClient } from "@supabase/supabase-js";
import { secureSessionStorage } from "@/storage/secure-session";

/**
 * Client Supabase unique de l'application. La clé embarquée est la clé
 * « publishable » : elle est publique par conception, ce sont les politiques RLS
 * de la base qui décident ce que chaque membre peut lire ou écrire. Aucune clé
 * secrète ne doit jamais se retrouver dans le bundle mobile.
 */

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Variables Supabase manquantes : copiez .env.example en .env puis relancez `npx expo start -c`.",
  );
}

export const supabase = createClient(url, key, {
  auth: {
    storage: secureSessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Il n'y a pas d'URL à analyser dans une app mobile.
    detectSessionInUrl: false,
  },
});
