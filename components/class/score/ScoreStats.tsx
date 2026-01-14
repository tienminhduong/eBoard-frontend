// ScoreStats.tsx
import { CheckSquare, Star, AlertCircle } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { ScoreStat } from "@/types/score";

const iconMap = {
  excellent: CheckSquare,
  good: Star,
  average: AlertCircle,
  weak: AlertCircle,
};

const accentColorMap = {
  excellent: "#22C55E", // green-500
  good: "#3B82F6",      // blue-500
  average: "#EAB308",   // yellow-500
  weak: "#EF4444",      // red-500
};

interface Props {
  stats: ScoreStat[];
}

export default function ScoreStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => {
        const Icon = iconMap[s.type];

        return (
          <StatCard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={Icon}
            accentColor={accentColorMap[s.type]}
          />
        );
      })}
    </div>
  );
}
