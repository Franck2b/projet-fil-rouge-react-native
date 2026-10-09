# Pense-bête 

```bash
npx expo start            # QR code → Expo Go ; --tunnel si le réseau bloque
npx expo lint
npx tsc --noEmit          # erreurs TypeScript
grep -rn "texte" src      # retrouver un texte ou un nom
```
Dans le terminal Expo : `r` recharge l'app, `j` ouvre le débogueur.

## 1. Où est quoi

| Je cherche… | Fichier |
| --- | --- |
| Un écran | `src/app/…` (Expo Router : un fichier = une route) |
| Les onglets | `src/app/(tabs)/_layout.tsx` · écrans `index`, `machines`, `arrivee`, `reservations`, `profil` |
| Fiches détail | `src/app/machine/[slug].tsx` · `src/app/atelier/[slug].tsx` |
| Garde de connexion | `src/app/_layout.tsx` (redirige vers `(auth)` sans session) |
| Le scan QR | `src/app/(tabs)/arrivee.tsx` + `src/features/scan/code.ts` |
| La position | `src/features/location/use-position.ts` + `distance.ts` |
| Appels au serveur | `src/services/*.ts` (un écran n'appelle **jamais** Supabase directement) |
| Messages d'erreur | `src/services/errors.ts` (`MESSAGES` + `toMessage`) |
| Chargement / erreur / données | `src/hooks/use-resource.ts` |
| Briques d'interface | `src/components/ui/` : `Button`, `Card`, `Badge`, `Field`, `Loading`, `ErrorState`, `EmptyState` |
| Couleurs, espacements, typo | `src/theme/tokens.ts` (`colors`, `spacing`, `text`) |
| Types des données | `src/types/domain.ts` |

## 2. Les demandes du PDF, une par une

### Gérer le refus de la permission caméra
`arrivee.tsx`, fonction `startScan()` — déjà fait :
```ts
const next = await requestPermission();
if (!next.granted) { setStep({ name: "failed", message: "Caméra refusée…" }); return; }
```
Amélioration possible : si `next.canAskAgain === false`, proposer un bouton
`Linking.openSettings()` (modèle : `openSettings` dans `use-position.ts`).

### Ajouter un feedback après le scan
`arrivee.tsx`, dans `onScanned()`, après `setStep({ name: "done", result })` :
```ts
import { Vibration } from "react-native";
Vibration.vibrate(100);      // marche dans Expo Go, sans dépendance
```
Ou un message : `Alert.alert("Arrivée validée", result.machine_name)`.
L'affichage du résultat est dans le bloc `step.name === "done"` (carte verte).

### Empêcher le double scan
`arrivee.tsx` — déjà fait avec un verrou :
```ts
const handled = useRef(false);
// onScanned : if (handled.current) return; handled.current = true;
// startScan : handled.current = false;
```
> `useRef` et pas `useState` : la caméra appelle `onScanned` plusieurs fois par seconde,
> le ref change immédiatement sans attendre un nouveau rendu.

### Extraire un identifiant du QR
`src/features/scan/code.ts` → `parseMachineCode(value)` renvoie le slug ou `null`.
Accepte `gabarit://machine/<slug>` et une URL `/equipements/<slug>`.
Nouveau format : ajouter une regex et un `exec` sur le même modèle.

### Envoyer le résultat du scan au backend
`src/services/check-in.ts` → `checkIn({ machineSlug, latitude, longitude })`
appelle `supabase.rpc("check_in_with_code", …)`. Le serveur vérifie la réservation,
le double scan et la distance.

### Afficher une erreur pour un QR inconnu
- Pas un code Gabarit (refusé côté app) : `arrivee.tsx` → `if (!slug) setStep({ name: "failed", … })`.
- Machine inexistante (refusée côté serveur) : code `UNKNOWN_CODE` → message dans `services/errors.ts`.
- Changer un message d'erreur serveur = modifier `MESSAGES` dans `services/errors.ts`, rien d'autre.

### Corriger un appel API
Vérifier dans l'ordre :
1. le service (`src/services/…`) : nom de la fonction `rpc("…")` ou de la table, noms des paramètres `p_…` ;
2. le `try / catch` dans l'écran : l'erreur doit passer par `toMessage(cause)` ;
3. `.env` : `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (relancer `npx expo start` après modification).

### Afficher une distance depuis la position
Modèle : `src/app/atelier/[slug].tsx`.
```ts
const { position, status, request } = usePosition();
const distance = position && lat != null && lon != null
  ? distanceMeters(position, { latitude: lat, longitude: lon })
  : null;
// affichage : formatDistance(distance)  →  "450 m" ou "2.3 km"
```
Sur la fiche machine : les coordonnées sont dans `item.workshop.latitude` / `.longitude`.
Liste triée par distance : `byDistance(liste, position)`.

### Gérer un refus GPS
`use-position.ts` donne un `status` : `idle` · `loading` · `granted` · `denied` (on peut
redemander) · `blocked` (seulement via les réglages) · `error` (GPS indisponible).
Modèle d'affichage des 5 cas : `src/app/(tabs)/index.tsx`.
> Le scan reste possible sans position : la distance n'est simplement pas vérifiée.

### Corriger une navigation
```ts
const router = useRouter();
router.push(`/machine/${machine.slug}`);   // aller vers
router.back();                              // revenir
router.replace("/connexion");              // remplacer (pas de retour possible)
```
Lire le paramètre : `const { slug } = useLocalSearchParams<{ slug: string }>();`
Titre d'un écran : `<Stack.Screen options={{ title: … }} />`.
Écran détail déclaré dans `src/app/_layout.tsx` (`<Stack.Screen name="machine/[slug]" …>`).

## 3. Autres demandes probables

| Demande | Où |
| --- | --- |
| Ajouter un filtre à la liste des machines | `(tabs)/machines.tsx` : état `category`, `.filter()` sur `visible`, puces `Chip` |
| Ajouter un état chargement / vide / erreur | `useResource` → `loading`, `error`, `data` ; composants `Loading`, `ErrorState`, `EmptyState` |
| Tirer pour rafraîchir | `RefreshControl` + `resource.refresh` (modèle : `(tabs)/index.tsx`) |
| Confirmer avant une action | `Alert.alert("Titre", "Texte", [{ text: "Annuler", style: "cancel" }, { text: "OK", onPress }])` |
| Ajouter un onglet | nouveau fichier dans `(tabs)/` + `<Tabs.Screen>` dans `(tabs)/_layout.tsx` |
| Afficher un nouveau champ | type dans `types/domain.ts` + `select` du service + l'écran |
| Changer une couleur | `src/theme/tokens.ts` |

## 4. Pièges qui font perdre du temps

- **Variables `EXPO_PUBLIC_…`** : lues au démarrage → relancer `npx expo start`.
- **Imports** avec `@/` (= `src/`), comme dans tout le projet.
- **Expo Go** : tout le projet y tourne. Le NFC demanderait un development build.
- **Téléphone et ordinateur** sur le même Wi-Fi, sinon `npx expo start --tunnel`.
- **Supabase en pause** après 7 jours sans activité : le réveiller depuis le tableau de bord.
- **Pour scanner pendant la démo**, il faut une réservation **en cours** sur la machine.
- Les textes de l'app sont en dur, en français : on les modifie directement dans l'écran.

## 5. Vocabulaire à placer

Expo Router · route group `(tabs)` · segment dynamique `[slug]` · `useLocalSearchParams` ·
`useRouter` · permission au moment de l'action · `useRef` (verrou) · `useFocusEffect` ·
service · `rpc` · fonction SQL `security definer` · RLS · SecureStore · AsyncStorage · Expo Go
