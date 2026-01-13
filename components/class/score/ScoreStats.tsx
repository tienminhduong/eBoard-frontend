import { CheckSquare, Star, AlertCircle } from "lucide-react";
import { ScoreStat } from "@/types/score";

const iconMap = {
  excellent: CheckSquare,
  good: Star,
  average: AlertCircle,
  weak: AlertCircle,
};

const colorMap = {
  excellent: "bg-green-50 text-green-600",
  good: "bg-blue-50 text-blue-600",
  average: "bg-yellow-50 text-yellow-600",
  weak: "bg-red-50 text-red-600",
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
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm"
          >
            <div className={`p-3 rounded-lg ${colorMap[s.type]}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-xl font-semibold">{s.value}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
