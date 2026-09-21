import { StyleSheet, Text, View } from "react-native";
import { Logo } from "@/components/logo";
import { colors, spacing, text } from "@/theme/tokens";

/**
 * Bandeau sombre repris du site : fond encre, trame millimétrée, titre en
 * capitales et un accent rouille. Il ouvre les écrans principaux.
 */
export function Hero({
  eyebrow,
  title,
  accent,
  subtitle,
  children,
  withLogo,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  subtitle?: string;
  children?: React.ReactNode;
  withLogo?: boolean;
}) {
  return (
    <View style={styles.hero}>
      <GridPlan />

      {withLogo ? (
        <View style={styles.logo}>
          <Logo tone="paper" />
        </View>
      ) : null}

      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}

      <Text style={styles.title}>
        {title}
        {accent ? <Text style={styles.accent}>{` ${accent}`}</Text> : null}
      </Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {children}
    </View>
  );
}

/** Trame de fond : des traits fins, comme le quadrillage d'un plan d'atelier. */
function GridPlan() {
  const columns = [0.25, 0.5, 0.75];
  const rows = [0.33, 0.66];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {columns.map((position) => (
        <View key={`c${position}`} style={[styles.vertical, { left: `${position * 100}%` }]} />
      ))}
      {rows.map((position) => (
        <View key={`r${position}`} style={[styles.horizontal, { top: `${position * 100}%` }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.ink,
    padding: spacing.xl,
    gap: spacing.sm,
    overflow: "hidden",
  },
  logo: { marginBottom: spacing.md },
  vertical: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: "#FFFFFF14" },
  horizontal: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: "#FFFFFF14" },
  eyebrow: { ...text.label, color: colors.rust },
  title: { ...text.title, color: colors.paper, fontSize: 34, lineHeight: 38 },
  accent: { color: colors.rust },
  subtitle: { ...text.body, color: "#F5F1E8B3" },
});
