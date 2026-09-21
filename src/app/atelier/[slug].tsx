import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MachineCard } from "@/components/machine-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Photo } from "@/components/ui/photo";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { ErrorState, Loading } from "@/components/ui/states";
import { distanceMeters, formatDistance } from "@/features/location/distance";
import { usePosition } from "@/features/location/use-position";
import { useResource } from "@/hooks/use-resource";
import { cachedMachines, fetchMachines, fetchWorkshopBySlug } from "@/services/catalog";
import { workshopPhoto } from "@/theme/images";
import { colors, spacing, text } from "@/theme/tokens";

/** Fiche atelier : adresse, horaires, distance depuis le membre, parc sur place. */
export default function WorkshopScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { position, status, request } = usePosition();

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

  const distance =
    position && place.latitude !== null && place.longitude !== null
      ? distanceMeters(position, { latitude: place.latitude, longitude: place.longitude })
      : null;

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
        ) : status === "denied" ? (
          <Text style={text.small}>Position refusée : la distance n’est pas affichée.</Text>
        ) : (
          <Button label="Calculer la distance" variant="secondary" onPress={request} />
        )}
      </Card>

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
