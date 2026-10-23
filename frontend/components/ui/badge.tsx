import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

// Pastilles « douces » (fond teinté + texte foncé), lisibles en clair comme en sombre.
function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "border-transparent bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
    secondary: "border-transparent bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300",
    destructive: "border-transparent bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    outline: "border-gray-300 text-gray-700 dark:border-white/15 dark:text-gray-300",
    success: "border-transparent bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    warning: "border-transparent bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        variantClasses[variant],
        className
      )} 
      {...props} 
    />
  )
}

export { Badge }
