"use client";

import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold">Something went wrong</h1>
        <p className="mb-6 mt-3 text-lg text-ink-soft">
          Please try again. If it keeps happening, tell our team what you were doing when it happened.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
