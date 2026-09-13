import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-plex-mono font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--theme-accent)] text-[var(--theme-bg)] font-bold tracking-[0.2em] uppercase hover:brightness-110 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground font-bold tracking-[0.15em] uppercase hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-[rgba(var(--theme-accent-rgb),0.4)] hover:border-[var(--theme-accent)] text-[var(--theme-text)] hover:bg-[rgba(var(--theme-accent-rgb),0.06)] tracking-[0.15em] uppercase",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 tracking-[0.1em]",
        ghost:
          "text-[var(--theme-text)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.08)] tracking-[0.1em]",
        link: "text-[var(--theme-accent)] underline-offset-4 hover:underline tracking-wider",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-[11px]",
        lg: "h-12 px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
