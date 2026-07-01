'use client';

import React, { useState, useEffect } from 'react';
import { Utensils, ShoppingBasket, BookOpen } from 'lucide-react';
import { RepasWithIngredients } from '@/types';
import { formatIngredient } from '@/lib/shopping-list-utils';
import Drawer from '@/components/Drawer';

interface RepasDetailModalProps {
  repas: RepasWithIngredients | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RepasDetailModal({ repas, isOpen, onClose }: RepasDetailModalProps) {
  const [activeRepas, setActiveRepas] = useState<RepasWithIngredients | null>(null);

  useEffect(() => {
    if (repas) {
      setActiveRepas(repas);
    }
  }, [repas]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setActiveRepas(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keep rendering while the modal is open or during the exit transition
  if (!activeRepas && !isOpen) return null;

  const currentRepas = activeRepas || repas;
  if (!currentRepas) return null;

  const { titre, photoUrl, recette, ingredients } = currentRepas;

  const headerImage = (
    <div className="relative w-full h-56 md:h-72 bg-brand-light dark:bg-neutral-800/30 border-b border-neutral-100 dark:border-neutral-800/20">
      {photoUrl ? (
        <img 
          src={photoUrl} 
          alt={titre} 
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-brand-light dark:text-neutral-700">
          <Utensils className="h-16 w-16 text-brand/35 dark:text-brand/20 stroke-[1.2]" />
        </div>
      )}
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      headerImage={headerImage}
      maxWidth="sm:max-w-3xl"
    >
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-light-main dark:text-text-dark-main">
            {titre}
          </h2>
        </div>

        <hr className="border-neutral-100 dark:border-neutral-800/40" />

        {/* Grid Layout: Column 1 (Ingredients), Column 2-3 (Recipe) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          {/* Column 1: Ingredients */}
          <div className="md:col-span-1 space-y-5">
            <div className="flex items-center gap-2 text-brand font-bold text-sm uppercase tracking-wider">
              <ShoppingBasket className="h-5 w-5 stroke-[2]" />
              <h3>Ingrédients</h3>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-sm text-text-light-muted dark:text-text-dark-muted italic">
                Aucun ingrédient renseigné.
              </p>
            ) : (
              <ul className="space-y-2">
                {ingredients.map((ing) => (
                  <li 
                    key={ing.id} 
                    className="text-sm font-medium text-text-light-main dark:text-text-dark-main bg-neutral-50 dark:bg-neutral-800/20 px-3.5 py-2.5 rounded-xl border border-neutral-100/50 dark:border-neutral-800/20"
                  >
                    {formatIngredient(ing.nom, ing.quantite, ing.unite)}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 2-3: Recipe Instructions */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2 text-brand font-bold text-sm uppercase tracking-wider">
              <BookOpen className="h-5 w-5 stroke-[2]" />
              <h3>Préparation</h3>
            </div>

            {recette ? (
              <div className="space-y-4">
                {recette.split('\n').filter(line => line.trim() !== '').map((step, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <span className="flex items-center justify-center shrink-0 w-6 h-6 rounded-full bg-brand-light dark:bg-brand/10 text-brand text-xs font-bold mt-0.5 border border-brand/10">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-text-light-main dark:text-text-dark-main leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-light-muted dark:text-text-dark-muted italic">
                Aucune instruction de préparation.
              </p>
            )}
          </div>

        </div>
      </div>
    </Drawer>
  );
}
