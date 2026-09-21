# Guide de survie — live coding

Ce fichier répond à une seule question : **« on me demande de modifier X, j'ouvre
quel fichier ? »** Tout est front et logique métier côté app ; rien ici ne
demande de toucher à Supabase.

---

## 1. La carte mentale en dix secondes

Une demande traverse toujours les mêmes couches, dans cet ordre :

```
écran (src/app/…)          ce que l'utilisateur voit et touche
   ↓ appelle
service (src/services/…)   la seule couche qui parle à Supabase
   ↓ renvoie
types (src/types/domain)   la forme des données
```

et sur les côtés :

```
features/   la logique métier (créneaux, distances, session, lecture d'un code)
components/ les briques réutilisables (boutons, cartes, états)
theme/      couleurs, polices, photos
storage/    ce qui survit à la fermeture de l'app
hooks/      use-resource : charger une donnée avec ses quatre états
```

**Règle d'or, à dire au jury si on vous la demande :** un écran n'appelle jamais
Supabase directement. Il appelle un service. Si vous voyez `supabase.` dans un
fichier de `src/app/`, c'est un bug d'architecture.

---

## 2. L'arborescence, fichier par fichier

### `src/app/` — les routes (Expo Router)

Le nom du fichier **est** l'URL. `src/app/machine/[slug].tsx` → `/machine/laser-x`.

| Fichier | Ce qu'il fait |
| --- | --- |
| `_layout.tsx` | Racine. Charge les polices, monte le `SessionProvider`, et **redirige** : pas de session → `/connexion`. Déclare aussi les écrans hors onglets. |
| `(auth)/_layout.tsx` | Pile de navigation des écrans non connectés (sans en-tête). |
| `(auth)/connexion.tsx` | Formulaire e-mail + mot de passe. |
| `(auth)/inscription.tsx` | Création de compte, avec validation locale avant l'envoi. |
| `(tabs)/_layout.tsx` | **La barre d'onglets** : titres, icônes, couleurs. |
| `(tabs)/index.tsx` | Accueil : bandeau sombre, prochaine séance, ateliers triés par distance. |
| `(tabs)/machines.tsx` | Catalogue en `FlatList`, filtres par famille (préférence persistée). |
| `(tabs)/arrivee.tsx` | **Le scan QR** : caméra, lecture du code, envoi, résultat, historique. |
| `(tabs)/reservations.tsx` | À venir / passées, annulation avec confirmation. |
| `(tabs)/profil.tsx` | Solde, habilitations, accès responsable, déconnexion. |
| `machine/[slug].tsx` | Fiche machine + **réservation d'un créneau**. L'écran le plus dense. |
| `atelier/[slug].tsx` | Fiche atelier + distance + machines sur place. |
| `admin.tsx` | File des habilitations à arbitrer (visible seulement si `role === "admin"`). |

Les parenthèses — `(auth)`, `(tabs)` — sont des **groupes** : elles organisent les
fichiers sans apparaître dans l'URL.

### `src/services/` — tout ce qui parle au serveur

| Fichier | Contenu |
| --- | --- |
| `supabase.ts` | Le client unique. Lit les variables `EXPO_PUBLIC_…`, branche le stockage sécurisé de la session. |
| `catalog.ts` | Ateliers et machines (+ versions en cache). |
| `bookings.ts` | Mes réservations, créneaux occupés, réserver, annuler. |
| `account.ts` | Mon profil, mes habilitations. |
| `check-in.ts` | Valider une arrivée, historique des arrivées. |
| `admin.ts` | Demandes d'habilitation en attente, décision. |
| `errors.ts` | **Traduction des erreurs** en phrases affichables. |

### `src/features/` — la logique métier, testable et sans JSX

| Fichier | Contenu |
| --- | --- |
| `auth/session.tsx` | Qui est connecté : session, profil, `signIn`, `signUp`, `signOut`, `refreshProfile`. |
| `booking/slots.ts` | Construit les créneaux d'une journée et marque `free` / `busy` / `past`. |
| `booking/split.ts` | Sépare les réservations en « à venir » et « passées ». |
| `location/distance.ts` | Haversine, formatage (`1,2 km`), tri par distance. |
| `location/use-position.ts` | Permission GPS, lecture de la position, refus, blocage. |
| `scan/code.ts` | Extrait le slug d'un QR code. |

### Le reste

| Dossier | Contenu |
| --- | --- |
| `components/ui/` | `button`, `badge`, `card`, `field`, `photo`, `screen`, `states`. |
| `components/` | `machine-card`, `workshop-card`, `booking-card`, `hero`, `logo`. |
| `hooks/use-resource.ts` | Charger une donnée : `data`, `error`, `loading`, `refreshing`, `refresh`. |
| `storage/` | `secure-session` (trousseau), `cache` (AsyncStorage), `preferences`. |
| `theme/tokens.ts` | **Couleurs, polices, espacements, styles de texte.** |
| `theme/images.ts` | URLs des photos du site. |
| `types/domain.ts` | Types + libellés français (`CATEGORY_LABELS`…). |
| `utils/format.ts` | Dates, heures, crédits. |

