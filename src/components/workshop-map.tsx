import { StyleSheet, View } from "react-native";
import MapView, { Circle, Marker, type Region } from "react-native-maps";
import type { Coordinates } from "@/features/location/distance";
import { colors } from "@/theme/tokens";
import type { Workshop } from "@/types/domain";

type Props = {
  workshops: Workshop[];
  position: Coordinates | null;
  onSelect?: (workshop: Workshop) => void;
  /** Rayon autour de l'atelier dans lequel un scan d'arrivée est accepté, en mètres. */
  checkInRadius?: number;
  height?: number;
};

type Located = Workshop & Coordinates;

/**
 * Carte des ateliers, avec le membre s'il a partagé sa position. Le cadrage
 * englobe tous les points affichés ; la carte est remontée quand la position
 * arrive, pour recadrer sans suivre le membre en continu.
 */
export function WorkshopMap({ workshops, position, onSelect, checkInRadius, height = 240 }: Props) {
  const places = workshops.filter(
    (workshop): workshop is Located => workshop.latitude !== null && workshop.longitude !== null,
  );

  if (places.length === 0) return null;

  const points: Coordinates[] = position ? [...places, position] : places;

  return (
    <View style={[styles.frame, { height }]}>
      <MapView
        key={position ? "avec-position" : "sans-position"}
        style={StyleSheet.absoluteFill}
        initialRegion={regionAround(points)}
        showsUserLocation={position !== null}
        showsPointsOfInterests={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
            description={place.address}
            pinColor={colors.rust}
            onCalloutPress={onSelect ? () => onSelect(place) : undefined}
          />
        ))}

        {checkInRadius
          ? places.map((place) => (
              <Circle
                key={`rayon-${place.id}`}
                center={{ latitude: place.latitude, longitude: place.longitude }}
                radius={checkInRadius}
                strokeColor={colors.rust}
                fillColor={`${colors.rust}22`}
              />
            ))
          : null}
      </MapView>
    </View>
  );
}

/** Plus petite région contenant tous les points, avec une marge pour les épingles. */
function regionAround(points: Coordinates[]): Region {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const [minLat, maxLat] = [Math.min(...latitudes), Math.max(...latitudes)];
  const [minLon, maxLon] = [Math.min(...longitudes), Math.max(...longitudes)];

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
    longitudeDelta: Math.max((maxLon - minLon) * 1.5, 0.01),
  };
}

const styles = StyleSheet.create({
  frame: { borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
});
