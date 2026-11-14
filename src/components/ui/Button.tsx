import Link from "next/link";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary: "border border-ink/30 bg-surface text-ink hover:border-ink",
  ghost: "text-brand hover:bg-brand-tint",
  danger: "bg-danger text-white hover:bg-[#8f1c12]",
} as const;

const sizes = {
  sm: "h-10 px-3.5 text-sm xl1:h-11 xl1:text-[0.95rem] xl3:h-12 xl3:px-4 xl3:text-base",
  md: "h-11 px-5 text-[0.95rem] xl1:h-12 xl1:px-6 xl1:text-base xl2:h-13 xl3:h-14 xl3:px-7 xl3:text-lg xl4:h-15",
  lg: "h-12 px-6 text-base xl1:h-14 xl1:px-8 xl1:text-[1.05rem] xl3:h-16 xl3:px-9 xl3:text-xl xl4:h-18 xl4:px-11",
} as const;

type Variant = keyof typeof variants;
type Size = keyof typeof sizes;

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
