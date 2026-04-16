import { statColor } from "@/utils/formatting";

type StatBarProps = {
  label: string;
  value: number;
  max?: number;
};

export function StatBar({ label, value, max = 100 }: StatBarProps) {
  const pct = Math.min(100, (value / max) * 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted w-16 uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${statColor(value).replace("text-", "bg-")}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-sm font-semibold w-8 text-right ${statColor(value)}`}>{value}</span>
    </div>
  );
}
