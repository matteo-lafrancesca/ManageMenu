# 🎨 Directives de Design & UI (Système Soft UI - Tailwind v4)

Ce document définit les règles strictes d'interface pour l'application de gestion de repas. Tout composant généré doit respecter cette charte graphique, tant en mode clair qu'en mode sombre. L'application utilise **Tailwind CSS v4** (configuration via `@theme` dans `globals.css`).

## 1. Principes Fondamentaux de l'UI (Soft UI / Warm Minimal)
- **Arrondis Généreux (Corners) :** Aucun angle droit. Les interfaces doivent être douces et accueillantes.
- **Espaces (Spacing) :** Les interfaces doivent respirer. Utiliser massivement `gap-4`, `gap-6` ou `gap-8` dans les grilles et flexboxes. Éviter les interfaces denses.
- **Micro-interactions :** Chaque élément interactif (bouton, carte) doit avoir une transition douce (`transition-all duration-300`) et un retour visuel au survol ou au clic (ex: `hover:scale-[1.02]`, `active:scale-95`, changement subtil d'opacité ou de couleur).
- **Typographie :** La police principale est *Plus Jakarta Sans*. Les titres doivent être lisibles et chaleureux (utiliser `font-semibold` ou `font-bold` pour la hiérarchie).

## 2. Tokens Tailwind v4 (Couleurs et Arrondis)

Ne **JAMAIS** utiliser de noir pur (`#000`) ou de blanc pur en mode sombre. Ne pas utiliser les couleurs par défaut de Tailwind (ex: `bg-blue-500`, `text-gray-900`) mais utiliser **strictement** les tokens personnalisés configurés dans le `@theme` :

| Élément | Classe Mode Clair | Classe Mode Sombre (`dark:`) |
| :--- | :--- | :--- |
| **Fond de page** | `bg-bg-light` | `dark:bg-bg-dark` |
| **Cartes / Fiches** | `bg-card-light` | `dark:bg-card-dark` |
| **Texte Principal** | `text-text-light-main` | `dark:text-text-dark-main` |
| **Texte Secondaire** | `text-text-light-muted`| `dark:text-text-dark-muted` |
| **Boutons / Accents**| `bg-brand text-white` | `dark:bg-brand dark:text-white` |
| **Bordures subtiles**| `border-neutral-200` | `dark:border-neutral-800/50` |

**Rayons de bordure (Border Radius) :**
- `rounded-card` : Pour toutes les fiches repas et les grands conteneurs (24px).
- `rounded-input` : Pour les barres de recherche, boutons principaux et badges (Pilule / 9999px).

## 3. Structure Standard des Composants

### A. Fiche Repas (Card)
```tsx
<article className="flex flex-col justify-between p-5 transition-all duration-300 border border-transparent shadow-sm bg-card-light dark:bg-card-dark rounded-card hover:shadow-md dark:border-neutral-800/40 group">
  <div className="flex items-center justify-center w-full overflow-hidden aspect-square rounded-card bg-neutral-100 dark:bg-neutral-800/50 mb-4">
    <img 
      src={photoUrl} 
      alt={titre} 
      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
    />
  </div>
  <h3 className="mb-3 text-lg font-semibold text-center line-clamp-2 text-text-light-main dark:text-text-dark-main">
    {titre}
  </h3>
  <div className="flex items-center justify-between gap-3 mt-auto">
    <button className="flex-1 px-4 py-2 text-sm font-medium transition-colors bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-text-light-main dark:text-text-dark-main rounded-input">
      Détails
    </button>
  </div>
</article>

### B. Barres de Recherche et Inputs
<input 
  type="text" 
  placeholder="Rechercher une recette..." 
  className="w-full px-6 py-3 text-sm transition-colors border outline-none bg-card-light dark:bg-card-dark border-neutral-200 dark:border-neutral-800 rounded-input focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted"
/>

---
