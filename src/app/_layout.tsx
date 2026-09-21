import { useEffect } from "react";
import { View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Archivo_700Bold, Archivo_800ExtraBold } from "@expo-google-fonts/archivo";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { IBMPlexMono_500Medium } from "@expo-google-fonts/ibm-plex-mono";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Loading } from "@/components/ui/states";
import { screen } from "@/components/ui/screen";
import { SessionProvider, useSession } from "@/features/auth/session";
import { colors, fonts } from "@/theme/tokens";

// L'écran de démarrage reste affiché tant que les polices ne sont pas prêtes :
// sinon l'app apparaît une fraction de seconde dans la police système.
SplashScreen.preventAutoHideAsync();

/**
 * Racine de l'application : elle charge la typographie, restaure la session,
 * puis décide si le membre voit l'app ou l'écran de connexion.
 */
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

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
        headerTitleStyle: { fontFamily: fonts.displayBold, fontSize: 16 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bone },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="machine/[slug]" options={{ title: "Machine" }} />
      <Stack.Screen name="atelier/[slug]" options={{ title: "Atelier" }} />
      <Stack.Screen name="admin" options={{ title: "Espace responsable" }} />
    </Stack>
  );
}
