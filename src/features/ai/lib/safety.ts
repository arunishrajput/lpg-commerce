/**
 * Gas-safety signals that must never be answered by free-form generation —
 * matched here and routed to a fixed, conservative response instead,
 * regardless of which AI provider (or mock) is active. This is deliberately
 * a blunt keyword match: a false positive just shows the safety response
 * to someone browsing normally, which costs nothing; a false negative could
 * mean improvised advice on an active gas leak.
 */
const SAFETY_KEYWORDS = [
  "gas smell",
  "smell gas",
  "smell of gas",
  "leak",
  "leaking",
  "hissing",
  "fire",
  "burning smell",
  "explosion",
  "explode",
  "spark",
  "cylinder fell",
  "cylinder is hot",
  "flame won't go out",
  "flame wont go out",
  "can't turn off",
  "cant turn off",
];

export function isSafetyCritical(message: string): boolean {
  const lower = message.toLowerCase();
  return SAFETY_KEYWORDS.some((kw) => lower.includes(kw));
}

export const SAFETY_ESCALATION_RESPONSE = `If you smell gas, hear hissing, or suspect a leak:

1. Don't operate any switches, lighters, or flames.
2. Turn off the gas supply at the cylinder if you can safely reach it.
3. Open doors and windows to ventilate the area.
4. Leave the area and call your gas supplier's emergency helpline or local emergency services from outside.

Stop using any equipment that's damaged, leaking, or behaving unexpectedly until a qualified technician has checked it. This is general safety guidance, not a substitute for professional inspection — please don't try to diagnose or repair a suspected leak yourself.`;
