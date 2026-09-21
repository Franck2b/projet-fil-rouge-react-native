import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { ErrorState, Loading } from "@/components/ui/states";
import { useSession } from "@/features/auth/session";
import { useResource } from "@/hooks/use-resource";
import { fetchCertifications } from "@/services/account";
import { spacing, text } from "@/theme/tokens";
import { CATEGORY_LABELS, type CertificationStatus } from "@/types/domain";
import { formatCredits } from "@/utils/format";

const CERTIFICATION_TONES: Record<CertificationStatus, "moss" | "amber" | "neutral"> = {
  approved: "moss",
  pending: "amber",
  rejected: "neutral",
};

const CERTIFICATION_LABELS: Record<CertificationStatus, string> = {
  approved: "Habilité",
  pending: "En attente",
  rejected: "Refusée",
};

export default function ProfileScreen() {
  const { session, profile, signOut } = useSession();
  const certifications = useResource(fetchCertifications);

  return (
    <ScrollView style={screen.page} contentContainerStyle={screen.content}>
      <ScreenHeader
        eyebrow="Mon compte"
        title={profile?.full_name || "Membre Gabarit"}
        subtitle={session?.user.email ?? undefined}
      />

      <Card>
        <Text style={text.label}>Solde</Text>
        <Text style={styles.balance}>
          {profile ? formatCredits(profile.credits_balance) : "—"}
        </Text>
        <Text style={text.small}>
          Un crédit correspond à une heure sur une machine à 1 crédit de l’heure.
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={text.label}>Habilitations</Text>

        {certifications.loading && !certifications.data ? <Loading /> : null}

        {certifications.error ? (
          <ErrorState message={certifications.error} onRetry={certifications.refresh} />
        ) : null}

        {certifications.data?.length === 0 ? (
          <Card>
            <Text style={text.body}>
              Aucune habilitation pour l’instant. Les demandes se font depuis le site, puis un
              responsable d’atelier les valide.
            </Text>
          </Card>
        ) : null}

        {(certifications.data ?? []).map((certification) => (
          <Card key={certification.id}>
            <View style={styles.row}>
              <Text style={text.strong}>{CATEGORY_LABELS[certification.category]}</Text>
              <Badge
                label={CERTIFICATION_LABELS[certification.status]}
                tone={CERTIFICATION_TONES[certification.status]}
              />
            </View>
          </Card>
        ))}
      </View>

      <Button label="Se déconnecter" variant="secondary" onPress={signOut} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  balance: { ...text.title, fontSize: 36 },
});
