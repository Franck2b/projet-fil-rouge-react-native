import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MachineCategory } from "@/types/domain";

/** Préférences d'affichage, conservées entre deux ouvertures de l'app. */

const CATEGORY_KEY = "pref.category";

export async function readCategoryFilter(): Promise<MachineCategory | null> {
  return (await AsyncStorage.getItem(CATEGORY_KEY)) as MachineCategory | null;
}

export async function writeCategoryFilter(category: MachineCategory | null) {
  if (category === null) {
    await AsyncStorage.removeItem(CATEGORY_KEY);
    return;
  }
  await AsyncStorage.setItem(CATEGORY_KEY, category);
}
