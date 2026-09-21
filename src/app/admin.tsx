import { useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useSession } from "@/features/auth/session";
import { useResource } from "@/hooks/use-resource";
import { fetchPendingCertifications, reviewCertification } from "@/services/admin";
import { toMessage } from "@/services/errors";
import { colors, spacing, text } from "@/theme/tokens";
import { CATEGORY_LABELS } from "@/types/domain";

/**
 * Espace responsable. Le back-office complet reste sur le web : ici, seule la
 * décision qui se prend debout dans l'atelier, quand un membre demande à être
 * habilité sur une famille de machines.
 */
export default function AdminScreen() {
  const { profile, session } = useSession();
  const pending = useResource(fetchPendingCertifications);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  // Garde d'affichage ; la vraie barrière est côté base, dans les politiques RLS.
  if (profile && profile.role !== "admin") {
    return <Redirect href="/profil" />;
  }

  async function decide(certificationId: string, decision: "approved" | "rejected") {
    if (!session) return;

    setDecidingId(certificationId);

    try {
      await reviewCertification({ certificationId, decision, reviewerId: session.user.id });
      await pending.refresh();
    } catch (cause) {
      Alert.alert("Décision impossible", toMessage(cause));
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <ScrollView
      style={screen.page}
      contentContainerStyle={screen.content}
      refreshControl={
        <RefreshControl
          refreshing={pending.refreshing}
          onRefresh={pending.refresh}
          tintColor={colors.rust}
        />
      }
    >
      <ScreenHeader
        eyebrow="Responsable"
        title="Habilitations"
        subtitle="Demandes en attente d’arbitrage. Le reste de l’administration se fait sur le site."
      />

      {pending.loading && !pending.data ? <Loading /> : null}

      {pending.error ? <ErrorState message={pending.error} onRetry={pending.refresh} /> : null}

      {pending.data?.length === 0 ? (
        <EmptyState title="File vide" message="Aucune demande d’habilitation en attente." />
      ) : null}

      {(pending.data ?? []).map((request) => (
        <Card key={request.id}>
          <Text style={text.label}>{CATEGORY_LABELS[request.category]}</Text>
          <Text style={text.heading}>{request.profile?.full_name || "Membre"}</Text>
          {request.motivation ? <Text style={text.body}>« {request.motivation} »</Text> : null}
          <Text style={text.small}>
            Demandée le {new Date(request.created_at).toLocaleDateString("fr-FR")}
          </Text>

          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                label="Habiliter"
                onPress={() => decide(request.id, "approved")}
                loading={decidingId === request.id}
              />
            </View>
            <View style={styles.action}>
              <Button
                label="Refuser"
                variant="danger"
                onPress={() => decide(request.id, "rejected")}
                disabled={decidingId === request.id}
              />
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  action: { flex: 1 },
});
