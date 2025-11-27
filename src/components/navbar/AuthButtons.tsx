
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import { AUTH_PATHS } from '@/routes/routePaths';
import { LogIn, UserPlus } from 'lucide-react';

const AuthButtons = () => {
  const { t } = useLanguage();
  
  return (
    <>
      <Link to={AUTH_PATHS.LOGIN}>
        <Button 
          variant="outline" 
          className="border-therapy-purple text-therapy-purple hover:bg-therapy-purple hover:text-white flex items-center gap-1"
          size="sm"
        >
          <LogIn className="h-4 w-4" />
          {t("login")}
        </Button>
      </Link>
      <Link to={AUTH_PATHS.REGISTER}>
        <Button 
          className="bg-therapy-purple hover:bg-therapy-deep-purple text-white flex items-center gap-1"
          size="sm"
        >
          <UserPlus className="h-4 w-4" />
          {t("signUp")}
        </Button>
      </Link>
    </>
  );
};

export default AuthButtons;
