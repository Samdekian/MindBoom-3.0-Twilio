
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const MobileLanguageSelector = () => {
  const { language } = useLanguage();
  
  return (
    <div className="flex space-x-4 items-center">
      <LanguageSwitcher />
      <span className="text-sm">{language === "en" ? "English" : "Português"}</span>
    </div>
  );
};

export default MobileLanguageSelector;
