import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "dots" | "pulse"
}

export function LoadingSpinner({ className, size = "md", variant = "default" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  }

  if (variant === "dots") {
    const dotSizes = {
      sm: "w-1 h-1",
      md: "w-2 h-2",
      lg: "w-3 h-3",
    }

    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className={cn("bg-primary rounded-full animate-bounce", dotSizes[size])} />
        <div className={cn("bg-primary rounded-full animate-bounce delay-100", dotSizes[size])} />
        <div className={cn("bg-primary rounded-full animate-bounce delay-200", dotSizes[size])} />
      </div>
    )
  }

  if (variant === "pulse") {
    return <div className={cn("bg-primary rounded-full animate-pulse", sizeClasses[size], className)} />
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary transition-all duration-300 hover:border-t-primary/80",
        sizeClasses[size],
        className,
      )}
    />
  )
}
