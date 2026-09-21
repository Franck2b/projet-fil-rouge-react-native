# Gabarit · application mobile

Application React Native (Expo SDK 57) du réseau d'ateliers partagés **Gabarit**.
Elle s'appuie sur le même backend Supabase que le site web du module précédent :
mêmes comptes, mêmes machines, mêmes crédits, mêmes règles métier.

- Projet web source : <https://github.com/Franck2b/Fil-Rouge-Next> — en ligne sur <https://fil-rouge-next.vercel.app>
- Expo SDK 57 · React Native 0.86 · React 19.2 · Expo Router

## Pourquoi une app en plus du site

Le site sert à découvrir le réseau, gérer son compte et administrer les ateliers :
des usages assis, au calme. L'app sert **l'usage sur place**, debout, une main
prise :

| Sur le web | Sur mobile |
| --- | --- |
| Vitrine, back-office, gestion longue | Action rapide, en atelier |
| Catalogue complet, SEO | Machines filtrées, prochaine séance en tête |
| Réservation depuis un bureau | Validation d'arrivée devant la machine |
| Adresse d'un atelier | Ateliers triés par distance réelle |

Deux capacités du téléphone portent cette valeur :

1. **La caméra** — chaque machine porte un QR code. Le scanner déclare son
   arrivée : le serveur vérifie qu'une réservation du membre est bien en cours
   sur cette machine et enregistre la trace.
2. **La géolocalisation** — elle classe les ateliers du plus proche au plus loin,
   affiche la distance sur la fiche atelier, et confirme lors d'un scan que le
   membre est bien à moins de 300 m de l'atelier.

> **Remarque sur le NFC.** Le sujet demandait le NFC. Il exige un *development
> build*, donc une machine macOS (iOS) ou un abonnement EAS pour compiler dans le
> cloud, ce dont je ne dispose pas. En accord avec l'enseignant, le NFC est
> remplacé par le **QR code lu à la caméra** : même parcours (objet physique →
> lecture → validation serveur → trace), et testable dans Expo Go.

## Lancer le projet

### 1. Prérequis

- Node 22.13 ou plus récent
- L'application **Expo Go** sur un iPhone ou un Android
- Le téléphone et l'ordinateur sur le même réseau Wi-Fi

### 2. Installer

```bash
npm install
```

### 3. Configurer l'accès au backend

```bash
cp .env.example .env
```

Renseignez les deux variables depuis Supabase → *Project Settings* → *API Keys* :

| Variable | Rôle |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique (`sb_publishable_…`) |

Seule la clé *publishable* est embarquée : elle est faite pour vivre dans un
client, c'est la RLS de la base qui protège les données. **Aucune clé secrète ni
service role ne doit entrer dans ce dépôt.**

### 4. Préparer la base

Dans le SQL Editor de Supabase, exécuter une fois
[`supabase/0003_check_ins.sql`](supabase/0003_check_ins.sql) (après les
migrations du projet web). Il ajoute la table des arrivées et les fonctions
`check_in_with_code` et `my_check_ins`.

### 5. Démarrer

```bash
npx expo start
```

Scannez le QR code affiché dans le terminal avec l'appareil photo de l'iPhone
(ou depuis Expo Go sur Android). Sur un réseau qui bloque les connexions
locales, utilisez `npx expo start --tunnel`.

### 6. Imprimer les QR codes des machines

```bash
npm run qr
```

Écrit `qr-codes.html` : une planche à imprimer, un QR code par machine, encodant
`gabarit://machine/<slug>`. C'est le matériel de test, l'équivalent des cartes
NFC fournies en cours.

## Comptes de démonstration

| Compte | Identifiants |
| --- | --- |
| Membre | `membre@etabli.test` · `Gabarit2026!` |
| Admin | `admin@etabli.test` · `Gabarit2026!` |

L'administration reste sur le web : l'app est l'outil du membre.

## Scénarios à démontrer

**Scénario QR code (remplace le NFC)**

1. Se connecter avec le compte membre.
2. Réserver un créneau qui commence maintenant sur une machine (onglet
   *Machines* → une machine → un créneau).
