import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "btn-site inline-flex items-center justify-center whitespace-nowrap text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 tracking-tight",
    {
        variants: {
            variant: {
                default: "bg-white text-black hover:scale-105 hover:!bg-brand hover:!text-white hover:!border-brand active:scale-95 active:!bg-brand active:!text-white active:!border-brand transition-transform duration-200",
                brand: "bg-brand text-brand-foreground hover:scale-105 hover:!bg-brand hover:!text-white hover:!border-brand active:scale-95 active:!bg-brand active:!text-white active:!border-brand transition-all duration-200 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]",
                outline: "bg-transparent border-white text-white hover:scale-105 hover:!bg-brand hover:!text-white hover:!border-brand active:scale-95 active:!bg-brand active:!text-white active:!border-brand transition-all duration-200",
                ghost: "bg-transparent text-white hover:!bg-brand hover:!text-white hover:!border-brand active:!bg-brand active:!text-white active:!border-brand",
                link: "text-brand underline-offset-4 hover:underline",
            },
            size: {
                default: "h-14 px-8 py-2 rounded-3xl text-lg font-bold border-2 border-transparent",
                sm: "h-10 rounded-2xl px-6 text-sm font-bold border-2 border-transparent",
                lg: "h-16 rounded-3xl px-10 text-xl font-bold border-2 border-transparent",
                icon: "h-12 w-12 rounded-full",
                none: "p-0 h-auto rounded-none border-0",
            },
        },
        defaultVariants: {
            variant: "brand",
            size: "default",
        },
    }
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
