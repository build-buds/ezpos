export const generateSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "menu";
  const random = Math.random().toString(36).slice(2, 6);
  return `${base}-${random}`;
};
