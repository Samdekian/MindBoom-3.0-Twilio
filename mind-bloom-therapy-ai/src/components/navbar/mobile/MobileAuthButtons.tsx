
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useLanguage } from '@/contexts/LanguageContext';
import { AUTH_PATHS } from '@/routes/routePaths';

const MobileAuthButtons = () => {
  const { t } = useLanguage();
  
  return (
    <>
      <Link to={AUTH_PATHS.LOGIN}>
        <Button variant="outline" className="w-full border-therapy-purple text-therapy-purple">
          {t("login")}
        </Button>
      </Link>
      <Link to={AUTH_PATHS.REGISTER}>
        <Button className="w-full bg-therapy-purple text-white">
          {t("signUp")}
        </Button>
      </Link>
    </>
  );
};

export default MobileAuthButtons;
