"use client";

import { List, X } from "@phosphor-icons/react";
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

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="grid size-11 place-items-center rounded-md border border-line-strong bg-surface"
      >
        {open ? (
          <X size={22} aria-hidden="true" />
        ) : (
          <List size={22} aria-hidden="true" />
        )}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full z-30 border-b border-line bg-white px-4 pb-5 pt-2 sm:px-6"
        >
          <ul className="divide-y divide-line">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 text-lg font-medium"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <div onClick={() => setOpen(false)}>{children}</div>
        </nav>
      )}
    </div>
  );
}
