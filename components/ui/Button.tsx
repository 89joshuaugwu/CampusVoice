"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary: "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-sm",
  secondary:
    "bg-white text-[var(--color-primary)] border border-[var(--color-primary)] hover:bg-blue-50",
  danger: "bg-[var(--color-error)] text-white hover:bg-red-700 shadow-sm",
  ghost: "bg-transparent text-[var(--color-text-primary)] hover:bg-slate-100",
};

const sizes = {
  sm: "text-sm px-3 py-2 min-h-[36px]",
  md: "text-sm px-4 py-2.5 min-h-[44px]",
  lg: "text-base px-6 py-3 min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-150",
          "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
