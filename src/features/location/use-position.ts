import { useCallback, useState } from "react";
import { Linking } from "react-native";
import * as Location from "expo-location";
import type { Coordinates } from "@/features/location/distance";

/**
 * Position de l'appareil, lue à la demande. Rien n'est demandé au lancement :
 * la permission est réclamée au moment où le membre appuie sur « Autour de moi »
 * ou valide une arrivée, c'est-à-dire quand la raison est visible à l'écran.
 * Une seule lecture par appui, jamais de suivi continu (batterie).
 */

export type PositionStatus =
  | "idle"
  | "loading"
  | "granted"
  /** Refusée cette fois-ci : on pourra redemander. */
  | "denied"
  /** Refusée définitivement : iOS ne réaffichera plus sa fenêtre, il faut passer par les réglages. */
  | "blocked"
  | "error";

export function usePosition() {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<PositionStatus>("idle");

  const request = useCallback(async () => {
    setStatus("loading");

    // iOS n'affiche sa fenêtre « Autoriser » qu'une seule fois par installation.
    // On regarde donc d'abord où on en est : si l'on peut encore demander, le
    // système reprend la main ; sinon, seuls les réglages peuvent débloquer.
    const current = await Location.getForegroundPermissionsAsync();
    let granted = current.granted;

    if (!granted) {
      if (!current.canAskAgain) {
        setStatus("blocked");
        setPosition(null);
        return null;
      }

      const asked = await Location.requestForegroundPermissionsAsync();
      granted = asked.granted;
    }

    if (!granted) {
      setStatus("denied");
      setPosition(null);
      return null;
    }

    try {
      const reading = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = {
        latitude: reading.coords.latitude,
        longitude: reading.coords.longitude,
      };

      setPosition(next);
      setStatus("granted");
      return next;
    } catch {
      // GPS coupé, intérieur sans signal, appareil sans capteur : l'app continue.
      setStatus("error");
      setPosition(null);
      return null;
    }
  }, []);

  /** Ouvre la fiche de l'app dans les Réglages du téléphone. */
  const openSettings = useCallback(() => Linking.openSettings(), []);

  return { position, status, request, openSettings };
}
