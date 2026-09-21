import { useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MachineCard } from "@/components/machine-card";
import { ScreenHeader, screen } from "@/components/ui/screen";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useResource } from "@/hooks/use-resource";
import { cachedMachines, fetchMachines } from "@/services/catalog";
import { readCategoryFilter, writeCategoryFilter } from "@/storage/preferences";
import { colors, spacing, text, touchTarget } from "@/theme/tokens";
import { CATEGORY_LABELS, MACHINE_CATEGORY_VALUES, type MachineCategory } from "@/types/domain";

/**
 * Catalogue complet. La liste passe par une FlatList : elle ne rend que les
 * cartes visibles, ce qui garde le défilement fluide quand le parc grandit.
 */
export default function MachinesScreen() {
  const router = useRouter();
  const machines = useResource(fetchMachines, cachedMachines);
  const [category, setCategory] = useState<MachineCategory | null>(null);

  // Le filtre choisi est retrouvé à la réouverture de l'app.
  useEffect(() => {
    let active = true;
    readCategoryFilter().then((saved) => {
      if (active && saved) setCategory(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  function selectCategory(next: MachineCategory | null) {
    setCategory(next);
    writeCategoryFilter(next);
  }

  const visible = (machines.data ?? []).filter(
    (machine) => !category || machine.category === category,
  );

  if (machines.loading && !machines.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <Loading label="Chargement du parc…" />
      </View>
    );
  }

  if (machines.error && !machines.data) {
    return (
      <View style={[screen.page, styles.centered]}>
        <ErrorState message={machines.error} onRetry={machines.refresh} />
      </View>
    );
  }

  return (
    <FlatList
      style={screen.page}
      contentContainerStyle={screen.content}
      data={visible}
      keyExtractor={(machine) => machine.id}
      refreshControl={
        <RefreshControl
          refreshing={machines.refreshing}
          onRefresh={machines.refresh}
          tintColor={colors.rust}
        />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <ScreenHeader
            eyebrow="Catalogue"
            title="Machines"
            subtitle={`${visible.length} machine${visible.length > 1 ? "s" : ""} réservable${
              visible.length > 1 ? "s" : ""
            }.`}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            <Chip label="Tout" active={category === null} onPress={() => selectCategory(null)} />
            {MACHINE_CATEGORY_VALUES.map((value) => (
              <Chip
                key={value}
                label={CATEGORY_LABELS[value]}
                active={category === value}
                onPress={() => selectCategory(value)}
              />
            ))}
          </ScrollView>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          title="Aucune machine"
          message="Aucune machine dans cette famille pour le moment. Essayez un autre filtre."
        />
      }
      ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      renderItem={({ item }) => (
        <MachineCard machine={item} onPress={() => router.push(`/machine/${item.slug}`)} />
      )}
    />
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}
    >
      <Text style={[text.label, active && styles.chipLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centered: { justifyContent: "center" },
  header: { gap: spacing.lg, marginBottom: spacing.md },
  filters: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    minHeight: touchTarget - 8,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipLabelActive: { color: colors.paper },
  pressed: { opacity: 0.7 },
});
