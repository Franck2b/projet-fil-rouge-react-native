import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/theme/tokens";

type Tone = "rust" | "moss" | "amber" | "neutral";

export function Badge({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  return (
    <View style={[styles.base, backgrounds[tone]]}>
      <Text style={[styles.label, { color: foregrounds[tone] }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const backgrounds: Record<Tone, { backgroundColor: string }> = {
  rust: { backgroundColor: colors.rustWash },
  moss: { backgroundColor: colors.mossWash },
  amber: { backgroundColor: colors.amberWash },
  neutral: { backgroundColor: colors.bone },
};

const foregrounds: Record<Tone, string> = {
  rust: colors.rustDark,
  moss: colors.moss,
  amber: colors.amber,
  neutral: colors.inkSoft,
};

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
