import { Card } from "./card";
import type { CardProps } from "./card";
import { cn } from "@/lib/utils";

interface MarbleCardProps extends CardProps {
  variant?: "light" | "dark";
}

export function MarbleCard({
  className,
  variant = "light",
  ...props
}: MarbleCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        variant === "light"
          ? "marble-texture text-charcoal"
          : "dark-marble-texture",
        className
      )}
      {...props}
    />
  );
}

// Add a premium variant that uses a gold gradient
export function PremiumCard({ className, ...props }: CardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-charcoal",
        "before:absolute before:inset-0 before:bg-white/20 before:backdrop-blur-sm",
        "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:to-black/10",
        className
      )}
      {...props}
    />
  );
}
