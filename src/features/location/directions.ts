import { Linking, Platform } from "react-native";
import type { Coordinates } from "@/features/location/distance";

/**
 * Confie l'itinéraire à l'application de cartes du téléphone (Plans sur iOS,
 * Google Maps ou équivalent sur Android) plutôt que de le recalculer dans l'app.
 */
export function openDirections({ latitude, longitude }: Coordinates, label: string) {
  const name = encodeURIComponent(label);
  const url = Platform.select({
    ios: `maps:?daddr=${latitude},${longitude}&q=${name}`,
    default: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${name})`,
  });

  return Linking.openURL(url);
}
