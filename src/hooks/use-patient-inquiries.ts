import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";

export interface PatientInquiry {
  id: string;
  subject: string;
  message: string;
  inquiry_type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  response_message: string | null;
  therapist_id: string;
  patient_id: string;
  therapist_name?: string;
}

export interface InquiryResponse {
  id: string;
  content: string;
  created_at: string;
  responder_id: string;
  is_automated: boolean;
  response_type: string;
  responder_name?: string;
}

export const usePatientInquiries = () => {
  const { user } = useAuthRBAC();

  const query = useQuery({
    queryKey: ["patient-inquiries", user?.id],
    queryFn: async (): Promise<PatientInquiry[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("patient_inquiries")
        .select("*")
        .eq("patient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get therapist names separately
      const therapistIds = [...new Set(data?.map(i => i.therapist_id))];
      const { data: therapists } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", therapistIds);

      const therapistMap = new Map(therapists?.map(t => [t.id, t.full_name]) || []);

      return data?.map(inquiry => ({
        ...inquiry,
        therapist_name: therapistMap.get(inquiry.therapist_id) || "Therapist"
      })) || [];
    },
    enabled: !!user?.id,
  });

  return {
    ...query,
    patientInquiries: query.data ?? [],
  };
};

export const useInquiryResponses = (inquiryId: string) => {
  return useQuery({
    queryKey: ["inquiry-responses", inquiryId],
    queryFn: async (): Promise<InquiryResponse[]> => {
      const { data, error } = await supabase
        .from("inquiry_responses")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get responder names separately
      const responderIds = [...new Set(data?.map(r => r.responder_id))];
      const { data: responders } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", responderIds);

      const responderMap = new Map(responders?.map(r => [r.id, r.full_name]) || []);

      return data?.map(response => ({
        ...response,
        responder_name: responderMap.get(response.responder_id) || "Responder"
      })) || [];
    },
    enabled: !!inquiryId,
  });
};

export const useCreateInquiry = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: {
      subject: string;
      message: string;
      inquiry_type: string;
      therapist_id: string;
      priority?: string;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("patient_inquiries")
        .insert({
          ...inquiry,
          patient_id: user.id,
          priority: inquiry.priority || "normal"
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-inquiries"] });
      toast({
        title: "Inquiry sent",
        description: "Your inquiry has been sent to your therapist.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    },
  });
};