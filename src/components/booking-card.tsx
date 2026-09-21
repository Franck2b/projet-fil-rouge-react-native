import { StyleSheet, Text, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { colors, spacing, text } from "@/theme/tokens";
import { BOOKING_STATUS_LABELS, type Booking } from "@/types/domain";
import { formatCredits, formatSlot } from "@/utils/format";

type Props = {
  booking: Booking;
  onCancel?: () => void;
  cancelling?: boolean;
};

export function BookingCard({ booking, onCancel, cancelling }: Props) {
  const tone = booking.status === "confirmed" ? "moss" : booking.status === "cancelled" ? "amber" : "neutral";

  return (
    <Card>
      <View style={styles.header}>
        <Badge label={BOOKING_STATUS_LABELS[booking.status]} tone={tone} />
        <Text style={text.label}>{formatCredits(booking.credits)}</Text>
      </View>

      <Text style={text.heading}>{booking.machine.name}</Text>
      <Text style={text.body}>{formatSlot(booking.starts_at, booking.ends_at)}</Text>
      <Text style={text.small}>
        {booking.machine.workshop?.name} · {booking.machine.workshop?.city}
      </Text>

      {booking.project ? <Text style={styles.project}>« {booking.project} »</Text> : null}

      {onCancel ? (
        <View style={styles.action}>
          <Button
            label="Annuler la réservation"
            variant="danger"
            onPress={onCancel}
            loading={cancelling}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  project: { ...text.small, fontStyle: "italic", color: colors.kraft },
  action: { marginTop: spacing.sm },
});