3. Onglet *Arrivée* → **Scanner un QR code** → autoriser la caméra.
4. Viser le QR code de cette machine (planche imprimée ou affichée à l'écran).
5. L'arrivée s'affiche, validée par le serveur, et rejoint « Dernières arrivées ».

Erreurs à montrer : un QR code quelconque (« pas un code machine »), un scan sans
réservation en cours (« aucune réservation en cours »), un second scan du même
créneau (« arrivée déjà enregistrée »).

**Scénario géolocalisation**

1. Onglet *Accueil* → **Trier par distance** → autoriser la position.
2. Les trois ateliers se classent, distance affichée sur chaque carte.
3. Refuser la permission : les ateliers restent listés, sans distance, avec un
   message expliquant comment l'autoriser plus tard.
4. Lors d'un scan hors de l'atelier : « Vous êtes trop loin de l'atelier ».

## Expo Go et development build

| | Expo Go | Development build |
| --- | --- | --- |
| Lancement | `npx expo start`, QR code | `npx expo run:android` / `run:ios`, puis `npx expo start --dev-client` |
| Ce qui marche | **tout le projet** : navigation, session, caméra, GPS | idem, plus les modules natifs absents d'Expo Go |
| Nécessaire ici | oui, c'est le mode de test | non, aucun module natif hors SDK Expo |

Si le NFC devait être ajouté (`react-native-nfc-manager`), il faudrait un
development build : ce module n'est pas inclus dans Expo Go.

## Architecture

```
src/
├── app/                 routes Expo Router, une par écran
│   ├── _layout.tsx      session + garde de navigation
│   ├── (auth)/          connexion, inscription
│   ├── (tabs)/          accueil, machines, arrivée, réservations, profil
│   ├── machine/[slug]   fiche machine et réservation d'un créneau
│   └── atelier/[slug]   fiche atelier
├── components/          cartes métier et briques d'interface (ui/)
├── features/            métier : auth, booking, location, scan
├── services/            accès Supabase et traduction des erreurs
├── storage/             trousseau (session), cache et préférences
├── hooks/               use-resource : loading / error / empty / data
├── theme/               couleurs, espacements, typographie
├── types/               types du domaine, alignés sur le schéma SQL
└── utils/               formats de dates et de crédits
```

Règle tenue partout : **un écran n'appelle jamais Supabase directement**. Il
appelle un service, qui parle au backend ; le métier sensible (réserver,
annuler, valider une arrivée) vit dans des fonctions SQL `security definer`.

## Ce qui est géré

- **Session** : stockée dans le trousseau du téléphone (`expo-secure-store`,
  valeur découpée en tranches car SecureStore refuse au-delà de 2 Ko),
  rafraîchie automatiquement, remise en route au retour au premier plan.
- **Permissions** : caméra et position demandées au moment de l'action, jamais au
  lancement, avec un refus géré et une alternative dans chaque cas.
- **États** : chaque écran distingue chargement, erreur, vide et contenu.
- **Hors-ligne minimal** : catalogue et réservations relus depuis un cache local
  (`AsyncStorage`) le temps que le réseau réponde.
- **Préférence persistée** : le filtre de famille de machines est retrouvé à la
  réouverture.
- **Listes** : `FlatList` pour le catalogue, cartes rendues à la demande.
- **Batterie** : une seule lecture GPS par appui, jamais de suivi continu ; la
  caméra n'est allumée que pendant le scan.

## Limites connues

- L'app est en français seulement, alors que le site est bilingue FR/EN.
- Pas de NFC (voir plus haut), pas de notifications push.
- La distance est à vol d'oiseau, sans carte affichée.
- L'administration (habilitations, gestion du parc) reste réservée au site.
- Le projet Supabase gratuit se met en pause après une semaine sans usage : le
  réveiller depuis le tableau de bord Supabase avant une démonstration.

## Usage de l'IA

<!-- À réécrire avec vos propres mots avant le rendu : c'est une section notée. -->

- **Outils utilisés** : Claude Code (agent en terminal) pour la génération du
  projet et la rédaction de ce README.
- **Tâches confiées** : mise en place de l'arborescence, écriture des écrans, du
  client Supabase, de la fonction SQL d'arrivée et de la documentation.
- **Un choix de l'IA corrigé ou refusé** : *(à compléter — par exemple le
  stockage de session proposé en clair dans AsyncStorage, remplacé par
  SecureStore avec découpage en tranches.)*
- **Une partie explicable intégralement** : *(à compléter — par exemple
  `src/hooks/use-resource.ts` et le parcours de scan dans
  `src/app/(tabs)/arrivee.tsx`.)*
- **Une limite ou un bug rencontré** : *(à compléter — par exemple
  `create-expo-app` incompatible avec npm 12, contourné en dépliant le modèle à
  la main.)*
