import { WORDS, validateCatalog } from "./catalog";

const errors = validateCatalog(WORDS);
if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Catálogo válido: ${WORDS.length} palavras.`);
}
