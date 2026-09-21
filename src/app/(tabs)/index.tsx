import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookingCard } from "@/components/booking-card";
import { Hero } from "@/components/hero";
import { WorkshopCard } from "@/components/workshop-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { screen } from "@/components/ui/screen";
import { ErrorState, Loading } from "@/components/ui/states";
import { useSession } from "@/features/auth/session";
import { splitBookings } from "@/features/booking/split";
import { byDistance } from "@/features/location/distance";
import { usePosition } from "@/features/location/use-position";
import { useResource } from "@/hooks/use-resource";
import { cachedBookings, fetchMyBookings } from "@/services/bookings";
import { cachedWorkshops, fetchWorkshops } from "@/services/catalog";
import { colors, spacing, text } from "@/theme/tokens";

/**
 * Écran d'ouverture, pensé pour quelqu'un qui est déjà en route : son solde, sa
 * prochaine séance, et les ateliers les plus proches de là où il se trouve.
 */
export default function HomeScreen() {
  const { profile } = useSession();
  const router = useRouter();
  const { position, status, request, openSettings } = usePosition();

  const workshops = useResource(fetchWorkshops, cachedWorkshops);
  const bookings = useResource(fetchMyBookings, cachedBookings);

  const { upcoming } = splitBookings(bookings.data ?? []);
  const nextBooking = upcoming[0];
  const places = byDistance(workshops.data ?? [], position).slice(0, 3);

  const firstName = profile?.full_name.split(" ")[0] ?? "";

  async function refresh() {
    await Promise.all([workshops.refresh(), bookings.refresh()]);
  }

  return (
    <ScrollView
      style={screen.page}
      contentContainerStyle={styles.page}
      refreshControl={
        <RefreshControl
          refreshing={workshops.refreshing || bookings.refreshing}
          onRefresh={refresh}
          tintColor={colors.rust}
        />
      }
    >
      <Hero withLogo eyebrow="Votre atelier" title="Bonjour" accent={firstName}>
        <View style={styles.stats}>
          <Stat value={profile ? String(profile.credits_balance) : "—"} label="Crédits" />
          <Stat value={String(upcoming.length)} label="À venir" />
          <Stat value={String(workshops.data?.length ?? 0)} label="Ateliers" />
        </View>
      </Hero>

      <View style={screen.content}>
        <View style={styles.section}>
          <Text style={text.label}>Prochaine séance</Text>

          {bookings.loading && !bookings.data ? <Loading /> : null}

          {nextBooking ? (
            <>
              <BookingCard booking={nextBooking} />
              <Button label="Je suis sur place" onPress={() => router.push("/arrivee")} />
            </>
          ) : bookings.data ? (
            <Card>
              <Text style={text.body}>
                Aucune séance à venir. Réservez une machine, puis scannez son QR code en arrivant à
                l’atelier.
              </Text>
              <Button
                label="Voir les machines"
                variant="secondary"
                onPress={() => router.push("/machines")}
              />
            </Card>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={text.label}>Ateliers</Text>

          {status === "idle" ? (
            <Card>
              <Text style={text.body}>
                Autorisez la position pour classer les trois ateliers du plus proche au plus loin.
              </Text>
              <Button label="Trier par distance" variant="secondary" onPress={request} />
            </Card>
          ) : null}

          {status === "loading" ? <Loading label="Lecture de votre position…" /> : null}

          {status === "denied" ? (
            <Card>
              <Text style={text.body}>
                Position refusée : les ateliers restent affichés, simplement sans distance.
              </Text>
              <Button label="Redemander" variant="secondary" onPress={request} />
            </Card>
          ) : null}

          {status === "blocked" ? (
            <Card>
              <Text style={text.body}>
                La position est bloquée pour cette app. Le téléphone ne reposera plus la question :
                elle se réactive depuis les réglages.
              </Text>
              <Button label="Ouvrir les réglages" variant="secondary" onPress={openSettings} />
            </Card>
          ) : null}

          {status === "error" ? (
            <Card>
              <Text style={text.body}>
                Position introuvable pour le moment. Réessayez une fois dehors ou près d’une
                fenêtre.
              </Text>
              <Button label="Réessayer" variant="secondary" onPress={request} />
            </Card>
          ) : null}

          {workshops.error && !workshops.data ? (
            <ErrorState message={workshops.error} onRetry={workshops.refresh} />
          ) : null}

          {places.map((workshop) => (
            <WorkshopCard
              key={workshop.id}
              workshop={workshop}
              distance={workshop.distance}
              onPress={() => router.push(`/atelier/${workshop.slug}`)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/** Une cote du bandeau sombre : un chiffre, une étiquette. */
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingBottom: spacing.xxl },
  section: { gap: spacing.md },
  stats: {
    flexDirection: "row",
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: "#F5F1E826",
  },
  stat: {
    flex: 1,
    padding: spacing.md,
    borderRightWidth: 1,
    borderRightColor: "#F5F1E826",
  },
  statValue: { ...text.title, color: colors.paper, fontSize: 26, lineHeight: 30 },
  statLabel: { ...text.label, marginTop: spacing.xs },
});
