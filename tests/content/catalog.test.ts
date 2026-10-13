import { describe, expect, it } from "vitest";
import { WORDS, validateCatalog } from "../../src/content/catalog";

describe("word catalog", () => {
  it("contains valid Portuguese and English entries", () => {
    expect(validateCatalog(WORDS)).toEqual([]);
    expect(WORDS.some((word) => word.language === "pt-BR")).toBe(true);
    expect(WORDS.some((word) => word.language === "en")).toBe(true);
  });
});
