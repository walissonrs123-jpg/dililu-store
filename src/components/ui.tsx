import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark border-transparent",
  secondary: "bg-paper text-brand border-brand hover:bg-lilac",
} as const;

function actionClass(variant: keyof typeof variants, className = "") {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-6 py-3 text-center text-sm font-semibold transition-colors ${variants[variant]} ${className}`;
}

export function Button({ variant = "primary", className, type = "button", ...props }: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return <button type={type} className={actionClass(variant, className)} {...props} />;
}

export function ActionLink({ variant = "primary", className, ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return <Link className={actionClass(variant, className)} {...props} />;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-full bg-mint px-3 py-1 text-xs font-semibold text-ink">{children}</span>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-card border border-line bg-white p-6 sm:p-8 ${className}`}>{children}</div>;
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="max-w-2xl space-y-3">
    {eyebrow && <p className="text-xs font-bold uppercase tracking-[.18em] text-brand">{eyebrow}</p>}
    <h2 className="font-display text-3xl leading-tight sm:text-4xl">{title}</h2>
    {children && <div className="text-muted">{children}</div>}
  </div>;
}

const fieldClass = "min-h-12 w-full rounded-xl border border-line bg-white px-4 py-3 text-ink placeholder:text-muted focus:border-brand";

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${fieldClass} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${fieldClass} ${className}`} {...props} />;
}
