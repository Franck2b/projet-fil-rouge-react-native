import { StyleSheet, Text, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDistance } from "@/features/location/distance";
import { colors, spacing, text } from "@/theme/tokens";
import { CATEGORY_LABELS, MACHINE_STATUS_LABELS, type Machine } from "@/types/domain";

type Props = {
  machine: Machine;
  distance?: number | null;
  onPress: () => void;
};

export function MachineCard({ machine, distance, onPress }: Props) {
  return (
    <Card onPress={onPress} accessibilityLabel={`Voir la machine ${machine.name}`}>
      <View style={styles.row}>
        <Badge label={CATEGORY_LABELS[machine.category]} tone="rust" />
        {machine.status !== "available" ? (
          <Badge label={MACHINE_STATUS_LABELS[machine.status]} tone="amber" />
        ) : null}
      </View>

      <Text style={text.heading}>{machine.name}</Text>
      <Text style={text.body} numberOfLines={2}>
        {machine.summary}
      </Text>

      <View style={styles.footer}>
        <Text style={text.label}>
          {machine.hourly_credits} cr/h · {machine.workshop?.city ?? "—"}
        </Text>
        {distance != null ? (
          <Text style={[text.label, styles.distance]}>{formatDistance(distance)}</Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.sm },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  distance: { color: colors.rustDark },
});
