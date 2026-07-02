'use client';

import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { RepasWithIngredients } from '@/types';

interface RepasCardProps {
  repas: RepasWithIngredients;
  onClick: () => void;
  selectMode?: boolean;
}

export default function RepasCard({ repas, onClick, selectMode = false }: RepasCardProps) {
  const { titre, photoUrl } = repas;
  const [imageError, setImageError] = useState(false);

  return (
    <article 
      onClick={onClick}
      className="flex flex-col justify-between p-4 transition-all duration-300 border border-neutral-200/45 dark:border-neutral-800/40 shadow-sm bg-card-light dark:bg-card-dark rounded-card hover:shadow-md hover:scale-[1.01] hover:border-neutral-300/60 dark:hover:border-neutral-700/60 active:scale-[0.99] cursor-pointer group"
    >
      {/* Conteneur d'image */}
      <div className="relative w-full overflow-hidden aspect-square rounded-card bg-brand-light/50 dark:bg-neutral-800/50 mb-3.5 flex items-center justify-center border border-neutral-100 dark:border-neutral-800/20">
        {photoUrl && !imageError ? (
          <img 
            src={photoUrl} 
            alt={titre} 
            onError={() => setImageError(true)}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" 
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="p-3 bg-brand-light dark:bg-brand/10 text-brand rounded-full mb-2">
              <Utensils className="h-6 w-6 stroke-[1.5]" />
            </div>
            <span className="text-[11px] font-semibold text-text-light-muted dark:text-text-dark-muted">
              Pas de photo
            </span>
          </div>
        )}
      </div>

      {/* Titre */}
      <h3 className="mb-4 text-base font-bold text-center line-clamp-2 text-text-light-main dark:text-text-dark-main px-1">
        {titre}
      </h3>

      {/* Action / Bouton */}
      <div className="flex items-center justify-center mt-auto w-full">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className={`w-full py-2.5 text-xs font-bold tracking-wide transition-all duration-300 rounded-input active:scale-95 cursor-pointer shadow-sm hover:shadow ${
            selectMode 
              ? 'bg-brand text-white hover:bg-brand-hover' 
              : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-brand hover:text-white dark:hover:bg-brand dark:hover:text-white text-text-light-main dark:text-text-dark-main'
          }`}
        >
          {selectMode ? 'Sélectionner' : 'Voir la recette'}
        </button>
      </div>
    </article>
  );
}
