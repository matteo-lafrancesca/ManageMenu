import type { 
  User as PrismaUser, 
  Repas as PrismaRepas, 
  Ingredient as PrismaIngredient, 
  Programmation as PrismaProgrammation 
} from '@prisma/client';

// Modèles principaux réexportés depuis Prisma
export type User = PrismaUser;
export type Repas = PrismaRepas;
export type Ingredient = PrismaIngredient;
export type Programmation = PrismaProgrammation;

// Catégories d'ingrédients (utilisées pour le tri/filtrage et la liste de courses)
export const CATEGORIES_INGREDIENTS = [
  'Frais',
  'Épicerie',
  'Condiments',
  'Boissons',
  'Surgelés',
  'Boulangerie',
  'Autre'
] as const;

export type CategorieIngredient = typeof CATEGORIES_INGREDIENTS[number];

// Types étendus avec les relations Prisma (couramment utilisés dans l'application)
export type RepasWithIngredients = Repas & {
  ingredients: Ingredient[];
};

export type ProgrammationWithRepas = Programmation & {
  repas: Repas;
};

export type UserWithRelations = User & {
  repas: Repas[];
  programmation: Programmation[];
};
