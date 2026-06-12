import type {MultiLangString} from "../types.ts";

export const getLabel = (field: MultiLangString, lang: string = "de"): string => {
  const preferred = field[lang]?.trim();
  if (preferred) return preferred;

  const en = field["en"]?.trim();
  if (en) return en;

  const firstNonEmpty = Object.values(field).find(
    (value) => typeof value === "string" && value.trim() !== ""
  );

  return firstNonEmpty ?? "";
};