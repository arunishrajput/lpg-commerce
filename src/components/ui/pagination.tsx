interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, pageSize, total, buildHref }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <a
        href={page > 1 ? buildHref(page - 1) : undefined}
        aria-disabled={page <= 1}
        className={`rounded-full border border-line px-3 py-1.5 text-sm ${
          page <= 1 ? "pointer-events-none text-ink-soft/40" : "text-ink hover:border-brand"
        }`}
      >
        Previous
      </a>
      <span className="text-sm text-ink-soft">
        Page {page} of {totalPages}
      </span>
      <a
        href={page < totalPages ? buildHref(page + 1) : undefined}
        aria-disabled={page >= totalPages}
        className={`rounded-full border border-line px-3 py-1.5 text-sm ${
          page >= totalPages ? "pointer-events-none text-ink-soft/40" : "text-ink hover:border-brand"
        }`}
      >
        Next
      </a>
    </nav>
  );
}
