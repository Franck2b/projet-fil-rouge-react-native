import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { ErrorState, Loading } from "@/components/ui/states";
import { usePosition } from "@/features/location/use-position";
import { formatDistance } from "@/features/location/distance";
import { parseMachineCode } from "@/features/scan/code";
import { useResource } from "@/hooks/use-resource";
import { checkIn, fetchMyCheckIns, type CheckInResult } from "@/services/check-in";
import { toMessage } from "@/services/errors";
import { colors, spacing, text } from "@/theme/tokens";
import { formatSlot } from "@/utils/format";

type Step =
  | { name: "idle" }
  | { name: "scanning" }
  | { name: "checking" }
  | { name: "done"; result: CheckInResult }
  | { name: "failed"; message: string };

/**
 * Le geste qui n'existe pas sur le site : arriver à l'atelier, scanner le QR
 * code collé sur la machine, et voir sa réservation validée. La caméra n'est
 * allumée que pendant le scan, et la position n'est lue qu'au moment d'envoyer.
 */
export default function CheckInScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { request: requestPosition } = usePosition();
  const [step, setStep] = useState<Step>({ name: "idle" });
  const history = useResource(fetchMyCheckIns);
  // La caméra signale le même code plusieurs fois par seconde : ce verrou garantit
  // un seul appel au serveur par scan.
  const handled = useRef(false);

  // Quitter l'onglet éteint la caméra : elle ne doit pas tourner en arrière-plan.
  useFocusEffect(
    useCallback(() => {
      return () => setStep({ name: "idle" });
    }, []),
  );

  async function startScan() {
    if (!permission?.granted) {
      const next = await requestPermission();
      if (!next.granted) {
        setStep({
          name: "failed",
          message:
            "Caméra refusée. Autorisez-la dans les réglages du téléphone pour valider votre arrivée par QR code.",
        });
        return;
      }
    }

    handled.current = false;
    setStep({ name: "scanning" });
  }

  async function onScanned(value: string) {
    if (handled.current) return;
    handled.current = true;

    const slug = parseMachineCode(value);

    if (!slug) {
      setStep({ name: "failed", message: "Ce QR code n'est pas un code machine Gabarit." });
      return;
    }

    setStep({ name: "checking" });

    // La position est un plus, pas un prérequis : un refus n'empêche pas d'arriver.
    const position = await requestPosition();

    try {
      const result = await checkIn({
        machineSlug: slug,
        latitude: position?.latitude ?? null,
        longitude: position?.longitude ?? null,
      });

      setStep({ name: "done", result });
      history.refresh();
    } catch (cause) {
      setStep({ name: "failed", message: toMessage(cause) });
    }
  }

  if (step.name === "scanning") {
    return (
      <View style={styles.cameraPage}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={({ data }) => onScanned(data)}
        />
        <View style={styles.cameraOverlay}>
          <Text style={styles.cameraText}>Visez le QR code collé sur la machine.</Text>
          <Button
            label="Annuler"
            variant="secondary"
            onPress={() => setStep({ name: "idle" })}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={screen.page} contentContainerStyle={screen.content}>
      <ScreenHeader
        eyebrow="Sur place"
        title="Valider mon arrivée"
        subtitle="Chaque machine porte un QR code. Le scanner confirme au serveur que vous êtes bien devant elle, sur votre créneau."
      />

      {step.name === "checking" ? <Loading label="Vérification auprès de l'atelier…" /> : null}

      {step.name === "done" ? (
        <Card>
          <Badge label="Arrivée enregistrée" tone="moss" />
          <Text style={text.heading}>{step.result.machine_name}</Text>
          <Text style={text.body}>{formatSlot(step.result.starts_at, step.result.ends_at)}</Text>
          <Text style={text.small}>
            {step.result.workshop_name}
            {step.result.distance_m != null
              ? ` · à ${formatDistance(step.result.distance_m)} de l'atelier`
              : " · position non communiquée"}
          </Text>
          <Button
            label="Voir mes réservations"
            variant="secondary"
            onPress={() => router.push("/reservations")}
          />
        </Card>
      ) : null}

      {step.name === "failed" ? (
        <ErrorState message={step.message} onRetry={startScan} />
      ) : null}

      {step.name === "idle" || step.name === "done" ? (
        <Button
          label={step.name === "done" ? "Scanner une autre machine" : "Scanner un QR code"}
          onPress={startScan}
        />
      ) : null}

      <View style={styles.section}>
        <Text style={text.label}>Dernières arrivées</Text>

        {history.loading && !history.data ? <Loading /> : null}

        {history.data?.length === 0 ? (
          <Card>
            <Text style={text.body}>
              Aucune arrivée enregistrée pour l’instant. La trace de chaque scan apparaîtra ici.
            </Text>
          </Card>
        ) : null}

        {(history.data ?? []).map((entry) => (
          <Card key={entry.id}>
            <Text style={text.strong}>{entry.machine_name}</Text>
            <Text style={text.small}>
              {new Date(entry.created_at).toLocaleString("fr-FR")} · {entry.workshop_name}
              {entry.distance_m != null ? ` · ${formatDistance(entry.distance_m)}` : ""}
            </Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cameraPage: { flex: 1, backgroundColor: colors.ink },
  camera: { flex: 1 },
  cameraOverlay: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.ink,
  },
  cameraText: { ...text.body, color: colors.bone, textAlign: "center" },
  section: { gap: spacing.md, marginTop: spacing.sm },
});
