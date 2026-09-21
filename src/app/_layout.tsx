import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Loading } from "@/components/ui/states";
import { screen } from "@/components/ui/screen";
import { SessionProvider, useSession } from "@/features/auth/session";
import { colors } from "@/theme/tokens";

/**
 * Racine de l'application : elle restaure la session, puis décide si le membre
 * voit l'app ou l'écran de connexion. Tout le reste de la navigation part d'ici.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <AuthGate />
      </SessionProvider>
    </SafeAreaProvider>
  );
}

function AuthGate() {
  const { session, restoring } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Tant que la session n'est pas relue, rediriger enverrait le membre déjà
    // connecté sur l'écran de connexion à chaque ouverture de l'app.
    if (restoring) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!session && !inAuthGroup) {
      router.replace("/connexion");
    } else if (session && inAuthGroup) {
      router.replace("/");
    }
  }, [session, restoring, segments, router]);

  if (restoring) {
    return (
      <View style={[screen.page, { justifyContent: "center" }]}>
        <Loading label="Ouverture de Gabarit…" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bone },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: colors.bone },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="machine/[slug]" options={{ title: "Machine" }} />
      <Stack.Screen name="atelier/[slug]" options={{ title: "Atelier" }} />
    </Stack>
  );
}
