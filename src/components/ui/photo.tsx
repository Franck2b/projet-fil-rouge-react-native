import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import { colors } from "@/theme/tokens";

/**
 * Photo d'illustration, au format 3/2 comme sur le site. expo-image garde
 * l'image en cache sur le disque du téléphone et fait une transition douce :
 * pas de saut de mise en page pendant le chargement.
 */
export function Photo({ uri, alt, tall }: { uri: string; alt: string; tall?: boolean }) {
  return (
    <Image
      source={uri}
      alt={alt}
      accessibilityLabel={alt}
      style={[styles.image, tall && styles.tall]}
      contentFit="cover"
      transition={200}
      cachePolicy="disk"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    aspectRatio: 3 / 2,
    backgroundColor: colors.line,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tall: { aspectRatio: 4 / 3 },
});
