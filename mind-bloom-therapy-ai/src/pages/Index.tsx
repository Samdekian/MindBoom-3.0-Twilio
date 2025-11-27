
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import PricingSection from "@/components/PricingSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoleBasedDashboard } from "@/utils/routing/unified-route-config";
import { EnhancedLoadingState } from "@/components/ui/enhanced-loading-state";

const Index = () => {
  // Show landing page only - no redirection logic here
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <Features />
        <PricingSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </>
  );
};

export default Index;
