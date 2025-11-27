
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { t } = useLanguage();
  
  const testimonials = [{
    quote: t("testimonial1"),
    name: "Maria S.",
    role: "Student",
    avatar: "MS"
  }, {
    quote: t("testimonial2"),
    name: "Dr. James Wilson",
    role: "Clinical Psychologist",
    avatar: "JW"
  }, {
    quote: t("testimonial3"),
    name: "Alex T.",
    role: "Marketing Professional",
    avatar: "AT"
  }];
  return <div className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("testimonialTitle")}</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">{t("testimonialSubtitle")}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => <Card key={index} className="card-hover">
              <CardContent className="p-6">
                <div className="mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="36" fill="none" className="text-therapy-purple/20">
                    <path fill="currentColor" d="M13.304 0C6.042 0 0 6.042 0 13.304c0 7.262 6.042 13.304 13.304 13.304 2.05 0 3.99-.477 5.716-1.318C16.647 32.118 8.684 36 0 36V30.87c5.177 0 9.783-2.408 12.771-6.164C5.15 23.368 0 18.048 0 13.304 0 8.57 5.15 4.57 13.304 4.57V0Zm31.696 0c-7.262 0-13.304 6.042-13.304 13.304 0 7.262 6.042 13.304 13.304 13.304 2.05 0 3.99-.477 5.716-1.318C48.343 32.118 40.38 36 31.696 36V30.87c5.177 0 9.783-2.408 12.771-6.164C36.846 23.368 31.696 18.048 31.696 13.304c0-4.734 5.15-8.734 13.304-8.734V0Z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 border border-therapy-purple/20">
                    <AvatarFallback className="bg-therapy-purple/10 text-therapy-purple">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>;
};
export default Testimonials;
