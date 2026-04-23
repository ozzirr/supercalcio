"use client";

type MarketTabsProps = {
  activeTab: "available" | "owned";
  onChange: (tab: "available" | "owned") => void;
  availableCount: number;
  ownedCount: number;
};

export function MarketTabs({ activeTab, onChange, availableCount, ownedCount }: MarketTabsProps) {
  return (
    <div className="flex justify-center lg:justify-start">
      <div className="inline-flex p-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
        <button
          onClick={() => onChange("available")}
          className={`relative px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
            activeTab === "available"
              ? "bg-accent text-black shadow-lg"
              : "text-muted hover:text-white hover:bg-white/5"
          }`}
        >
          Disponibili
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "available" ? "bg-black/20 text-black" : "bg-white/10 text-muted"
          }`}>
            {availableCount}
          </span>
        </button>
        <button
          onClick={() => onChange("owned")}
          className={`relative px-6 lg:px-8 py-2.5 lg:py-3 rounded-xl text-xs lg:text-sm font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
            activeTab === "owned"
              ? "bg-accent text-black shadow-lg"
              : "text-muted hover:text-white hover:bg-white/5"
          }`}
        >
          In Rosa
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "owned" ? "bg-black/20 text-black" : "bg-white/10 text-muted"
          }`}>
            {ownedCount}
          </span>
        </button>
      </div>
    </div>
  );
}
