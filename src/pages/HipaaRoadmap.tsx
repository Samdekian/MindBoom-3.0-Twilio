
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { 
  Shield, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Lock, 
  Users, 
  ClipboardList, 
  FileCheck, 
  Building, 
  Trash2 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timeline, TimelineItem, TimelineContent, TimelineDot, TimelineSeparator, TimelineConnector } from "@/components/HipaaTimeline";

const HipaaRoadmap = () => {
  const { t, language } = useLanguage();
  
  // Define feature status for each component
  const features = [
    {
      id: "dataEncryption",
      icon: <Lock className="h-6 w-6" />,
      status: "implemented",
      category: "technicalMeasures"
    },
    {
      id: "accessControl",
      icon: <Users className="h-6 w-6" />,
      status: "implemented",
      category: "technicalMeasures"
    },
    {
      id: "auditLogging",
      icon: <ClipboardList className="h-6 w-6" />,
      status: "inProgress",
      category: "technicalMeasures"
    },
    {
      id: "backupRecovery",
      icon: <FileCheck className="h-6 w-6" />,
      status: "planned",
      category: "technicalMeasures"
    },
    {
      id: "securityRiskAssessment",
      icon: <Shield className="h-6 w-6" />,
      status: "inProgress",
      category: "administrativeMeasures"
    },
    {
      id: "trainingProgram",
      icon: <Users className="h-6 w-6" />,
      status: "planned",
      category: "administrativeMeasures"
    },
    {
      id: "policiesProcedures",
      icon: <ClipboardList className="h-6 w-6" />,
      status: "implemented",
      category: "administrativeMeasures"
    },
    {
      id: "businessAssociates",
      icon: <FileCheck className="h-6 w-6" />,
      status: "planned",
      category: "administrativeMeasures"
    },
    {
      id: "facilityAccess",
      icon: <Building className="h-6 w-6" />,
      status: "inProgress",
      category: "physicalMeasures"
    },
    {
      id: "dataDisposal",
      icon: <Trash2 className="h-6 w-6" />,
      status: "planned",
      category: "physicalMeasures"
    },
  ];
  
  // Helper function to get badge for status
  const getStatusBadge = (status) => {
    switch(status) {
      case "implemented":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">{t("implemented")}</Badge>;
      case "inProgress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{t("inProgress")}</Badge>;
      case "planned":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{t("planned")}</Badge>;
      default:
        return null;
    }
  };
  
  // Helper function to filter features by category
  const getFeaturesByCategory = (category) => {
    return features.filter(feature => feature.category === category);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">{t("hipaaRoadmap")}</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {language === "pt-BR" 
                ? "Nossa jornada para garantir que a plataforma MindBloom atenda a todos os requisitos de conformidade HIPAA para proteção de informações de saúde." 
                : "Our journey to ensure the MindBloom platform meets all HIPAA compliance requirements for health information protection."}
            </p>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{t("currentStatus")}</h2>
            
            <Tabs defaultValue="technicalMeasures" className="mb-10">
              <TabsList className="mb-6">
                <TabsTrigger value="technicalMeasures">{t("technicalMeasures")}</TabsTrigger>
                <TabsTrigger value="administrativeMeasures">{t("administrativeMeasures")}</TabsTrigger>
                <TabsTrigger value="physicalMeasures">{t("physicalMeasures")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="technicalMeasures">
                <div className="grid md:grid-cols-2 gap-6">
                  {getFeaturesByCategory("technicalMeasures").map(feature => (
                    <Card key={feature.id}>
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t(feature.id)}</CardTitle>
                          <div className="mt-1">{getStatusBadge(feature.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm text-gray-600">
                          {t(`${feature.id}Desc`)}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="administrativeMeasures">
                <div className="grid md:grid-cols-2 gap-6">
                  {getFeaturesByCategory("administrativeMeasures").map(feature => (
                    <Card key={feature.id}>
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t(feature.id)}</CardTitle>
                          <div className="mt-1">{getStatusBadge(feature.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm text-gray-600">
                          {t(`${feature.id}Desc`)}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="physicalMeasures">
                <div className="grid md:grid-cols-2 gap-6">
                  {getFeaturesByCategory("physicalMeasures").map(feature => (
                    <Card key={feature.id}>
                      <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{t(feature.id)}</CardTitle>
                          <div className="mt-1">{getStatusBadge(feature.status)}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm text-gray-600">
                          {t(`${feature.id}Desc`)}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">{t("implementationPlan")}</h2>
            
            <Timeline>
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot className="bg-blue-500">
                    <Calendar size={20} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <h3 className="text-xl font-medium">{t("phase1")}</h3>
                  <p className="text-gray-600 mt-2">{t("phase1Tasks")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {features.filter(f => f.status === "implemented").slice(0, 3).map(feature => (
                      <Badge key={feature.id} variant="outline" className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {t(feature.id)}
                      </Badge>
                    ))}
                  </div>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot className="bg-purple-500">
                    <Calendar size={20} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <h3 className="text-xl font-medium">{t("phase2")}</h3>
                  <p className="text-gray-600 mt-2">{t("phase2Tasks")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {features.filter(f => f.status === "inProgress").map(feature => (
                      <Badge key={feature.id} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                        <Clock className="h-3.5 w-3.5 mr-1" /> {t(feature.id)}
                      </Badge>
                    ))}
                  </div>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineSeparator>
                  <TimelineDot className="bg-amber-500">
                    <Calendar size={20} />
                  </TimelineDot>
                </TimelineSeparator>
                <TimelineContent>
                  <h3 className="text-xl font-medium">{t("phase3")}</h3>
                  <p className="text-gray-600 mt-2">{t("phase3Tasks")}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {features.filter(f => f.status === "planned").slice(0, 3).map(feature => (
                      <Badge key={feature.id} variant="outline" className="bg-gray-50 text-gray-800 border-gray-200">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> {t(feature.id)}
                      </Badge>
                    ))}
                  </div>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-700 mb-2">{t("contactUs")}</p>
            <Button variant="outline" className="bg-white">
              {t("contactLink")}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HipaaRoadmap;
