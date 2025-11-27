
import { Heart, Users, MessageSquare, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <MessageSquare className="h-12 w-12 text-therapy-purple" />,
      title: t("aiTherapyChat"),
      description: t("aiTherapyDesc")
    },
    {
      icon: <Users className="h-12 w-12 text-therapy-purple" />,
      title: t("groupTherapy"),
      description: t("groupTherapyDesc")
    },
    {
      icon: <Heart className="h-12 w-12 text-therapy-purple" />,
      title: t("oneOnOne"),
      description: t("oneOnOneDesc")
    },
    {
      icon: <Calendar className="h-12 w-12 text-therapy-purple" />,
      title: t("flexibleScheduling"),
      description: t("flexibleSchedulingDesc")
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("featuresTitle")}</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {t("featuresSubtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="card-hover border border-gray-100">
              <CardHeader className="pb-2">
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
