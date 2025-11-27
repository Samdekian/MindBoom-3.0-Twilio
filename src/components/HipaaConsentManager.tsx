
import React, { useEffect, useState } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { supabase } from "@/integrations/supabase/client";
import HipaaConsentDialog from "./HipaaConsentDialog";

const HipaaConsentManager = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthRBAC();

  useEffect(() => {
    const checkHipaaConsent = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("hipaa_consent")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // If hipaa_consent is null or false, show the dialog
        if (!data.hipaa_consent) {
          setOpen(true);
        }
      } catch (error) {
        console.error("Error checking HIPAA consent:", error);
      } finally {
        setLoading(false);
      }
    };

    checkHipaaConsent();
  }, [user]);

  if (loading || !user) return null;

  return (
    <HipaaConsentDialog
      open={open}
      onOpenChange={setOpen}
      onConsent={() => {
        console.log("User provided HIPAA consent");
      }}
    />
  );
};

export default HipaaConsentManager;
