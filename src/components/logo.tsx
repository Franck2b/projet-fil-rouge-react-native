import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing } from "@/theme/tokens";

/**
 * Marque du site, redessinée avec des vues plutôt qu'un SVG : un gabarit, sa
 * découpe intérieure en rouille, et le mot en capitales très espacées.
 */
export function Logo({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const color = tone === "paper" ? colors.paper : colors.ink;

  return (
    <View style={styles.row}>
      <View style={[styles.frame, { borderColor: color }]}>
        <View style={styles.cut} />
      </View>
      <Text style={[styles.word, { color }]}>Gabarit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  frame: {
    width: 26,
    height: 20,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  cut: { width: 8, height: 8, backgroundColor: colors.rust },
  word: {
    fontFamily: fonts.display,
    fontSize: 17,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
});
