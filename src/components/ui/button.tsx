import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 hover:-translate-y-0.5 hover:shadow-soft",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "border border-border bg-transparent hover:bg-surface hover:text-text-primary",
        secondary: "bg-surface text-text-primary border border-border hover:bg-primary-50",
        ghost: "hover:bg-primary-50 hover:text-primary-500",
        link: "text-primary-500 underline-offset-4 hover:underline",
        // ✅ CORREÇÃO: Variantes de energia como valores individuais
        "energia-baixa": "bg-energia-baixa text-white hover:shadow-energia-baixa hover:-translate-y-0.5",
        "energia-normal": "bg-energia-normal text-white hover:shadow-energia-normal hover:-translate-y-0.5", 
        "energia-alta": "bg-energia-alta text-white hover:shadow-energia-alta hover:-translate-y-0.5",
        // Variantes Sentinela adicionais
        "sentinela-primary": "sentinela-btn sentinela-btn-primary",
        "sentinela-secondary": "sentinela-btn sentinela-btn-secondary",
        "sentinela-soft": "sentinela-btn sentinela-btn-soft"
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-xl px-4",
        lg: "h-12 rounded-2xl px-8",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  energyLevel?: 'baixa' | 'normal' | 'alta' // Helper prop para energia
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, energyLevel, asChild = false, ...props }, ref) => {
    // Auto-selecionar variante baseada no energyLevel
    const finalVariant = energyLevel ? `energia-${energyLevel}` as any : variant;
    
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant: finalVariant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }