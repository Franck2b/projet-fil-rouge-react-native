import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, spacing, text, touchTarget } from "@/theme/tokens";

type Props = TextInputProps & { label: string };

export function Field({ label, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={text.label}>{label}</Text>
      <TextInput
        {...props}
        style={[styles.input, style]}
        placeholderTextColor={colors.kraft}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  input: {
    minHeight: touchTarget,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.ink,
  },
});