---

## 3. « On me demande X » → « j'ouvre Y »

### Interface et navigation

| Demande | Fichier | Geste |
| --- | --- | --- |
| Changer une couleur, une taille de texte | `theme/tokens.ts` | Modifier le token, il se propage partout. |
| Renommer un onglet, changer son icône | `app/(tabs)/_layout.tsx` | `title:` et `name=` d'Ionicons ([liste des noms](https://icons.expo.fyi)). |
| Ajouter un onglet | créer `app/(tabs)/mon-ecran.tsx` | Puis ajouter un `<Tabs.Screen name="mon-ecran" …>`. |
| **Ajouter un écran détail** | créer `app/truc/[id].tsx` | Lire le paramètre avec `useLocalSearchParams`, déclarer l'écran dans `app/_layout.tsx`, naviguer avec `router.push("/truc/" + id)`. |
| Changer le titre d'un écran de pile | l'écran lui-même | `<Stack.Screen options={{ title: … }} />`, comme dans `machine/[slug].tsx`. |
| Modifier une carte du catalogue | `components/machine-card.tsx` | — |
| Changer le bandeau sombre | `components/hero.tsx` | — |
| Ajouter un variant de bouton | `components/ui/button.tsx` | Ajouter la clé dans `Variant`, `labelColor` et `styles`. |
| **Corriger un bug de navigation** | `app/_layout.tsx` | La redirection connecté / non connecté est dans `AuthGate`. |

### Données et états

| Demande | Fichier | Geste |
| --- | --- | --- |
| **Ajouter un état loading / error** | l'écran concerné | `useResource` les fournit déjà ; afficher `<Loading />`, `<ErrorState />`, `<EmptyState />` de `components/ui/states.tsx`. |
| **Corriger un appel API** | `services/…` | Jamais dans l'écran. Les colonnes demandées sont dans les constantes `…_FIELDS`. |
| Afficher un champ qui n'arrive pas | `services/…` **et** `types/domain.ts` | Ajouter la colonne au `select`, puis au type. Les deux, sinon TypeScript refuse. |
| Changer un message d'erreur | `services/errors.ts` | Le dictionnaire `MESSAGES` fait la correspondance code serveur → phrase. |
| Ajouter un bouton « rafraîchir » | l'écran | `resource.refresh()` est déjà exposé ; un `RefreshControl` est branché sur la plupart des écrans. |
| Changer la durée du cache | `services/catalog.ts` ou `bookings.ts` | La constante `CACHE_MAX_AGE`. |
| **Persister une préférence** | `storage/preferences.ts` | Copier le modèle du filtre de catégorie : une clé, un `read`, un `write`, puis un `useEffect` de relecture dans l'écran. |

### Métier

| Demande | Fichier |
| --- | --- |
| Changer les horaires d'ouverture ou la durée d'un créneau | `features/booking/slots.ts` (`OPENING_HOUR`, `CLOSING_HOUR`, `DAYS_AHEAD`) |
| Changer le nombre de jours réservables | `features/booking/slots.ts` (`DAYS_AHEAD`) |
| Changer la règle « à venir / passée » | `features/booking/split.ts` |
| Changer le format d'une date ou d'un crédit | `utils/format.ts` |
| Changer un libellé de catégorie ou de statut | `types/domain.ts` |

### Permissions et fonctions natives

| Demande | Fichier | Geste |
| --- | --- | --- |
| **Ajouter un fallback si permission refusée** | `app/(tabs)/index.tsx`, `atelier/[slug].tsx` (position) · `app/(tabs)/arrivee.tsx` (caméra) | Les états existent : `denied` (on peut redemander) et `blocked` (passer par les réglages). |
| Changer le texte affiché par iOS lors de la demande | `app.json` | Les clés `locationWhenInUsePermission` et `cameraPermission`. Ne s'applique qu'en build, pas dans Expo Go. |
| **Afficher la distance depuis la position** | `features/location/distance.ts` + l'écran | `distanceMeters(from, to)` puis `formatDistance(m)` ; `byDistance(liste, position)` trie et ajoute le champ `distance`. |
| Changer la précision ou éviter une lecture GPS | `features/location/use-position.ts` | `Location.Accuracy.Balanced`. |
| **Ajouter une validation avant l'action de scan** | `app/(tabs)/arrivee.tsx`, fonction `onScanned` | Tout se passe entre la lecture du code et l'appel à `checkIn` : c'est là qu'on ajoute une confirmation ou une vérification. |
| Accepter un autre format de QR code | `features/scan/code.ts` | Les deux expressions régulières `DEEP_LINK` et `WEB_LINK`. |
| Régénérer les QR codes | `npm run qr` | Écrit `qr-codes.html`. |

---

## 4. Les six fichiers à connaître par cœur

Si vous n'en relisez que six avant l'épreuve, prenez ceux-là.

