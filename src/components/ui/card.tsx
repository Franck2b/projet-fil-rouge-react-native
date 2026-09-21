import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme/tokens";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  /** Visuel affiché en pleine largeur au-dessus du contenu, sans marge. */
  media?: React.ReactNode;
  accessibilityLabel?: string;
};

/** Bloc encadré, à plat : le relief du site vient des traits, pas des ombres. */
export function Card({ children, onPress, media, accessibilityLabel }: Props) {
  const content = (
    <>
      {media}
      <View style={styles.body}>{children}</View>
    </>
  );

  if (!onPress) {
    return <View style={styles.card}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  body: { padding: spacing.lg, gap: spacing.sm },
  pressed: { backgroundColor: colors.bone },
});
