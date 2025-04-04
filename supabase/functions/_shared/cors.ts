// Shared CORS headers for Supabase Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust for production)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Headers allowed in requests
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE', // Methods allowed
};