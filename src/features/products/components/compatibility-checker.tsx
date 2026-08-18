"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  searchCompatibilityCandidates,
  checkProductCompatibility,
} from "@/features/products/actions/compatibility";

interface Candidate {
  id: string;
  name: string;
  brand: string | null;
  slug: string;
}

type CompatibilityResult = Awaited<ReturnType<typeof checkProductCompatibility>>;

export function CompatibilityChecker({ productId }: { productId: string }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [pending, startTransition] = useTransition();

  function handleQueryChange(value: string) {
    setQuery(value);
    setSelected(null);
    setResult(null);
    if (value.trim().length < 2) {
      setCandidates([]);
      return;
    }
    startTransition(async () => {
      const found = await searchCompatibilityCandidates(value, productId);
      setCandidates(found);
    });
  }

  function handleSelect(candidate: Candidate) {
    setSelected(candidate);
    setCandidates([]);
    setQuery(candidate.name);
    startTransition(async () => {
      const outcome = await checkProductCompatibility(productId, candidate.id);
      setResult(outcome);
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-medium text-ink">Check compatibility</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Search for another product to see if it's documented as compatible.
      </p>

      <div className="relative mt-3">
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-line bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
        {candidates.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-surface shadow-sm">
            {candidates.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(c)}
                  className="block w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-paper"
                >
                  {c.name}
                  {c.brand ? ` — ${c.brand}` : ""}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pending && <p className="mt-3 text-sm text-ink-soft">Checking…</p>}

      {!pending && result && selected && (
        <div className="mt-4">
          {result.status === "compatible" && (
            <p className="rounded-lg bg-safe/10 px-3 py-2 text-sm text-safe">
              Compatible with{" "}
              <Link href={`/products/${selected.slug}`} className="underline">
                {selected.name}
              </Link>
              {result.note ? ` — ${result.note}` : ""}
            </p>
          )}
          {result.status === "incompatible" && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              Not compatible with{" "}
              <Link href={`/products/${selected.slug}`} className="underline">
                {selected.name}
              </Link>
              {result.note ? ` — ${result.note}` : ""}
            </p>
          )}
          {result.status === "undocumented" && (
            <p className="rounded-lg bg-warn/10 px-3 py-2 text-sm text-warn">
              Compatibility with {selected.name} isn't documented yet. Contact
              support before assuming they work together.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
