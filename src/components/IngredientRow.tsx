'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { CategorieIngredient } from '@/types';

export interface IngredientRowItem {
  id: string; // client-side unique key
  ingredientId?: number;
  nom: string;
  quantite: string;
  unite: string;
  categorie: CategorieIngredient;
}

interface IngredientRowProps {
  ingredient: IngredientRowItem;
  onChange: (id: string, field: 'quantite' | 'unite', value: string) => void;
  onRemove: (id: string) => void;
}

export default function IngredientRow({ ingredient, onChange, onRemove }: IngredientRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 animate-fade-in">
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-light-main dark:text-text-dark-main truncate">
          {ingredient.nom}
        </p>
      </div>

      {/* Quantity & Unit input group + Delete button */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Unified Quantity / Unit input */}
        <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl bg-card-light dark:bg-card-dark focus-within:border-brand overflow-hidden h-10 w-36 md:w-44 transition-all">
          <input
            type="number"
            step="any"
            value={ingredient.quantite}
            onChange={(e) => onChange(ingredient.id, 'quantite', e.target.value)}
            placeholder="Qté"
            className="w-14 md:w-18 px-2 text-xs font-semibold text-center border-none bg-transparent outline-none text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 shrink-0" />
          <input
            type="text"
            value={ingredient.unite}
            onChange={(e) => onChange(ingredient.id, 'unite', e.target.value)}
            placeholder="Unité"
            className="flex-1 min-w-0 px-2 text-xs font-semibold border-none bg-transparent outline-none text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted"
          />
        </div>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onRemove(ingredient.id)}
          className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer shrink-0"
          title="Supprimer l'ingrédient"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
