// types/leo-profanity.d.ts
// added to enable `import leoProfanity from 'leo-profanity';` on lib/syncUser.ts

declare module 'leo-profanity' {
    const leoProfanity: {
      clearList(): void;
      add(words: string | string[]): void;
      remove(words: string | string[]): void;
      list(): string[];
      exists(word: string): boolean;
      loadDictionary(lang: string): void;
      check(input: string): boolean;
      clean(input: string, replaceWith?: string): string;
      loadExtraWords(words: string[]): void;
      loadForbiddenWords(words: string[]): void;
    };
  
    export default leoProfanity;
  }
  