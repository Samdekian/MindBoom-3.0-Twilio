
import { useLanguage } from '@/contexts/LanguageContext';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from 'lucide-react';

interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton = ({ onLogout }: LogoutButtonProps) => {
  const { t } = useLanguage();
  
  return (
    <DropdownMenuItem 
      onClick={onLogout} 
      className="cursor-pointer text-red-500 focus:text-red-500"
    >
      <LogOut className="mr-2 h-4 w-4" />
      <span>{t("logout")}</span>
    </DropdownMenuItem>
  );
};

export default LogoutButton;
