import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme/tokens";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

/** Bloc encadré, à plat : le relief du site vient des traits, pas des ombres. */
export function Card({ children, onPress, accessibilityLabel }: Props) {
  if (!onPress) {
    return <View style={styles.card}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pressed: { backgroundColor: colors.bone },
});
