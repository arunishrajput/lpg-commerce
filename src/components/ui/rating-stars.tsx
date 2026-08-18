export function RatingStars({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating * 2) / 2;
  const textSize = size === "md" ? "text-sm" : "text-xs";

  if (rating === 0 && (count === undefined || count === 0)) {
    return <span className={`${textSize} text-ink-soft`}>No reviews yet</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1 ${textSize} text-ink-soft`}>
      <span className="text-warn" aria-hidden>
        {"★".repeat(Math.floor(rounded))}
        {rounded % 1 !== 0 ? "☆" : ""}
      </span>
      <span>
        {rating.toFixed(1)}
        {count !== undefined ? ` (${count})` : ""}
      </span>
    </span>
  );
}
