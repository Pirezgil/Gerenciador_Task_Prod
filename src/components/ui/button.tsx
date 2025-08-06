import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:text-accent-foreground h-9 rounded-md text-blue-500 border-blue-300 hover:bg-blue-50",
  {
    variants: {
      variant: {
        default: "px-2 sm:px-3",
        destructive:
          "text-red-500 border-red-300 hover:bg-red-50",
        outline: "text-gray-500 border-gray-300 hover:bg-gray-50",
        secondary:
          "text-gray-600 border-gray-300 hover:bg-gray-50",
        ghost: "border-transparent hover:bg-blue-50",
        link: "border-transparent text-blue-500 underline-offset-4 hover:underline hover:bg-transparent",
        success: "text-green-500 border-green-300 hover:bg-green-50",
      },
      size: {
        default: "px-2 sm:px-3",
        sm: "px-2",
        lg: "px-4 sm:px-6",
        icon: "w-9 h-9 p-0",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }