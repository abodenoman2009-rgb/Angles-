import type { DictionaryEntry } from "@/types/reader";

/**
 * Provider boundary: replace this implementation with a dictionary/translation
 * provider or a Supabase Edge Function. Keep provider keys on the server,
 * never in the mobile app.
 */
export interface TranslationProvider {
  lookup(word: string, sourceLanguage: string, explanationLanguage: string): Promise<DictionaryEntry>;
}

export class DemoTranslationProvider implements TranslationProvider {
  async lookup(word: string): Promise<DictionaryEntry> {
    // Deliberately labelled demo fallback; it is not a real translation service.
    return {
      translation: `أضف قاموساً لترجمة "${word}"`,
      pronunciation: "",
      example: `Example using "${word}".`,
    };
  }
}

export const translationProvider: TranslationProvider = new DemoTranslationProvider();
