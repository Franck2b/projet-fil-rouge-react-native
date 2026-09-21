import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { BookingCard } from "@/components/booking-card";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useSession } from "@/features/auth/session";
import { splitBookings } from "@/features/booking/split";
import { useResource } from "@/hooks/use-resource";
import { cachedBookings, cancelBooking, fetchMyBookings } from "@/services/bookings";
import { toMessage } from "@/services/errors";
import { colors, spacing, text } from "@/theme/tokens";

/**
 * Historique complet des réservations du membre. L'annulation repasse par la
 * fonction SQL cancel_booking : c'est elle qui décide du remboursement.
 */
export default function BookingsScreen() {
  const { refreshProfile } = useSession();
  const bookings = useResource(fetchMyBookings, cachedBookings);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const all = bookings.data ?? [];
  const { upcoming, past } = splitBookings(all);

  function confirmCancel(bookingId: string) {
    Alert.alert(
      "Annuler la réservation ?",
      "Les crédits sont remboursés si le créneau commence dans plus de deux heures.",
      [
        { text: "Garder", style: "cancel" },
        { text: "Annuler la réservation", style: "destructive", onPress: () => cancel(bookingId) },
      ],
    );
  }

  async function cancel(bookingId: string) {
    setCancellingId(bookingId);

    try {
      await cancelBooking(bookingId);
      await Promise.all([bookings.refresh(), refreshProfile()]);
    } catch (cause) {
      Alert.alert("Annulation impossible", toMessage(cause));
    } finally {
      setCancellingId(null);
    }
  }

  if (bookings.loading && !bookings.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <Loading label="Chargement de vos réservations…" />
      </View>
    );
  }

  if (bookings.error && !bookings.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <ErrorState message={bookings.error} onRetry={bookings.refresh} />
      </View>
    );
  }

  return (
    <ScrollView
      style={screen.page}
      contentContainerStyle={screen.content}
      refreshControl={
        <RefreshControl
          refreshing={bookings.refreshing}
          onRefresh={bookings.refresh}
          tintColor={colors.rust}
        />
      }
    >
      <ScreenHeader eyebrow="Mon planning" title="Réservations" />

      {all.length === 0 ? (
        <EmptyState
          title="Rien de réservé"
          message="Choisissez une machine dans le catalogue pour réserver votre premier créneau."
        />
      ) : null}

      {upcoming.length > 0 ? (
        <View style={styles.section}>
          <Text style={text.label}>À venir</Text>
          {upcoming.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={() => confirmCancel(booking.id)}
              cancelling={cancellingId === booking.id}
            />
          ))}
        </View>
      ) : null}

      {past.length > 0 ? (
        <View style={styles.section}>
          <Text style={text.label}>Passées et annulées</Text>
          {past.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: "center" },
  section: { gap: spacing.md },
});
