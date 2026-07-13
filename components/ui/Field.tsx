"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-3.5 py-2.5 text-[15px] " +
  "text-[var(--color-text-primary)] placeholder:text-slate-400 transition-shadow duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] " +
  "min-h-[44px] disabled:bg-slate-50 disabled:text-slate-400";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldWrapperProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, required, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
            {label} {required && <span className="text-[var(--color-error)]">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(fieldBase, error && "border-[var(--color-error)] focus:ring-red-200", className)}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{hint}</p>}
        {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldWrapperProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, required, id, rows = 5, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
            {label} {required && <span className="text-[var(--color-error)]">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={cn(fieldBase, "resize-y leading-relaxed", error && "border-[var(--color-error)] focus:ring-red-200", className)}
          {...props}
        />
        {hint && !error && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{hint}</p>}
        {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldWrapperProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, required, id, children, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
            {label} {required && <span className="text-[var(--color-error)]">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(fieldBase, "appearance-none bg-no-repeat", error && "border-[var(--color-error)] focus:ring-red-200", className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundPosition: "right 0.75rem center",
            paddingRight: "2.5rem",
          }}
          {...props}
        >
          {children}
        </select>
        {hint && !error && <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{hint}</p>}
        {error && <p className="mt-1 text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
