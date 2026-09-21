import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, text } from "@/theme/tokens";

/** En-tête de page : étiquette technique, titre, sous-titre facultatif. */
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={text.label}>{eyebrow}</Text> : null}
      <Text style={text.title}>{title}</Text>
      {subtitle ? <Text style={text.body}>{subtitle}</Text> : null}
    </View>
  );
}

export const screen = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bone },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
});

const styles = StyleSheet.create({
  header: { gap: spacing.xs, paddingTop: spacing.sm },
});
