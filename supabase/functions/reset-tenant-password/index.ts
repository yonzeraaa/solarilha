import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Reset Tenant Password function initializing...');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Ensure this is a POST request
  if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  }

  try {
    // 1. Parse request body to get userId and newPassword
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ error: 'Missing required fields: userId, newPassword' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Add basic password strength validation if desired
    if (newPassword.length < 6) {
         return new Response(JSON.stringify({ error: 'Password must be at least 6 characters long' }), {
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

    console.log(`Attempting to reset password for user: ${userId}`);

    // 3. Update the user's password using Admin privileges
    const { data: updateData, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error(`Error updating password for user ${userId}:`, updateError);
      // Handle specific errors, e.g., user not found
      if (updateError.message.includes('not found')) {
         return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), {
           status: 404, // Not Found
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      throw updateError; // Re-throw other errors
    }

    console.log(`Password reset successfully for user: ${userId}. Response data:`, updateData);

    // 4. Return success response
    return new Response(JSON.stringify({ message: 'Password reset successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // OK
    });

  } catch (error) {
    console.error('Error in reset-tenant-password function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
