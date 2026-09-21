import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { useSession } from "@/features/auth/session";
import { toMessage } from "@/services/errors";
import { colors, spacing, text } from "@/theme/tokens";

export default function SignInScreen() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
      // La redirection vers l'app est faite par le garde de navigation racine.
    } catch (cause) {
      setError(toMessage(cause));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={screen.page}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={screen.content} keyboardShouldPersistTaps="handled">
          <Logo />

          <ScreenHeader
            eyebrow="Réseau d’ateliers partagés"
            title="Se connecter"
            subtitle="Votre compte est le même que sur le site."
          />

          <View style={styles.form}>
            <Field
              label="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              placeholder="membre@etabli.test"
            />
            <Field
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              secureTextEntry
              placeholder="••••••••"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Se connecter" onPress={onSubmit} loading={submitting} />
          </View>

          <Link href="/inscription" style={styles.link}>
            Pas encore de compte ? Créer un compte
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  form: { gap: spacing.lg },
  error: {
    ...text.small,
    color: colors.brick,
    borderLeftWidth: 2,
    borderLeftColor: colors.brick,
    paddingLeft: spacing.sm,
  },
  link: { ...text.small, color: colors.rustDark, textAlign: "center", padding: spacing.md },
});
