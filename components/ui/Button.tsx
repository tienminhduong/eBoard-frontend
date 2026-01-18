import { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost";

interface AppButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: Variant;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  icon: Icon,
  variant = "ghost",
  onClick,
  disabled = false,
  className,
}: AppButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition",
        "rounded-full",
        {
          "bg-[#518581] text-white hover:opacity-90":
            variant === "primary",

          "border border-[#518581] text-[#518581] hover:bg-[#518581]/10":
            variant === "outline",

          "border text-gray-500 hover:bg-gray-50":
            variant === "ghost",
        },
        className
      )}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
