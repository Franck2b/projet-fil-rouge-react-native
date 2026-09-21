import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing, touchTarget } from "@/theme/tokens";

type Variant = "primary" | "secondary" | "danger";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

/**
 * Bouton tactile de l'app. Il garde une hauteur minimale confortable au doigt et
 * change d'opacité à l'appui : sur mobile, sans survol, c'est le seul retour
 * visuel qui dit « j'ai bien reçu ton geste ».
 */
export function Button({ label, onPress, variant = "primary", disabled, loading }: Props) {
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles.pressed,
        inactive && styles.inactive,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={labelColor[variant]} /> : null}
        <Text style={[styles.label, { color: labelColor[variant] }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const labelColor: Record<Variant, string> = {
  primary: colors.paper,
  secondary: colors.ink,
  danger: colors.brick,
};

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.rust, borderColor: colors.rust },
  secondary: { backgroundColor: colors.paper, borderColor: colors.ink },
  danger: { backgroundColor: colors.brickWash, borderColor: colors.brick },
  pressed: { opacity: 0.7 },
  inactive: { opacity: 0.45 },
  label: { fontSize: 15, fontWeight: "600" },
});
