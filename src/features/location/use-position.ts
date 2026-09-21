import { useCallback, useState } from "react";
import * as Location from "expo-location";
import type { Coordinates } from "@/features/location/distance";

/**
 * Position de l'appareil, lue à la demande. Rien n'est demandé au lancement :
 * la permission est réclamée au moment où le membre appuie sur « Autour de moi »
 * ou valide une arrivée, c'est-à-dire quand la raison est visible à l'écran.
 * Une seule lecture par appui, jamais de suivi continu (batterie).
 */

export type PositionStatus = "idle" | "loading" | "granted" | "denied" | "error";

export function usePosition() {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [status, setStatus] = useState<PositionStatus>("idle");

  const request = useCallback(async () => {
    setStatus("loading");

    const { granted } = await Location.requestForegroundPermissionsAsync();

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

  return { position, status, request };
}
