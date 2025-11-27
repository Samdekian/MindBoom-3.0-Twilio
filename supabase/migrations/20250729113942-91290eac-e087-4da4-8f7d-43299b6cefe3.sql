-- Fix health_checks table schema to match get_system_health_status function expectations
ALTER TABLE public.health_checks 
ADD COLUMN IF NOT EXISTS database_connected boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS webrtc_available boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS timestamp timestamp with time zone DEFAULT now();

-- Update the get_system_health_status function to work with actual table schema
CREATE OR REPLACE FUNCTION public.get_system_health_status()
RETURNS TABLE(
  status text, 
  database_connected boolean, 
  webrtc_available boolean, 
  agora_sdk_loaded boolean, 
  agora_credentials_configured boolean, 
  last_check timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN h.database_connected AND h.webrtc_available AND h.agora_sdk_loaded AND h.agora_credentials_configured THEN 'healthy'
      WHEN h.database_connected AND h.webrtc_available THEN 'degraded'
      ELSE 'unhealthy'
    END as status,
    h.database_connected,
    h.webrtc_available,
    h.agora_sdk_loaded,
    h.agora_credentials_configured,
    h.created_at as last_check
  FROM public.health_checks h
  ORDER BY h.created_at DESC
  LIMIT 1;
END;
$function$;