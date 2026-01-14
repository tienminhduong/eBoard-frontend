interface LegendProps {
  color: string;
  label: string;
}

export default function Legend({ color, label }: LegendProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
