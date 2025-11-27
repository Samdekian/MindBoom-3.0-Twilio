
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const PricingSection = () => {
  const { t, language } = useLanguage();
  
  const plans = [
    {
      name: t("basic"),
      price: t("free"),
      description: t("basicDesc"),
      features: [
        t("aiTherapyLimited"),
        t("weeklyTips"),
        t("basicTracking"),
        t("communityAccess")
      ],
      buttonText: t("startFree"),
      highlight: false,
      path: "/register/patient"
    },
    {
      name: t("premium"),
      price: language === "pt-BR" ? "R$397" : "$67.00",
      period: t("month"),
      description: t("premiumDesc"),
      features: [
        t("aiTherapyUnlimited"),
        t("groupSessionsLimited"),
        t("advancedTracking"),
        t("personalPlan"),
        t("prioritySupport")
      ],
      buttonText: t("subscribeNow"),
      highlight: true,
      path: "/register/patient"
    },
    {
      name: t("complete"),
      price: language === "pt-BR" ? "R$997" : "$197.00",
      period: t("month"),
      description: t("completeDesc"),
      features: [
        t("premiumFeatures"),
        t("oneOnOneSessions"),
        t("groupSessionsExtended"),
        t("therapistMatching"),
        t("resourceLibrary"),
        t("support247")
      ],
      buttonText: t("getStarted"),
      highlight: false,
      path: "/register/patient"
    }
  ];

  return (
    <div className="py-20 bg-therapy-light-purple">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricingTitle")}</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t("pricingSubtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`card-hover ${plan.highlight ? 'border-therapy-purple shadow-lg' : 'border-gray-200'} relative`}
            >
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 -translate-y-1/2 bg-therapy-purple text-white text-xs uppercase tracking-wide font-bold py-1 px-3 rounded-full mx-auto w-max">
                  {t("mostPopular")}
                </div>
              )}
              <CardHeader>
                <CardTitle className={`${plan.highlight ? 'text-therapy-purple' : ''} text-2xl font-bold`}>
                  {plan.name}
                </CardTitle>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 mr-2 mt-0.5">
                        <Check size={16} className={`${plan.highlight ? 'text-therapy-purple' : 'text-gray-600'}`} />
                      </span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to={plan.path} className="w-full">
                  <Button 
                    className={`w-full ${plan.highlight ? 'bg-therapy-purple hover:bg-therapy-deep-purple' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    {plan.buttonText}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
