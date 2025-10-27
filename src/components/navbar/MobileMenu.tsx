
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sun, MoonStar } from 'lucide-react';
import NavigationItems from './mobile/NavigationItems';
import MobileLanguageSelector from './mobile/MobileLanguageSelector';
import MobileUserProfile from './mobile/MobileUserProfile';
import MobileAuthButtons from './mobile/MobileAuthButtons';
import { useLanguage } from '@/contexts/LanguageContext';

const MobileMenu = () => {
  const { user } = useAuthRBAC();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <div className="flex flex-col space-y-4 mt-8">
          <NavigationItems />
          <MobileLanguageSelector />
          
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="flex justify-start items-center space-x-2 pl-2"
          >
            {theme === 'dark' ? <Sun size={16} /> : <MoonStar size={16} />}
            <span>{theme === 'dark' ? t("lightMode") : t("darkMode")}</span>
          </Button>
          
          {user ? <MobileUserProfile /> : <MobileAuthButtons />}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
