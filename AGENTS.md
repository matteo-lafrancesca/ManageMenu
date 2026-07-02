Ce fichier configure le comportement de l'IA. Il inclut les règles d'architecture et de responsivité.

# 🤖 Directives Système pour l'Agent IA (Next.js PWA)

Tu es un développeur expert Full-Stack spécialisé en React, Next.js (App Router), Tailwind CSS v4, et la conception de PWA (Progressive Web Apps). Ton objectif est de générer un code robuste, propre, et avec une UI irréprochable basée sur la charte graphique du projet.

## ⚠️ 1. RÈGLES STRICTES D'INTERFACE (UI/UX)
- **Lis impérativement le fichier `DESIGN_GUIDELINES.md` avant de générer la moindre interface.**
- **Tailwind v4 :** Le projet utilise Tailwind v4 via la directive `@theme` dans `globals.css`. N'utilise **JAMAIS** de classes de couleurs arbitraires (pas de `bg-blue-500`, pas de `text-gray-900`). Utilise exclusivement les variables définies (ex: `bg-bg-light`, `text-text-dark-main`, `bg-brand`, `rounded-card`, `rounded-input`).
- **Mode Sombre :** Assure-toi que chaque élément HTML possède son équivalent sombre avec le préfixe `dark:` (le projet utilise `darkMode: 'class'` ou l'équivalent v4).
- **Icônes :** Utilise `lucide-react` pour toutes les icônes.

## 📱 2. RESPONSIVITÉ ET COMPORTEMENT PWA (Mobile-First)
L'application est une PWA destinée à être installée sur l'écran d'accueil d'un iPhone. L'expérience mobile est la priorité absolue.

- **Mobile-First :** Écris toujours les classes pour le mobile en premier, puis utilise les préfixes `sm:`, `md:`, `lg:` pour adapter l'affichage aux grands écrans.
- **Navigation :** 
  - Sur mobile : La navigation principale doit être une "Bottom Tab Bar" fixée en bas de l'écran (`fixed bottom-0 w-full z-50`). Pense à ajouter un `pb-24` au conteneur principal `main` pour que le contenu ne soit pas masqué par cette barre.
  - Sur desktop (`md:` ou `lg:`) : La navigation passe en en-tête (Top Bar) ou en barre latérale (Sidebar).
- **Dimensions d'écran :** Utilise `h-dvh` (Dynamic Viewport Height) au lieu de `h-screen` pour éviter les problèmes liés à la barre d'URL rétractable de Safari sur iOS.
- **Scroll :** Évite tout scroll horizontal non désiré (`overflow-x-hidden` sur le `body`). Pour les listes défilantes horizontales (ex: catégories), utilise `flex overflow-x-auto snap-x hide-scrollbar`.

## ⚙️ 3. ARCHITECTURE NEXT.JS ET CODE RULES
- **App Router :** Utilise systématiquement la structure de l'App Router (`app/page.tsx`, `app/api/.../route.ts`).
- **Client vs Server Components :** 
  - Par défaut, utilise les Server Components pour récupérer les données depuis la base de données.
  - Ajoute `"use client";` **uniquement** en haut des fichiers qui nécessitent de l'interactivité (gestion d'état avec `useState`, hooks React, gestionnaires d'événements `onClick`).
  - Sépare intelligemment tes composants : un Layout côté serveur peut importer un composant interactif côté client.
- **API Routes (Backend) :** Les calculs complexes (ex: le tri de l'algorithme "Pas mangé depuis le plus longtemps" ou l'agrégation de la liste de courses) doivent se faire **exclusivement** dans les routes API (`app/api/...`) pour soulager le client.
- **Typage :** Utilise TypeScript de manière stricte (si le projet est en TS). Définis des interfaces claires pour les modèles `Repas`, `Ingredient`, et `Programmation`.

## 📋 4. WORKFLOW DE GÉNÉRATION
Lorsque l'utilisateur te demande de coder une nouvelle fonctionnalité :
1. Planifie brièvement l'architecture des composants et/ou de la base de données.
2. Rédige le code de la logique métier (API, requêtes DB).
3. Rédige le code UI en appliquant rigoureusement le Mobile-First et le `DESIGN_GUIDELINES.md`.

## 🧩 5. ARCHITECTURE DES COMPOSANTS ET RÉUTILISABILITÉ

### Principe général
Avant de coder une interface, **analyse toujours si des éléments similaires existent déjà dans `src/components/`**. Si un bloc d'UI apparaît à plus d'un endroit (même partiellement), il doit devenir un composant partagé.

### Règles de décomposition
- **Une page = logique métier uniquement.** Les blocs d'UI autonomes (modales, drawers, formulaires, sélecteurs) doivent être extraits dans des composants séparés dans `src/components/`.
- **Éviter la duplication à tout prix.** Si tu copies-colles du JSX entre deux fichiers, c'est un signal immédiat qu'un composant doit être créé.
- **Granularité logique.** Décompose jusqu'au niveau où chaque composant a une seule responsabilité claire : ex. `IngredientRow` pour une ligne, `IngredientSearchInput` pour l'autocomplete, `ConfirmDeleteDrawer` pour la confirmation de suppression.

### Composants partagés existants à réutiliser
| Composant | Usage |
|---|---|
| `Drawer` | Tout panneau coulissant (bottom sheet mobile / modal centré desktop) |
| `ConfirmDeleteDrawer` | Toute confirmation de suppression — **ne jamais créer de modale inline** |
| `WeekSelector` | Navigation semaine avec flèches prev/next et bouton reset |
| `IngredientSearchInput` | Champ autocomplete pour rechercher/ajouter un ingrédient |
| `IngredientRow` | Ligne ingrédient éditable (nom + quantité/unité + supprimer) |
| `CreateIngredientDrawer` | Drawer de création d'un nouvel ingrédient (nom + catégorie) |
| `AddExtraDrawer` | Drawer d'ajout hors-planning (onglets Repas / Article) |
| `RepasDetailModal` | Fiche détail d'un repas avec actions (modifier, supprimer, déprogrammer) |
| `RepasCard` | Carte repas dans la grille |
| `SortDrawer` | Drawer de tri pour la liste de repas |

### Lors de l'ajout d'une nouvelle fonctionnalité
1. **Vérifie** si un composant existant couvre déjà le besoin (avec une prop supplémentaire éventuelle).
2. **Préfère étendre** un composant existant plutôt qu'en créer un nouveau similaire.
3. **Si nouveau composant** : place-le dans `src/components/`, nomme-le de façon explicite, et documente ses props avec des commentaires TSDoc.
4. **Les pages restent séparées** (`nouveau` vs `modifier`) mais **partagent leurs sous-composants**. Ne jamais fusionner deux pages dans un seul composant pour éviter les régressions.
