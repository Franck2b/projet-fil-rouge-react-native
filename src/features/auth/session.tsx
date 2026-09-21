import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { fetchProfile } from "@/services/account";
import { supabase } from "@/services/supabase";
import { clearCache } from "@/storage/cache";
import type { Profile } from "@/types/domain";

/**
 * Source unique de vérité pour « qui est connecté ». La session est restaurée au
 * lancement depuis le trousseau, puis maintenue par Supabase ; le profil (nom,
 * solde de crédits) est rechargé après chaque action qui le modifie.
 */

type SessionValue = {
  session: Session | null;
  profile: Profile | null;
  /** Vrai tant qu'on ne sait pas encore si une session existe : on n'affiche rien avant. */
  restoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setRestoring(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      // Déconnexion : le profil affiché ne doit pas survivre à la session.
      if (!next) setProfile(null);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!userId) return;

    let active = true;
    fetchProfile(userId)
      .then((value) => {
        if (active) setProfile(value);
      })
      // Un profil illisible (réseau coupé) ne doit pas déconnecter le membre :
      // les écrans affichent alors leur propre état d'erreur.
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [userId]);

  /**
   * iOS et Android suspendent les minuteurs d'une app en arrière-plan : sans ça,
   * le jeton d'accès ne se rafraîchit plus et la première requête au retour
   * échoue en 401.
   */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        supabase.auth.startAutoRefresh();
      } else {
        supabase.auth.stopAutoRefresh();
      }
    });

    supabase.auth.startAutoRefresh();

    return () => {
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;
    setProfile(await fetchProfile(userId));
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw new Error(error.message);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Les données en cache appartiennent au membre qui vient de partir.
    await clearCache();
  }, []);

  const value = useMemo(
    () => ({ session, profile, restoring, signIn, signUp, signOut, refreshProfile }),
    [session, profile, restoring, signIn, signUp, signOut, refreshProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);

  if (!value) {
    throw new Error("useSession doit être utilisé dans un <SessionProvider>.");
  }

  return value;
}
