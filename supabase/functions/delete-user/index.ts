import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Delete User function initializing...');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Ensure this is a POST request for deletion action
  if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  }

  try {
    // 1. Parse request body to get userId
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing required field: userId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Create Supabase Admin Client
    const supabaseUrl = Deno.env.get('APP_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('APP_SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables.');
      throw new Error('Server configuration error.');
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Attempting to delete user: ${userId}`);

    // 3. Delete the user using Admin privileges
    // This automatically cascades to delete the profile due to FK constraint ON DELETE CASCADE
    const { data: deletionData, error: deletionError } = await adminSupabase.auth.admin.deleteUser(
      userId
    );

    if (deletionError) {
      console.error(`Error deleting user ${userId}:`, deletionError);
      // Handle specific errors, e.g., user not found
      if (deletionError.message.includes('not found')) {
         return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), {
           status: 404, // Not Found
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      throw deletionError; // Re-throw other errors
    }

    console.log(`User ${userId} deleted successfully. Response data:`, deletionData);

    // 4. Return success response
    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // OK
    });

  } catch (error) {
    console.error('Error in delete-user function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
