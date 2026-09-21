import { useCallback, useEffect, useState } from "react";
import { toMessage } from "@/services/errors";

/**
 * Chargement d'une donnée distante, avec les quatre états qu'un écran mobile
 * doit savoir montrer : chargement, erreur, vide, contenu. Le hook accepte un
 * lecteur de cache facultatif : son résultat s'affiche immédiatement, puis le
 * réseau met à jour.
 *
 * `loader` et `cacheLoader` doivent être stables (useCallback) : ce sont eux qui
 * décident quand relancer la requête, et une fonction recréée à chaque rendu
 * provoquerait une boucle d'appels réseau.
 */

export type Resource<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
};

export function useResource<T>(
  loader: () => Promise<T>,
  cacheLoader?: () => Promise<T | null>,
): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;

    async function run() {
      setLoading(true);
      setError(null);

      if (cacheLoader) {
        const cached = await cacheLoader();
        // Le cache ne doit jamais écraser une réponse réseau déjà arrivée.
        if (active && cached !== null) {
          setData(cached);
          setLoading(false);
        }
      }

      try {
        const fresh = await loader();
        if (active) {
          setData(fresh);
          setError(null);
        }
      } catch (cause) {
        if (active) setError(toMessage(cause));
      } finally {
        if (active) setLoading(false);
      }
    }

    run();

    // L'écran a pu être quitté entre-temps : on ignore la réponse tardive.
    return () => {
      active = false;
    };
  }, [loader, cacheLoader]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await loader());
      setError(null);
    } catch (cause) {
      setError(toMessage(cause));
    } finally {
      setRefreshing(false);
    }
  }, [loader]);

  return { data, error, loading, refreshing, refresh };
}
