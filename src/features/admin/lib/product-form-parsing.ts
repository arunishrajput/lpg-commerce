export function parseSpecLines(text: string): { label: string; value: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label.trim(), value: rest.join(":").trim() };
    })
    .filter((s) => s.label && s.value);
}

export function specsToLines(specs: { label: string; value: string }[]): string {
  return specs.map((s) => `${s.label}: ${s.value}`).join("\n");
}

export function parseDocumentLines(text: string): { title: string; url: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split("|");
      return { title: title.trim(), url: rest.join("|").trim() };
    })
    .filter((d) => d.title && d.url);
}

export function documentsToLines(docs: { title: string; url: string }[]): string {
  return docs.map((d) => `${d.title} | ${d.url}`).join("\n");
}

export function parseImageLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
