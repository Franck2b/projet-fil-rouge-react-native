import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { useSession } from "@/features/auth/session";
import { toMessage } from "@/services/errors";
import { colors, spacing, text } from "@/theme/tokens";

const MIN_PASSWORD = 8;

export default function SignUpScreen() {
  const { signUp } = useSession();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    // Validation locale d'abord : inutile d'aller au réseau pour un champ vide.
    if (fullName.trim().length < 2) {
      setError("Indiquez votre nom complet.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Le mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await signUp(email.trim(), password, fullName.trim());
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
          <ScreenHeader
            eyebrow="Gabarit"
            title="Créer un compte"
            subtitle="10 crédits offerts à l'inscription, comme sur le site."
          />

          <View style={styles.form}>
            <Field
              label="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
              placeholder="Camille Devos"
            />
            <Field
              label="Adresse e-mail"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              inputMode="email"
              placeholder="vous@exemple.fr"
            />
            <Field
              label="Mot de passe"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              secureTextEntry
              placeholder="8 caractères minimum"
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Créer mon compte" onPress={onSubmit} loading={submitting} />
          </View>

          <Link href="/connexion" style={styles.link}>
            J’ai déjà un compte
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
