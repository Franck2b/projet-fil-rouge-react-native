import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/card";
import { formatDistance } from "@/features/location/distance";
import { colors, spacing, text } from "@/theme/tokens";
import type { Workshop } from "@/types/domain";

type Props = {
  workshop: Workshop;
  distance?: number | null;
  onPress: () => void;
};

export function WorkshopCard({ workshop, distance, onPress }: Props) {
  return (
    <Card onPress={onPress} accessibilityLabel={`Voir l'atelier ${workshop.name}`}>
      <View style={styles.header}>
        <Text style={text.label}>{workshop.city}</Text>
        {distance != null ? (
          <Text style={[text.label, styles.distance]}>à {formatDistance(distance)}</Text>
        ) : null}
      </View>

      <Text style={text.heading}>{workshop.name}</Text>
      <Text style={text.small}>{workshop.address}</Text>
      <Text style={text.label}>{workshop.opening}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  distance: { color: colors.rustDark },
});
