"use client";

import { useState, useTransition } from "react";
import {
  addCompatibilityAction,
  removeCompatibilityAction,
  searchProductsForAdmin,
} from "@/features/admin/actions/compatibility";

interface CompatEntry {
  compatibleId: string;
  name: string;
  note: string | null;
}

interface Candidate {
  id: string;
  name: string;
  sku: string;
}

export function CompatibilityManager({
  productId,
  initial,
}: {
  productId: string;
  initial: CompatEntry[];
}) {
  const [entries, setEntries] = useState(initial);
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setCandidates([]);
      return;
    }
    startTransition(async () => {
      setCandidates(await searchProductsForAdmin(value, productId));
    });
  }

  function handleAdd(candidate: Candidate) {
    startTransition(async () => {
      await addCompatibilityAction(productId, candidate.id, note);
      setEntries((prev) => [...prev, { compatibleId: candidate.id, name: candidate.name, note: note || null }]);
      setQuery("");
      setCandidates([]);
      setNote("");
    });
  }

  function handleRemove(compatibleId: string) {
    startTransition(async () => {
      await removeCompatibilityAction(productId, compatibleId);
      setEntries((prev) => prev.filter((e) => e.compatibleId !== compatibleId));
    });
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h3 className="text-sm font-medium text-ink">Compatible products</h3>

      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-ink-soft">No compatibility documented yet.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {entries.map((e) => (
            <li key={e.compatibleId} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {e.name}
                {e.note ? <span className="text-ink-soft"> — {e.note}</span> : null}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleRemove(e.compatibleId)}
                className="text-xs text-danger hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-2">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search products to link…"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
          />
          {candidates.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-line bg-surface shadow-sm">
              {candidates.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => handleAdd(c)}
                    className="block w-full px-3 py-2 text-left text-sm text-ink hover:bg-paper"
                  >
                    {c.name} <span className="text-xs text-ink-soft">({c.sku})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note (e.g. fitting size)"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:border-brand focus:outline-none"
        />
      </div>
    </div>
  );
}
