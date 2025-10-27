
export type Language = "en" | "pt-BR";

export type Translations = {
  [key: string]: {
    [key in Language]: string;
  };
};

export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};
