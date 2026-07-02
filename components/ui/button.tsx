import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[86px] text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[hsla(0,0%,100%,0.815)] text-[#18191a] hover:bg-white hover:opacity-[0.85] shadow-[rgba(255,255,255,0.1)_0px_1px_0px_0px_inset]",
        outline:
          "bg-transparent border border-white/10 text-[#f9f9f9] hover:opacity-60",
        secondary:
          "bg-[#101111] text-[#cecece] border border-white/[0.06] hover:opacity-60",
        ghost:
          "text-[#6a6b6c] hover:text-[#f9f9f9] hover:opacity-60",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3.5 text-[13px]",
        lg: "h-12 px-8 text-[15px]",
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