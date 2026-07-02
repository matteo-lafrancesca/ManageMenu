'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  Carrot, 
  Beef, 
  Egg, 
  Croissant, 
  Soup, 
  Cookie, 
  GlassWater, 
  Snowflake,
  Refrigerator,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  Check,
  ShoppingBag,
  Trash2,
  Apple,
  Plus,
  Utensils,
  X,
  Search
} from 'lucide-react';
import { CategorieIngredient, CATEGORY_DETAILS, normalizeCategory } from '@/types';
import { getDatesForISOWeek, getISOWeekAndYear } from '@/lib/date-utils';
import Drawer from '@/components/Drawer';
import { formatIngredient } from '@/lib/shopping-list-utils';

interface ShoppingItem {
  id: number;
  ingredientId: number;
  nom: string;
  quantite: number | null;
  unite: string | null;
  phrase: string;
  isChecked: boolean;
}

interface CategoryGroup {
  categorie: CategorieIngredient;
  label: string;
  order: number;
  items: ShoppingItem[];
}

const CATEGORY_ICONS: Record<CategorieIngredient, React.ComponentType<{ className?: string }>> = {
  'fruits-legumes': Carrot,
  'boucherie-poissonnerie': Beef,
  'frais': Refrigerator,
  'produits-laitiers': Egg,
  'boulangerie-patisserie': Croissant,
  'epicerie-salee': Soup,
  'epicerie-sucree': Cookie,
  'boissons': GlassWater,
  'surgeles': Snowflake,
};

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [extras, setExtras] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  // Clean error handling states
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // States for the manual items drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'repas' | 'ingredient'>('repas');
  const [allMeals, setAllMeals] = useState<any[]>([]);
  const [loadingMeals, setLoadingMeals] = useState(false);

  // Selected article state
  const [selectedIngredient, setSelectedIngredient] = useState<{ id: string | number; nom: string; categorie: string } | null>(null);

  // Deletion confirmation state
  const [extraToDelete, setExtraToDelete] = useState<any | null>(null);
  
  // States for Repas tab
  const [selectedRepasId, setSelectedRepasId] = useState<string>('');
  const [searchMealQuery, setSearchMealQuery] = useState('');

  // States for Ingredient tab
  const [ingredientNameInput, setIngredientNameInput] = useState('');
  const [ingredientCategory, setIngredientCategory] = useState<CategorieIngredient>('epicerie-salee');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnite, setIngredientUnite] = useState('');
  const [ingredientSuggestions, setIngredientSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addingExtra, setAddingExtra] = useState(false);

  // Unified fetch shopping list data function
  const fetchShoppingList = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      setError(null);

      const weekParam = searchParams.get('week');
      const yearParam = searchParams.get('year');

      let url = '/api/shopping-list';
      if (weekParam && yearParam) {
        url += `?week=${weekParam}&year=${yearParam}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Impossible de charger la liste de courses.');
      }

      const data = await res.json();
      setCategories(data.categories || []);
      setExtras(data.extras || []);
      setCurrentWeek(data.week);
      setCurrentYear(data.year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la récupération des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShoppingList(true);
  }, [searchParams]);

  // Load meals when drawer is opened
  useEffect(() => {
    if (isDrawerOpen) {
      const fetchMeals = async () => {
        try {
          setLoadingMeals(true);
          const res = await fetch('/api/repas');
          if (res.ok) {
            const data = await res.json();
            setAllMeals(data);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingMeals(false);
        }
      };
      fetchMeals();
    }
  }, [isDrawerOpen]);

  // Autocomplete for ingredient names
  useEffect(() => {
    if (ingredientNameInput.trim().length < 2) {
      setIngredientSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ingredients?search=${encodeURIComponent(ingredientNameInput)}`);
        if (res.ok) {
          const data = await res.json();
          setIngredientSuggestions(data);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [ingredientNameInput]);

  // Hide suggestions dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Clear errors and selection when opening/closing or switching tabs
  useEffect(() => {
    setFormError(null);
    setSelectedIngredient(null);
    setIngredientNameInput('');
  }, [isDrawerOpen, activeTab]);

  // Auto-dismiss floating action errors after 4 seconds
  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  const handleAddExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentWeek === null || currentYear === null) return;
    
    setFormError(null);
    setAddingExtra(true);
    try {
      let body: any = {
        week: currentWeek,
        year: currentYear
      };

      if (activeTab === 'repas') {
        if (!selectedRepasId) {
          setFormError('Veuillez sélectionner une recette.');
          setAddingExtra(false);
          return;
        }
        body.repasId = parseInt(selectedRepasId, 10);
      } else {
        if (!selectedIngredient) {
          setFormError("Veuillez sélectionner ou ajouter un article.");
          setAddingExtra(false);
          return;
        }
        body.ingredientName = selectedIngredient.nom;
        body.categorie = selectedIngredient.categorie;
        if (ingredientQuantity) {
          body.quantite = parseFloat(ingredientQuantity);
        }
        if (ingredientUnite) {
          body.unite = ingredientUnite;
        }
      }

      const res = await fetch('/api/shopping-list/extras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Erreur lors de l'ajout.");
      }

      // Reset fields
      setSelectedRepasId('');
      setSelectedIngredient(null);
      setIngredientNameInput('');
      setIngredientQuantity('');
      setIngredientUnite('');
      setIsDrawerOpen(false);
      
      // Refresh list
      await fetchShoppingList(false);
    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue.');
    } finally {
      setAddingExtra(false);
    }
  };

  const handleDeleteExtra = (extra: any) => {
    setExtraToDelete(extra);
  };

  const confirmDeleteExtra = async (extraId: number) => {
    try {
      const res = await fetch(`/api/shopping-list/extras/${extraId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression.');
      }

      // Refresh list
      await fetchShoppingList(false);
    } catch (err: any) {
      setActionError(err.message || 'Une erreur est survenue lors de la suppression.');
    }
  };

  // Filtered meals list based on query
  const filteredMeals = useMemo(() => {
    if (!searchMealQuery.trim()) return allMeals;
    const q = searchMealQuery.toLowerCase();
    return allMeals.filter(meal => meal.titre.toLowerCase().includes(q));
  }, [allMeals, searchMealQuery]);

  // Calculate week start and end date labels client-side
  const weekInfo = useMemo(() => {
    if (currentWeek === null || currentYear === null) return null;
    const { start, end } = getDatesForISOWeek(currentWeek, currentYear);
    return { start, end };
  }, [currentWeek, currentYear]);

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      timeZone: 'UTC' 
    };
    const startFormatted = start.toLocaleDateString('fr-FR', options);
    const endFormatted = end.toLocaleDateString('fr-FR', { 
      ...options, 
      year: 'numeric' 
    });
    return `Du ${startFormatted} au ${endFormatted}`;
  };

  const handlePrevWeek = () => {
    if (!weekInfo) return;
    const prevDate = new Date(weekInfo.start);
    prevDate.setDate(prevDate.getDate() - 7);
    const { week, year } = getISOWeekAndYear(prevDate);
    router.push(`${pathname}?week=${week}&year=${year}`);
  };

  const handleNextWeek = () => {
    if (!weekInfo) return;
    const nextDate = new Date(weekInfo.start);
    nextDate.setDate(nextDate.getDate() + 7);
    const { week, year } = getISOWeekAndYear(nextDate);
    router.push(`${pathname}?week=${week}&year=${year}`);
  };

  const handleCurrentWeek = () => {
    router.push(pathname);
  };

  // Toggle item checked state with optimistic update
  const handleToggleItem = async (itemId: number, currentCheckedState: boolean) => {
    // 1. Optimistic Update
    setCategories((prevCategories) =>
      prevCategories.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === itemId ? { ...item, isChecked: !currentCheckedState } : item
        ),
      }))
    );

    try {
      const res = await fetch(`/api/shopping-list/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isChecked: !currentCheckedState }),
      });

      if (!res.ok) {
        throw new Error('Erreur de synchronisation.');
      }
    } catch {
      // Revert in case of API failure
      setCategories((prevCategories) =>
        prevCategories.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, isChecked: currentCheckedState } : item
          ),
        }))
      );
      setActionError("Impossible de mettre à jour l'ingrédient. Veuillez vérifier votre connexion.");
    }
  };

  // Calculate shopping list completion metrics
  const totalCount = useMemo(() => {
    return categories.reduce((sum, cat) => sum + cat.items.length, 0);
  }, [categories]);



  return (
    <div className="space-y-6">
      {/* 🔔 Notification d'erreur flottante */}
      {actionError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-fade-in print:hidden">
          <div className="bg-red-50 dark:bg-red-955/95 text-red-650 dark:text-red-400 border border-red-200/50 dark:border-red-900/50 p-4 rounded-xl shadow-lg flex items-center justify-between gap-3">
            <span className="text-xs font-bold leading-normal">{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-text-light-muted dark:text-text-dark-muted hover:text-red-600 transition-colors font-extrabold text-xs cursor-pointer px-1.5 py-0.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/40"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* 🗑️ Modale de Confirmation de Suppression */}
      {extraToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden animate-fade-in">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setExtraToDelete(null)}
            className="fixed inset-0 bg-neutral-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity duration-300"
          />
          
          {/* Modal Panel */}
          <div className="relative bg-card-light dark:bg-card-dark rounded-card border border-neutral-200/40 dark:border-neutral-800/40 shadow-2xl p-6 max-w-sm w-full z-10 transition-all transform scale-100 animate-scale-up space-y-4">
            <h3 className="text-base font-extrabold text-text-light-main dark:text-text-dark-main">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-text-light-muted dark:text-text-dark-muted leading-relaxed font-medium">
              Voulez-vous vraiment retirer l&apos;article{' '}
              <span className="font-extrabold text-brand">
                "{extraToDelete.repas?.titre || extraToDelete.ingredient?.nom}"
              </span>{' '}
              de votre liste hors-planning ?
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setExtraToDelete(null)}
                className="px-4 py-2 text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-text-light-main dark:text-text-dark-main rounded-input transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDeleteExtra(extraToDelete.id);
                  setExtraToDelete(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-red-650 hover:bg-red-700 text-white rounded-input transition-all hover:scale-[1.02] cursor-pointer shadow-md shadow-red-600/10"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 En-tête de la page */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-light-main dark:text-text-dark-main">
          Ma liste de courses
        </h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-extrabold transition-all duration-300 bg-brand hover:bg-brand-hover text-white rounded-input hover:scale-[1.02] active:scale-95 shadow-sm shadow-brand/20 cursor-pointer"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span>Ajouter un article / repas</span>
        </button>
      </div>

      {/* 📅 Sélecteur de semaine */}
      {weekInfo && currentWeek && currentYear && (
        <div className="flex items-center justify-between p-3 bg-card-light dark:bg-card-dark rounded-card border border-neutral-200/40 dark:border-neutral-800/40 shadow-xs print:border-none print:shadow-none print:bg-transparent print:p-0">
          <button
            onClick={handlePrevWeek}
            aria-label="Semaine précédente"
            className="p-2.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors border border-neutral-200/30 dark:border-neutral-800/20 text-text-light-main dark:text-text-dark-main cursor-pointer print:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="text-center print:text-left">
            <span className="block text-sm font-extrabold text-text-light-main dark:text-text-dark-main print:text-xl">
              Semaine {currentWeek}
            </span>
            <span className="block text-xs font-medium text-text-light-muted dark:text-text-dark-muted print:text-sm">
              {formatDateRange(weekInfo.start, weekInfo.end)}
            </span>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleCurrentWeek}
              aria-label="Revenir à la semaine actuelle"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all border border-neutral-200/50 dark:border-neutral-800 rounded-input hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-text-light-main dark:text-text-dark-main cursor-pointer active:scale-95 bg-card-light dark:bg-card-dark"
            >
              <CalendarDays className="h-3.5 w-3.5 text-brand shrink-0" />
              <span>Semaine actuelle</span>
            </button>

            <button
              onClick={handleNextWeek}
              aria-label="Semaine suivante"
              className="p-2.5 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors border border-neutral-200/30 dark:border-neutral-800/20 text-text-light-main dark:text-text-dark-main cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* 🔄 État de chargement principal */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 print:hidden">
          <Loader2 className="h-10 w-10 text-brand animate-spin mb-3" />
          <span className="text-sm font-medium text-text-light-muted dark:text-text-dark-muted animate-pulse">
            Calcul de votre liste de courses...
          </span>
        </div>
      ) : error ? (
        /* ⚠️ État d'erreur */
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 p-4 rounded-card text-center text-sm font-medium text-red-600 dark:text-red-400 max-w-lg mx-auto print:hidden">
          {error}
        </div>
      ) : totalCount === 0 ? (
        /* 📭 État vide (aucun ingrédient requis) */
        <div className="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-card bg-card-light/20 dark:bg-card-dark/5 max-w-md mx-auto text-center">
          <div className="p-4 bg-brand-light dark:bg-brand/10 text-brand rounded-full mb-4">
            <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-text-light-main dark:text-text-dark-main">
            Aucun ingrédient requis
          </h3>
          <p className="text-sm text-text-light-muted dark:text-text-dark-muted mt-2 font-medium">
            Votre liste de courses est vide pour cette semaine car vous n&apos;avez planifié aucun repas contenant des ingrédients. Vous pouvez planifier des repas ou ajouter des recettes et articles manuels.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xs justify-center">
            <button
              onClick={() => router.push('/planification')}
              className="px-5 py-2.5 text-sm font-bold bg-brand hover:bg-brand-hover text-white rounded-input hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm shadow-brand/20 cursor-pointer text-center"
            >
              Planifier mes repas
            </button>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-5 py-2.5 text-sm font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-text-light-main dark:text-text-dark-main rounded-input hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer text-center"
            >
              Ajouter manuellement
            </button>
          </div>
        </div>
      ) : (
        /* 🛒 Section Liste de Courses Active */
        <div className="space-y-6">
          {/* 🧾 Section Hors-Planning */}
          {extras.length > 0 && (
            <div className="bg-card-light dark:bg-card-dark p-5 rounded-card border border-neutral-200/40 dark:border-neutral-800/40 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800/50">
                <h2 className="text-sm font-extrabold text-text-light-main dark:text-text-dark-main flex items-center gap-2">
                  <ShoppingBag className="h-4.5 w-4.5 text-brand shrink-0" />
                  <span>Hors-planning ({extras.length})</span>
                </h2>
                <span className="text-[10px] font-bold text-text-light-muted dark:text-text-dark-muted hidden sm:inline">
                  Articles et recettes ajoutés manuellement
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {extras.map((extra) => {
                  if (extra.repas) {
                    return (
                      <div
                        key={extra.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/30 dark:border-neutral-800/20 text-xs font-bold text-text-light-main dark:text-text-dark-main group transition-all duration-300 border-dashed hover:border-red-200/60 hover:bg-red-50/20 dark:hover:bg-red-950/10"
                      >
                        <Utensils className="h-3.5 w-3.5 text-brand/70 shrink-0" />
                        <span className="truncate max-w-[150px]">{extra.repas.titre}</span>
                        <button
                          onClick={() => handleDeleteExtra(extra)}
                          className="p-0.5 rounded-full text-text-light-muted dark:text-text-dark-muted hover:text-brand hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  } else if (extra.ingredient) {
                    const phrase = formatIngredient(
                      extra.ingredient.nom,
                      extra.quantite,
                      extra.unite
                    );
                    return (
                      <div
                        key={extra.id}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/30 dark:border-neutral-800/20 text-xs font-bold text-text-light-main dark:text-text-dark-main group transition-all duration-300 border-dashed hover:border-red-200/60 hover:bg-red-50/20 dark:hover:bg-red-950/10"
                      >
                        <Apple className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate max-w-[180px]">{phrase}</span>
                        <button
                          onClick={() => handleDeleteExtra(extra)}
                          className="p-0.5 rounded-full text-text-light-muted dark:text-text-dark-muted hover:text-brand hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer ml-1"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* 📋 Grille des catégories d'ingrédients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-4">
            {categories.map((group) => {
              const IconComponent = CATEGORY_ICONS[group.categorie] || ShoppingBag;
              
              return (
                <section 
                  key={group.categorie}
                  className="flex flex-col bg-card-light dark:bg-card-dark rounded-card border border-neutral-200/40 dark:border-neutral-800/40 p-5 shadow-xs transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700 print:shadow-none print:border-none print:p-0 print:gap-2"
                >
                  {/* Header de la catégorie */}
                  <div className="flex items-center pb-3.5 mb-4 border-b border-neutral-100 dark:border-neutral-800/50 print:border-neutral-200 print:mb-2 print:pb-1">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand-light dark:bg-brand/10 text-brand flex items-center justify-center shrink-0 print:hidden">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <h2 className="text-base font-extrabold text-text-light-main dark:text-text-dark-main print:text-lg">
                        {group.label}
                      </h2>
                    </div>
                  </div>

                  {/* Liste des ingrédients de la catégorie */}
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li 
                        key={item.id}
                        onClick={() => handleToggleItem(item.id, item.isChecked)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/20 transition-all duration-300 cursor-pointer active:scale-[0.99] select-none print:px-0 print:py-1 print:hover:bg-transparent print:active:scale-100"
                      >
                        {/* Checkbox personnalisé */}
                        <div className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-300 print:border-neutral-400 ${
                          item.isChecked
                            ? 'bg-brand border-brand text-white scale-100 shadow-xs shadow-brand/10'
                            : 'border-neutral-300 dark:border-neutral-700 bg-transparent scale-100'
                        }`}>
                          {item.isChecked && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>

                        {/* Texte de l'ingrédient */}
                        <span className={`text-sm font-semibold transition-all duration-300 tracking-wide leading-relaxed print:text-neutral-805 ${
                          item.isChecked
                            ? 'line-through text-text-light-muted dark:text-text-dark-muted opacity-50'
                            : 'text-text-light-main dark:text-text-dark-main'
                        }`}>
                          {item.phrase}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      )}

      {/* Drawer d'ajout hors-planning */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Ajouter un article ou repas"
        maxWidth="sm:max-w-md"
      >
        <div className="space-y-6">
          {/* Onglets (Fix Gris sur Gris en mode sombre) */}
          <div className="flex bg-neutral-100 dark:bg-neutral-900/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('repas')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                activeTab === 'repas'
                  ? 'bg-white dark:bg-neutral-800 text-brand shadow-xs'
                  : 'text-text-light-muted dark:text-text-dark-muted hover:text-text-light-main dark:hover:text-text-dark-main'
              }`}
            >
              Recette (Repas)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ingredient')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                activeTab === 'ingredient'
                  ? 'bg-white dark:bg-neutral-800 text-brand shadow-xs'
                  : 'text-text-light-muted dark:text-text-dark-muted hover:text-text-light-main dark:hover:text-text-dark-main'
              }`}
            >
              Article individuel
            </button>
          </div>

          {/* Affichage des erreurs du formulaire */}
          {formError && (
            <div className="p-3 text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-xl leading-normal shrink-0">
              {formError}
            </div>
          )}

          <form onSubmit={handleAddExtra} className="space-y-5">
            {activeTab === 'repas' ? (
              /* Onglet Repas */
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-text-light-main dark:text-text-dark-main">
                    Sélectionner un repas
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher parmi mes recettes..."
                    value={searchMealQuery}
                    onChange={(e) => setSearchMealQuery(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm transition-colors border outline-none bg-card-light dark:bg-card-dark border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-brand dark:focus:border-brand text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted"
                  />
                </div>

                {loadingMeals ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 text-brand animate-spin" />
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-neutral-200/20 dark:border-neutral-800/40 rounded-xl p-2 bg-neutral-50/20 dark:bg-neutral-900/10">
                    {filteredMeals.length === 0 ? (
                      <div className="text-center py-6 text-xs text-text-light-muted dark:text-text-dark-muted font-medium">
                        Aucune recette trouvée.
                      </div>
                    ) : (
                      filteredMeals.map((meal) => (
                        <button
                          key={meal.id}
                          type="button"
                          onClick={() => setSelectedRepasId(meal.id.toString())}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                            selectedRepasId === meal.id.toString()
                              ? 'border-brand bg-brand-light dark:bg-brand/10 text-brand'
                              : 'border-neutral-200/50 dark:border-neutral-800/25 hover:bg-neutral-105 dark:hover:bg-neutral-800/40 text-text-light-main dark:text-text-dark-main'
                          }`}
                        >
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200/20">
                            {meal.photoUrl ? (
                              <img src={meal.photoUrl} alt={meal.titre} className="object-cover w-full h-full" />
                            ) : (
                              <Utensils className="h-4 w-4 text-text-light-muted dark:text-text-dark-muted" />
                            )}
                          </div>
                          <span className="text-xs font-bold truncate">{meal.titre}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Onglet Ingrédient - Sélection avec tags et ajout à la volée */
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                {selectedIngredient ? (
                  /* Affichage de l'article sélectionné sous forme de badge horizontal */
                  <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/50 dark:border-neutral-800/40 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm font-bold text-text-light-main dark:text-text-dark-main truncate">
                        {selectedIngredient.nom}
                      </span>
                      <span className="text-[10px] text-brand px-2 py-0.5 bg-brand-light dark:bg-brand/10 border border-brand/15 rounded-full font-bold shrink-0">
                        {CATEGORY_DETAILS[selectedIngredient.categorie as CategorieIngredient]?.label || selectedIngredient.categorie}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIngredient(null);
                        setIngredientNameInput('');
                      }}
                      className="p-1 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 text-text-light-muted dark:text-text-dark-muted hover:text-brand transition-colors cursor-pointer shrink-0"
                      title="Changer d'article"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  /* Champ de recherche pour l'article */
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-extrabold text-text-light-main dark:text-text-dark-main">
                      Rechercher ou ajouter un article
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-light-muted dark:text-text-dark-muted" />
                      <input
                        type="text"
                        placeholder="ex: Yaourts nature, Pain de mie..."
                        value={ingredientNameInput}
                        onChange={(e) => {
                          setIngredientNameInput(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="w-full pl-11 pr-4 py-2.5 text-sm transition-colors border outline-none bg-card-light dark:bg-card-dark border-neutral-200 dark:border-neutral-800 rounded-xl focus:border-brand dark:focus:border-brand text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted h-10 font-bold"
                      />
                      {showSuggestions && ingredientNameInput.trim().length >= 2 && (
                        <ul className="absolute z-10 w-full bg-card-light dark:bg-card-dark border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg mt-1 max-h-40 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/40">
                          {ingredientSuggestions.map((suggestion) => (
                            <li key={suggestion.id}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIngredient({
                                    id: suggestion.id,
                                    nom: suggestion.nom,
                                    categorie: suggestion.categorie
                                  });
                                  setIngredientNameInput(suggestion.nom);
                                  setShowSuggestions(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-extrabold hover:bg-neutral-50 dark:hover:bg-neutral-800 text-text-light-main dark:text-text-dark-main cursor-pointer"
                              >
                                <span>{suggestion.nom}</span>
                                <span className="text-[9px] text-brand px-2 py-0.5 bg-brand-light dark:bg-brand/10 border border-brand/15 rounded-full font-bold">
                                  {CATEGORY_DETAILS[suggestion.categorie as CategorieIngredient]?.label || suggestion.categorie}
                                </span>
                              </button>
                            </li>
                          ))}
                          
                          {/* Option d'ajouter à la volée s'il n'existe pas */}
                          {!ingredientSuggestions.some(s => s.nom.toLowerCase() === ingredientNameInput.trim().toLowerCase()) && (
                            <li>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const name = ingredientNameInput.trim();
                                  setSelectedIngredient({
                                    id: 'new',
                                    nom: name,
                                    categorie: normalizeCategory(name)
                                  });
                                  setIngredientNameInput(name);
                                  setShowSuggestions(false);
                                }}
                                className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 text-text-light-main dark:text-text-dark-main border-t border-neutral-100 dark:border-neutral-800/40 cursor-pointer text-left"
                              >
                                <div className="flex items-center gap-2 text-text-light-main dark:text-text-dark-main">
                                  <Plus className="h-4 w-4 text-brand shrink-0" />
                                  <span>Ajouter <span className="font-extrabold text-brand">"{ingredientNameInput.trim()}"</span></span>
                                </div>
                                <span className="text-[9px] font-extrabold px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-text-light-muted dark:text-text-dark-muted rounded-full uppercase shrink-0">
                                  Nouveau
                                </span>
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* Champ Quantité / Unité en dessous de l'article */}
                {selectedIngredient && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-xs font-extrabold text-text-light-main dark:text-text-dark-main">
                      Quantité / Unité
                    </label>
                    <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-xl bg-card-light dark:bg-card-dark focus-within:border-brand overflow-hidden h-10 w-full transition-all">
                      <input
                        type="number"
                        step="any"
                        placeholder="Quantité (ex: 4)"
                        value={ingredientQuantity}
                        onChange={(e) => setIngredientQuantity(e.target.value)}
                        className="flex-1 min-w-0 px-3 text-xs font-bold border-none bg-transparent outline-none text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted h-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                      <input
                        type="text"
                        placeholder="Unité (ex: pots, tranches, g)"
                        value={ingredientUnite}
                        onChange={(e) => setIngredientUnite(e.target.value)}
                        className="flex-1 min-w-0 px-3 text-xs font-bold border-none bg-transparent outline-none text-text-light-main dark:text-text-dark-main placeholder:text-text-light-muted dark:placeholder:text-text-dark-muted h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={addingExtra}
              className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-input flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:scale-100 cursor-pointer shadow-md shadow-brand/10"
            >
              {addingExtra ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <span>Ajouter à la liste</span>
              )}
            </button>
          </form>
        </div>
      </Drawer>
    </div>
  );
}
