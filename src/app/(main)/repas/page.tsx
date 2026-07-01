'use client';

import React, { useState, useEffect } from 'react';
import { Search, ArrowUpDown, UtensilsCrossed, Plus } from 'lucide-react';
import Link from 'next/link';
import { RepasWithIngredients } from '@/types';
import RepasCard from '@/components/RepasCard';
import RepasDetailModal from '@/components/RepasDetailModal';
import SortDrawer from '@/components/SortDrawer';

export default function RepasPage() {
  const [repasList, setRepasList] = useState<RepasWithIngredients[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date_creation');
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  // Detail Modal state
  const [selectedRepas, setSelectedRepas] = useState<RepasWithIngredients | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch meals on change of search query (debounced) or sort mode
  useEffect(() => {
    let active = true;
    
    const fetchRepas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `/api/repas?sort=${sortBy}`;
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery)}`;
        }
        
        // Sorting direction configuration: alphabetical goes asc, others desc
        if (sortBy === 'alphabetique') {
          url += `&order=asc`;
        } else {
          url += `&order=desc`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('Impossible de charger vos repas.');
        }
        const data = await res.json();
        
        if (active) {
          setRepasList(data);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || 'Une erreur est survenue lors de la récupération des repas.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    // Debounce search input to avoid hitting database on every keystroke
    const delayDebounceFn = setTimeout(() => {
      fetchRepas();
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, sortBy]);

  const getCurrentSortLabel = () => {
    switch (sortBy) {
      case 'alphabetique':
        return 'Ordre alphabétique';
      case 'rarete':
        return 'Rare (Moins programmé)';
      case 'date_creation':
      default:
        return 'Ajouté récemment';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-light-main dark:text-text-dark-main">
          Mes repas
        </h1>
        <Link
          href="/repas/nouveau"
          className="flex items-center gap-2 px-4.5 py-2.5 text-sm font-bold bg-brand hover:bg-brand-hover text-white rounded-input hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm shadow-brand/20 cursor-pointer text-center"
        >
          <Plus className="h-4.5 w-4.5 shrink-0" />
          <span>Nouveau repas</span>
        </Link>
      </div>

      {/* Toolbar / Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card-light dark:bg-card-dark p-4 rounded-card border border-neutral-200/40 dark:border-neutral-800/40 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light-muted dark:text-text-dark-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un repas par titre..."
            className="w-full pl-11 pr-6 py-2.5 text-sm transition-all border outline-none bg-bg-light dark:bg-bg-dark border-neutral-200/50 dark:border-neutral-800 rounded-input focus:border-brand dark:focus:border-brand focus:ring-1 focus:ring-brand text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted"
          />
        </div>

        {/* Sort Drawer Trigger Button */}
        <button
          onClick={() => setIsSortOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-all border outline-none bg-bg-light dark:bg-bg-dark border-neutral-200/50 dark:border-neutral-800 rounded-input hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-text-light-main dark:text-text-dark-main cursor-pointer shadow-xs active:scale-98"
        >
          <ArrowUpDown className="h-4 w-4 text-text-light-muted dark:text-text-dark-muted shrink-0" />
          <span>Trier par : {getCurrentSortLabel()}</span>
        </button>
      </div>

      {/* Main Grid Content Area */}
      {loading ? (
        /* Shimmer Skeletal Loader */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, idx) => (
            <div 
              key={idx} 
              className="flex flex-col justify-between p-4 border border-neutral-200/30 dark:border-neutral-800/30 bg-card-light dark:bg-card-dark rounded-card animate-pulse"
            >
              <div className="w-full aspect-square rounded-card bg-neutral-200 dark:bg-neutral-800/40 mb-3.5" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-800/40 rounded-full w-3/4 mx-auto mb-4" />
              <div className="h-9 bg-neutral-200 dark:bg-neutral-800/40 rounded-input w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error Alert Display */
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 p-4 rounded-card text-center text-sm font-medium text-red-600 dark:text-red-400 max-w-lg mx-auto mt-6">
          {error}
        </div>
      ) : repasList.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-14 px-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-card bg-card-light/20 dark:bg-card-dark/5 max-w-md mx-auto text-center mt-6">
          <div className="p-4 bg-brand-light dark:bg-brand/10 text-brand rounded-full mb-4">
            <UtensilsCrossed className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-text-light-main dark:text-text-dark-main">
            Aucun repas trouvé
          </h3>
          <p className="text-sm text-text-light-muted dark:text-text-dark-muted mt-2 font-medium">
            {searchQuery 
              ? "Aucun résultat ne correspond à votre recherche. Essayez d'autres mots-clés ou modifiez vos filtres." 
              : "Vous n'avez pas encore enregistré de repas dans votre carnet de recettes."
            }
          </p>
        </div>
      ) : (
        /* Meals Grid List */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
          {repasList.map((repas) => (
            <RepasCard
              key={repas.id}
              repas={repas}
              onClick={() => {
                setSelectedRepas(repas);
                setIsDetailOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Repas Detail Modal */}
      <RepasDetailModal
        repas={selectedRepas}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedRepas(null);
        }}
      />

      {/* Sort Drawer */}
      <SortDrawer
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        currentSort={sortBy}
        onSortChange={setSortBy}
      />
    </div>
  );
}
