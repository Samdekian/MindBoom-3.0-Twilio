
import { createContext, useState, useContext, ReactNode } from "react";
import { translations } from "@/i18n/translations";
import { Language, LanguageContextType } from "@/i18n/types";

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("pt-BR"); // Changed default from "en" to "pt-BR"

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Re-export the translations for direct access if needed
export { translations } from "@/i18n/translations";
export type { Language, LanguageContextType } from "@/i18n/types";