1. **`src/app/_layout.tsx`** — polices, session, redirection. Le point d'entrée.
2. **`src/hooks/use-resource.ts`** — 80 lignes, et tous les écrans en dépendent.
   Le `let active = true` du `useEffect` empêche une réponse tardive d'écraser
   l'écran suivant ; les fonctions passées doivent être stables (`useCallback`)
   sinon la requête repart à chaque rendu.
3. **`src/features/auth/session.tsx`** — contexte React, restauration de session,
   rafraîchissement du jeton au retour au premier plan.
4. **`src/app/(tabs)/arrivee.tsx`** — la machine à états du scan :
   `idle → scanning → checking → done | failed`. Le `useRef` évite d'envoyer
   dix fois le même code au serveur.
5. **`src/app/machine/[slug].tsx`** — route dynamique, deux chargements en
   cascade (la machine, puis ses créneaux), et une mutation.
6. **`src/services/errors.ts`** — comment une erreur Postgres devient une phrase.

---

## 5. Recettes complètes

### A. Ajouter un champ affiché sur la fiche machine

1. `src/services/catalog.ts` → ajouter la colonne à `MACHINE_FIELDS`.
2. `src/types/domain.ts` → ajouter le champ au type `Machine`.
3. `src/app/machine/[slug].tsx` → l'afficher dans un `<Text>`.

### B. Ajouter un écran détail (exemple : l'historique d'une arrivée)

1. Créer `src/app/arrivee/[id].tsx`.
2. `const { id } = useLocalSearchParams<{ id: string }>();`
3. Charger : `useResource(useCallback(() => fetchTruc(id), [id]))`.
4. Déclarer l'écran dans `src/app/_layout.tsx` :
   `<Stack.Screen name="arrivee/[id]" options={{ title: "Arrivée" }} />`.
5. Naviguer depuis une carte : `onPress={() => router.push(\`/arrivee/${id}\`)}`.

### C. Ajouter un filtre à la liste des machines

1. `src/app/(tabs)/machines.tsx` → un `useState` pour le critère.
2. Filtrer le tableau `visible` juste avant le rendu.
3. Ajouter un `<Chip>` (le composant est déjà dans le fichier).
4. Pour le mémoriser : une clé dans `src/storage/preferences.ts`.

### D. Ajouter une confirmation avant une action

`Alert.alert(titre, message, [{ text: "Annuler", style: "cancel" }, { text: "Confirmer", style: "destructive", onPress: … }])`
— le modèle exact est dans `reservations.tsx`, fonction `confirmCancel`.

### E. Ajouter un service

1. Créer la fonction dans `src/services/…` : appel Supabase, `if (error) throw new Error(error.message)`, retour typé.
2. L'utiliser dans un écran via `useResource` (lecture) ou dans un `try / catch` avec `toMessage(cause)` (écriture).

---

## 6. Les pièges qui font perdre du temps

- **Une fonction non mémorisée passée à `useResource`** relance la requête à
  chaque rendu → boucle infinie. Toujours `useCallback` quand la fonction dépend
  d'une variable.
- **Un `'` dans du texte JSX** fait échouer ESLint. Utilisez `’`.
- **`Date.now()` appelé pendant le rendu** est refusé par la règle de pureté de
  React Compiler → mettez l'appel dans une fonction de `features/` (c'est
  pourquoi `split.ts` existe).
- **Ajouter une colonne au `select` sans l'ajouter au type** → erreur
  TypeScript ; et l'inverse → `undefined` à l'exécution.
- **La fenêtre de permission iOS ne s'affiche qu'une fois par installation.**
  Ensuite, il faut passer par les Réglages.
- **Le catalogue est en cache une heure** : si une donnée modifiée dans Supabase
  n'apparaît pas, tirez vers le bas pour rafraîchir.
- **Changer `app.json` demande de relancer** `npx expo start -c`.
- **Une image qui ne s'affiche pas** vient du réseau (`theme/images.ts`), pas du
  bundle.

---

## 7. Vocabulaire à employer devant le jury

| Mot | Ce que ça veut dire ici |
| --- | --- |
| **Expo Router** | La navigation par fichiers : un fichier dans `app/` = un écran. |
| **Route dynamique** | `[slug].tsx` : un même écran pour toutes les machines. |
| **Groupe** | `(tabs)` : organise sans apparaître dans l'URL. |
| **Stack / Tabs** | Pile d'écrans empilés (avec retour) / barre d'onglets. |
| **Service** | La couche qui parle au backend, jamais l'écran. |
| **RLS** | Row Level Security : c'est la base qui décide qui voit quoi, pas l'app. |
| **`security definer`** | Une fonction SQL qui porte le métier sensible (réserver, valider une arrivée). |
| **Machine à états** | `idle → scanning → checking → done | failed`, dans l'écran Arrivée. |
| **Deep link** | `gabarit://machine/<slug>`, ce que contient le QR code. |
| **SecureStore** | Le trousseau du téléphone, où dort la session. |
| **Development build** | Une vraie app installée, nécessaire pour les modules natifs absents d'Expo Go (le NFC, par exemple). |
