export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="flex items-center justify-center h-16 w-16 overflow-hidden rounded-card bg-brand-light dark:bg-brand/10 shadow-sm mb-6 animate-pulse border border-neutral-200/50 dark:border-neutral-800/40">
        <img src="/100.png" alt="Logo" className="h-full w-full object-cover" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-text-light-main dark:text-text-dark-main">
        Bienvenue sur ManageMenu
      </h1>
      <p className="text-sm text-text-light-muted dark:text-text-dark-muted mt-2 max-w-sm font-medium">
        Sélectionnez un onglet ci-dessous ou dans la barre latérale pour commencer à organiser vos repas.
      </p>
    </div>
  );
}
