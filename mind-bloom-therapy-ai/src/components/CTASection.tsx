
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();
  
  return (
    <div className="py-20 bg-gradient-to-r from-therapy-purple to-therapy-deep-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t("ctaTitle")}
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
          {t("ctaSubtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/register">
            <Button className="bg-white text-therapy-deep-purple hover:bg-gray-100 text-lg py-6 px-8 w-full sm:w-auto">
              {t("signUpFree")}
            </Button>
          </Link>
          <Link to="/ai-chat">
            <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg py-6 px-8 w-full sm:w-auto">
              {t("tryAiTherapy")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
