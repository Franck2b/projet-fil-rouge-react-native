import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MachineCard } from "@/components/machine-card";
import { WorkshopMap } from "@/components/workshop-map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Photo } from "@/components/ui/photo";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { ErrorState, Loading } from "@/components/ui/states";
import { openDirections } from "@/features/location/directions";
import { distanceMeters, formatDistance } from "@/features/location/distance";
import { usePosition } from "@/features/location/use-position";
import { useResource } from "@/hooks/use-resource";
import { cachedMachines, fetchMachines, fetchWorkshopBySlug } from "@/services/catalog";
import { workshopPhoto } from "@/theme/images";
import { colors, spacing, text } from "@/theme/tokens";

/** Rayon de validation d'une arrivée, identique à celui de check_in_with_code(). */
const CHECK_IN_RADIUS = 300;

/** Fiche atelier : adresse, horaires, carte, distance depuis le membre, parc sur place. */
export default function WorkshopScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { position, status, request, openSettings } = usePosition();

  const workshop = useResource(useCallback(() => fetchWorkshopBySlug(slug), [slug]));
  const machines = useResource(fetchMachines, cachedMachines);

  if (workshop.loading && !workshop.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <Loading />
      </View>
    );
  }

  if (!workshop.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <ErrorState message={workshop.error ?? "Atelier introuvable."} onRetry={workshop.refresh} />
      </View>
    );
  }

  const place = workshop.data;
  const onSite = (machines.data ?? []).filter((machine) => machine.workshop_id === place.id);

  const coordinates =
    place.latitude !== null && place.longitude !== null
      ? { latitude: place.latitude, longitude: place.longitude }
      : null;
  const distance = position && coordinates ? distanceMeters(position, coordinates) : null;

  return (
    <ScrollView style={screen.page} contentContainerStyle={screen.content}>
      <Stack.Screen options={{ title: place.city }} />

      <ScreenHeader eyebrow={place.city} title={place.name} subtitle={place.description} />

      <View style={styles.photo}>
        <Photo uri={workshopPhoto(place.slug)} alt={`Atelier de ${place.city}`} />
      </View>

      <Card>
        <Text style={text.label}>Adresse</Text>
        <Text style={text.body}>{place.address}</Text>
        <Text style={text.label}>Horaires</Text>
        <Text style={text.body}>{place.opening}</Text>

        {distance !== null ? (
          <Text style={text.strong}>À {formatDistance(distance)} de vous</Text>
        ) : status === "blocked" ? (
          <Button label="Ouvrir les réglages" variant="secondary" onPress={openSettings} />
        ) : status === "denied" ? (
          <Text style={text.small}>Position refusée : la distance n’est pas affichée.</Text>
        ) : (
          <Button label="Calculer la distance" variant="secondary" onPress={request} />
        )}
      </Card>

      {coordinates ? (
        <View style={styles.section}>
          <Text style={text.label}>Sur la carte</Text>
          <WorkshopMap workshops={[place]} position={position} checkInRadius={CHECK_IN_RADIUS} />
          <Text style={text.small}>
            Le cercle marque la zone de {CHECK_IN_RADIUS} m dans laquelle le scan d’arrivée est
            accepté.
          </Text>
          <Button
            label="Itinéraire"
            variant="secondary"
            onPress={() => openDirections(coordinates, place.name)}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={text.label}>Machines sur place</Text>

        {machines.loading && !machines.data ? <Loading /> : null}

        {onSite.map((machine) => (
          <MachineCard
            key={machine.id}
            machine={machine}
            onPress={() => router.push(`/machine/${machine.slug}`)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: "center" },
  photo: { borderWidth: 1, borderColor: colors.line },
  section: { gap: spacing.md },
});
