"use client";

type MarketToolbarProps = {
  search: string;
  onSearchChange: (val: string) => void;
  roleFilter: string;
  onRoleChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
};

const ROLES = [
  { id: "all", label: "Tutti i Ruoli" },
  { id: "keeper", label: "Portieri" },
  { id: "defender", label: "Difensori" },
  { id: "midfielder", label: "Centrocampisti" },
  { id: "attacker", label: "Attaccanti" },
];

const SORT_OPTIONS = [
  { id: "rating-desc", label: "Rating (Alto-Basso)" },
  { id: "price-asc", label: "Prezzo (Basso-Alto)" },
  { id: "price-desc", label: "Prezzo (Alto-Basso)" },
  { id: "name-asc", label: "Nome (A-Z)" },
];

export function MarketToolbar({
  search,
  onSearchChange,
  roleFilter,
  onRoleChange,
  sortBy,
  onSortChange,
}: MarketToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 lg:gap-6 bg-surface/50 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
      {/* Search */}
      <div className="relative flex-1 group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted transition-colors group-focus-within:text-accent">
          🔎
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cerca calciatore..."
          className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-accent/40 focus:bg-black/40 transition-all"
        />
      </div>

      {/* Role Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
        <div className="flex items-center gap-1.5 p-1.5 bg-black/20 rounded-2xl border border-white/5">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleChange(role.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                roleFilter === role.id
                  ? "bg-white/10 text-white border border-white/20 shadow-lg"
                  : "text-muted hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="relative min-w-[200px]">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-sm text-muted">↕</span>
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full appearance-none bg-black/20 border border-white/5 rounded-2xl py-3 pl-11 pr-10 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all cursor-pointer hover:bg-black/30"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id} className="bg-surface text-foreground font-sans uppercase font-bold text-xs">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-muted"></div>
        </div>
      </div>
    </div>
  );
}
