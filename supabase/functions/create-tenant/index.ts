import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts'; // Assuming shared CORS headers

console.log('Create Tenant function initializing...');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { email, password, fullName, blockNumber, apartmentNumber } = await req.json(); // Add apartmentNumber

    // 2. Basic Input Validation
    // Add apartmentNumber to validation
    if (!email || !password || !fullName || !blockNumber || !apartmentNumber) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, password, fullName, blockNumber, apartmentNumber' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Add more robust validation as needed (e.g., email format, password strength)

    // 3. Create Supabase Admin Client
    // Ensure APP_SUPABASE_URL and APP_SUPABASE_SERVICE_ROLE_KEY are set as env vars (secrets)
    const supabaseUrl = Deno.env.get('APP_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('APP_SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Missing APP_SUPABASE_URL or APP_SUPABASE_SERVICE_ROLE_KEY environment variables.');
        throw new Error('Server configuration error.');
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Attempting to create user: ${email}`);

    // 4. Create user in auth.users
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email for simplicity, adjust if needed
      // user_metadata: { full_name: fullName } // Can store some metadata here too
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      // Handle specific errors like 'User already registered'
      if (authError.message.includes('already registered')) {
         return new Response(JSON.stringify({ error: 'Este email já está cadastrado.' }), {
           status: 409, // Conflict
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      throw authError; // Re-throw other auth errors
    }

    if (!authData || !authData.user) {
        throw new Error('User creation did not return expected data.');
    }

    const userId = authData.user.id;
    console.log(`Auth user created successfully: ${userId}`);

    // 5. Insert user profile into profiles table
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'tenant',
        full_name: fullName,
        block_number: blockNumber,
        apartment_number: apartmentNumber, // Insert the new field
      });

    if (profileError) {
      console.error('Error inserting profile:', profileError);
      // Attempt to clean up the auth user if profile insertion fails? (Complex)
      // For now, log the error and return failure.
      throw profileError;
    }

    console.log(`Profile created successfully for user: ${userId}`);

    // 6. Return success response
    return new Response(JSON.stringify({ message: 'Tenant created successfully', userId: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201, // Created
    });

  } catch (error) {
    console.error('Error in create-tenant function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Note: You might need to create the `supabase/functions/_shared/cors.ts` file
// Example `cors.ts`:
/*
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or specific origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
*/
