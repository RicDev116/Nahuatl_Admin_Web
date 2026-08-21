import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GrammarValidatorService {
  // Las 18 grafías oficiales de la Huasteca Hidalguense
  private readonly validGraphemes = ['a', 'e', 'i', 'o', 'u', 'ch', 'k', 'm', 'n', 'p', 's', 't', 'tl', 'ts', 'x', 'y', "'"];
  private readonly invalidCharsRegex = /[^aeiouchkmwptslxy'\s\-\.,¿\?¡!]/i;

  /**
   * Valida si un texto en Náhuatl cumple estrictamente con el alfabeto de 18 grafías.
   * Retorna un objeto con el estado y los caracteres/grafías no permitidos encontrados.
   */
  validateNahuatlText(text: string): { isValid: boolean; invalidTokens: string[] } {
    if (!text || text.trim() === '') {
      return { isValid: true, invalidTokens: [] };
    }

    const cleanText = text.toLowerCase();
    const invalidTokens: string[] = [];

    // Detectar caracteres latinos no pertenecientes al estándar (ej. b, c (sin h), d, f, g, j, q, r, v, z)
    const matches = cleanText.match(/[bcdfgjrqvzwñ]/g);
    if (matches) {
      matches.forEach(token => {
        if (!invalidTokens.includes(token)) {
          invalidTokens.push(token);
        }
      });
    }

    return {
      isValid: invalidTokens.length === 0,
      invalidTokens
    };
  }

  /**
   * Genera las fichas sugeridas para el modo SENTENCE_BUILDER a partir de una oración.
   */
  generateSentenceTokens(sentence: string): string[] {
    if (!sentence) return [];
    return sentence
      .replace(/[¿?¡!,\.]/g, '')
      .split(/\s+/)
      .filter(w => w.trim().length > 0);
  }
}
