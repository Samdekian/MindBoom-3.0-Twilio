
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <div className="relative bg-therapy-light-purple py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 space-y-6 mb-12 md:mb-0 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
              <Link to="/chat">
                <Button className="w-full sm:w-auto bg-therapy-purple hover:bg-therapy-deep-purple text-white text-lg py-6 px-8">
                  {t("tryAiNow")}
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" className="w-full sm:w-auto border-therapy-purple text-therapy-purple hover:bg-therapy-purple hover:text-white text-lg py-6 px-8">
                  {t("seePlans")}
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 transform rotate-3 absolute top-4 right-4">
              <div className="flex items-start mb-4">
                <div className="bg-therapy-purple rounded-full w-10 h-10 flex items-center justify-center text-white">
                  AI
                </div>
                <div className="bg-gray-100 rounded-2xl p-4 ml-4">
                  <p>{t("aiGreeting")}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100 transform -rotate-2 relative z-10">
              <div className="flex items-start mb-4">
                <div className="bg-therapy-blue rounded-2xl p-4 mr-4">
                  <p>{t("userMessage")}</p>
                </div>
                <div className="bg-therapy-purple rounded-full w-10 h-10 flex items-center justify-center text-white">
                  U
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-therapy-purple rounded-full w-10 h-10 flex items-center justify-center text-white">
                  AI
                </div>
                <div className="bg-gray-100 rounded-2xl p-4 ml-4">
                  <p>{t("aiResponse")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
