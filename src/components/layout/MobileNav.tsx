"use client";

import { ArrowUpRight, List, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface NavItem {
  href: string;
  label: string;
}

export function MobileNav({
  items,
  children,
}: {
  items: NavItem[];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Prevent background scrolling while menu is open.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="relative lg:hidden">
      {/* Menu toggle */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className={`relative z-50 grid size-11 place-items-center rounded-xl border transition-all duration-300 ${
          open
            ? "border-brand bg-brand text-white"
            : "border-line-strong bg-surface text-ink hover:border-brand hover:text-brand"
        }`}
      >
        <span
          className={`absolute transition-all duration-300 ${
            open
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          }`}
        >
          <List size={23} weight="bold" aria-hidden="true" />
        </span>

        <span
          className={`absolute transition-all duration-300 ${
            open
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        >
          <X size={23} weight="bold" aria-hidden="true" />
        </span>
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Dropdown */}
      <nav
        ref={menuRef}
        id="mobile-menu"
        aria-label="Main"
        aria-hidden={!open}
        inert={!open}
        className={`absolute right-0 top-[calc(100%+12px)] z-40 w-[min(calc(100vw-2rem),420px)] origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition-all duration-300 ease-out ${
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-3 scale-[0.97] opacity-0"
        }`}
      >
        {/* Dropdown heading */}
        <div className="flex items-center justify-between border-b border-line bg-surface-2 px-5 py-4">
          <div>
            <p className="text-sm font-bold text-ink">Explore BookAPro</p>
            <p className="mt-0.5 text-xs text-muted">
              Find the right service for your home
            </p>
          </div>

          <span className="rounded-full bg-brand-tint px-3 py-1 text-xs font-semibold text-brand-dark">
            Menu
          </span>
        </div>

        {/* Navigation links */}
        <ul className="divide-y divide-line px-3 py-2">
          {items.map((item, index) => (
            <li
              key={item.href}
              className={`mobile-nav-item transition-all duration-300 ${
                open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
              style={{
                transitionDelay: open ? `${index * 55}ms` : "0ms",
              }}
            >
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="group flex items-center justify-between gap-4 rounded-xl px-3 py-4 text-base font-semibold text-ink transition-colors duration-200 hover:bg-brand-tint hover:text-brand-dark"
                tabIndex={open ? 0 : -1}
              >
                {item.label}

                <span className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-all duration-200 group-hover:bg-brand group-hover:text-white">
                  <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Existing auth / action links */}
        {children && (
          <div
            className={`border-t border-line bg-surface-2 p-4 transition-all duration-300 ${
              open
                ? "translate-y-0 opacity-100 delay-150"
                : "translate-y-2 opacity-0"
            }`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a, button")) {
                setOpen(false);
              }
            }}
          >
            {children}
          </div>
        )}
      </nav>
    </div>
  );
}
