import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/button";
import { colors, spacing, text } from "@/theme/tokens";

/** Les trois écrans d'attente que toute liste doit savoir montrer. */

export function Loading({ label = "Chargement…" }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.rust} />
      <Text style={text.small}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>Ça n’a pas marché</Text>
      <Text style={[text.body, styles.centered]}>{message}</Text>
      {onRetry ? <Button label="Réessayer" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[text.body, styles.centered]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xl,
  },
  title: { ...text.heading, textAlign: "center" },
  centered: { textAlign: "center" },
});
