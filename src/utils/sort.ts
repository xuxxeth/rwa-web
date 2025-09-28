import i18n from "../i18n";
export function advancedSort(
  a: string | number,
  b: string | number,
  order: "asc" | "desc" = "asc",
  options: {
    numeric?: boolean;
    sensitivity?: "base" | "accent" | "case" | "variant";
  } = {
    numeric: true,
  }
) {
  if (typeof a === "number" && typeof b === "number") {
    return order === "asc" ? a - b : b - a;
  }

  return (
    (order === "asc" ? 1 : -1) *
    String(a).localeCompare(String(b), i18n.language, {
      numeric: options.numeric,
      sensitivity: options.sensitivity || "variant",
    })
  );
}
