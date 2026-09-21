import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { ErrorState, Loading } from "@/components/ui/states";
import { useSession } from "@/features/auth/session";
import { buildSlots, nextDays, toDayParam, type Slot } from "@/features/booking/slots";
import { useResource } from "@/hooks/use-resource";
import { bookMachine, fetchBusySlots } from "@/services/bookings";
import { fetchMachineBySlug } from "@/services/catalog";
import { toMessage } from "@/services/errors";
import { colors, spacing, text, touchTarget } from "@/theme/tokens";
import { CATEGORY_LABELS, MACHINE_STATUS_LABELS } from "@/types/domain";
import { formatDay, formatHour } from "@/utils/format";

/** Fiche machine et réservation d'un créneau : le cœur du parcours. */
export default function MachineScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { refreshProfile } = useSession();

  const [day, setDay] = useState(() => nextDays()[0]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [project, setProject] = useState("");
  const [booking, setBooking] = useState(false);

  const machine = useResource(useCallback(() => fetchMachineBySlug(slug), [slug]));

  const machineId = machine.data?.id;
  const busy = useResource(
    useCallback(
      async () => (machineId ? fetchBusySlots(machineId, toDayParam(day)) : []),
      [machineId, day],
    ),
  );

  if (machine.loading && !machine.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <Loading />
      </View>
    );
  }

  if (!machine.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <ErrorState
          message={machine.error ?? "Machine introuvable."}
          onRetry={machine.refresh}
        />
      </View>
    );
  }

  const item = machine.data;
  const slots = buildSlots(day, busy.data ?? []);
  const available = item.status === "available";

  async function reserve() {
    if (!selected) return;

    setBooking(true);

    try {
      await bookMachine({
        machineId: item.id,
        startsAt: selected.start,
        endsAt: selected.end,
        project: project.trim(),
      });

      await refreshProfile();
      setSelected(null);
      setProject("");
      busy.refresh();

      Alert.alert("Créneau réservé", `${item.name} · ${formatHour(selected.start)}`, [
        { text: "Voir mes réservations", onPress: () => router.push("/reservations") },
        { text: "Rester ici", style: "cancel" },
      ]);
    } catch (cause) {
      Alert.alert("Réservation refusée", toMessage(cause));
    } finally {
      setBooking(false);
    }
  }

  return (
    <ScrollView style={screen.page} contentContainerStyle={screen.content}>
      <Stack.Screen options={{ title: item.name }} />

      <ScreenHeader
        eyebrow={`${CATEGORY_LABELS[item.category]} · ${item.workshop?.city ?? ""}`}
        title={item.name}
        subtitle={item.summary}
      />

      <View style={styles.row}>
        <Badge label={`${item.hourly_credits} crédit(s) / heure`} tone="rust" />
        {!available ? <Badge label={MACHINE_STATUS_LABELS[item.status]} tone="amber" /> : null}
      </View>

      <Card>
        <Text style={text.label}>Description</Text>
        <Text style={text.body}>{item.description}</Text>
        <Text style={text.small}>
          {item.workshop?.name} · {item.workshop?.city}
        </Text>
      </Card>

      {available ? (
        <View style={styles.section}>
          <Text style={text.label}>Choisir un jour</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
            {nextDays().map((option) => {
              const active = option.toDateString() === day.toDateString();
              return (
                <Pressable
                  key={option.toISOString()}
                  onPress={() => {
                    setDay(option);
                    setSelected(null);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [
                    styles.day,
                    active && styles.dayActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[text.label, active && styles.activeLabel]}>
                    {formatDay(option)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={text.label}>Créneaux</Text>

          {busy.loading && !busy.data ? <Loading label="Lecture des disponibilités…" /> : null}
          {busy.error ? <ErrorState message={busy.error} onRetry={busy.refresh} /> : null}

          <View style={styles.slots}>
            {slots.map((slot) => {
              const free = slot.state === "free";
              const active = selected?.start.getTime() === slot.start.getTime();

              return (
                <Pressable
                  key={slot.start.toISOString()}
                  disabled={!free}
                  onPress={() => setSelected(slot)}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !free, selected: active }}
                  style={({ pressed }) => [
                    styles.slot,
                    !free && styles.slotTaken,
                    active && styles.slotActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.slotLabel, active && styles.activeLabel]}>
                    {formatHour(slot.start)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selected ? (
            <Card>
              <Text style={text.strong}>
                {formatDay(selected.start)} · {formatHour(selected.start)} –{" "}
                {formatHour(selected.end)}
              </Text>
              <Field
                label="Projet (facultatif)"
                value={project}
                onChangeText={setProject}
                placeholder="Découpe d'un gabarit de fraisage"
                maxLength={120}
              />
              <Button
                label={`Réserver pour ${item.hourly_credits} crédit(s)`}
                onPress={reserve}
                loading={booking}
              />
            </Card>
          ) : null}
        </View>
      ) : (
        <Card>
          <Text style={text.body}>
            Cette machine est indisponible pour le moment : aucun créneau n’est ouvert à la
            réservation.
          </Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: "center" },
  row: { flexDirection: "row", gap: spacing.sm },
  section: { gap: spacing.md },
  days: { gap: spacing.sm, paddingRight: spacing.lg },
  day: {
    minHeight: touchTarget - 8,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  dayActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  slots: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  slot: {
    minWidth: 84,
    minHeight: touchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  slotTaken: { backgroundColor: colors.bone, opacity: 0.5 },
  slotActive: { backgroundColor: colors.rust, borderColor: colors.rust },
  slotLabel: { ...text.strong, fontSize: 14 },
  activeLabel: { color: colors.paper },
  pressed: { opacity: 0.7 },
});
