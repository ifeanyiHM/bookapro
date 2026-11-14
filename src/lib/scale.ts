/**
 * Shared type and spacing steps. Each one keeps growing past 1280px (xl1 to xl4) so large screens get larger
 * type and more generous spacing instead of the same size floating in a wider page. The root font size also
 * steps up (see globals.css), so these rem values compound with it.
 */
export const type = {
  display:
    "font-display font-bold tracking-tight text-[2.35rem] leading-[1.04] sm:text-5xl lg:text-[3.4rem] xl1:text-[3.7rem] xl2:text-[3.9rem] xl3:text-[4.2rem] xl4:text-[4.6rem]",
  h1: "font-display font-bold tracking-tight text-[2rem] leading-tight sm:text-4xl lg:text-[2.6rem] xl1:text-[2.9rem] xl3:text-[3.3rem] xl4:text-[3.6rem]",
  h2: "font-display font-bold tracking-tight text-[1.65rem] leading-tight md:text-[2rem] xl1:text-[2.3rem] xl2:text-[2.5rem] xl3:text-[2.8rem] xl4:text-[3.1rem]",
  h3: "font-display font-semibold text-lg leading-snug xl1:text-xl xl3:text-[1.4rem] xl4:text-[1.6rem]",
  lead: "text-pretty text-[1.05rem] leading-relaxed text-ink-soft sm:text-lg xl1:text-xl xl3:text-[1.35rem] xl4:text-2xl",
  body: "text-base leading-relaxed xl1:text-[1.05rem] xl3:text-lg",
  small: "text-sm xl1:text-[0.95rem] xl3:text-base",
  label: "text-sm font-semibold xl1:text-base xl3:text-lg",
} as const;

export const space = {
  section: "py-14 md:py-20 xl1:py-24 xl2:py-28 xl3:py-32 xl4:py-40",
  sectionTight: "py-10 md:py-14 xl1:py-16 xl3:py-20 xl4:py-24",
  stack: "space-y-4 xl1:space-y-5 xl3:space-y-6",
} as const;
