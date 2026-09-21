import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/theme/tokens";

/**
 * Cinq onglets : l'app s'utilise debout, dans un atelier, souvent d'une main.
 * « Arrivée » est au centre parce que c'est le geste le plus fréquent sur place.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.bone },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontWeight: "700" },
        tabBarActiveTintColor: colors.rust,
        tabBarInactiveTintColor: colors.kraft,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line },
        sceneStyle: { backgroundColor: colors.bone },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="machines"
        options={{
          title: "Machines",
          tabBarIcon: ({ color, size }) => <Ionicons name="construct" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="arrivee"
        options={{
          title: "Arrivée",
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="reservations"
        options={{
          title: "Réservations",
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
