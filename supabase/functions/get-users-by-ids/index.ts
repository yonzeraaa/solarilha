import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Get Users By IDs function initializing...');

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
    // 1. Parse request body to get userIds array
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing or invalid required field: userIds (must be a non-empty array)' }), {
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

    console.log(`Attempting to fetch users for IDs: ${userIds.join(', ')}`);

    // 3. Fetch users using Admin privileges
    // Note: listUsers() fetches all users, then we filter. For large numbers of users,
    // querying auth.users directly via SQL might be better if possible, but requires care.
    // listUsers is generally safer for admin operations.
    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000 // Adjust if you expect more users than this
    });

    if (listError) {
      console.error('Error listing users:', listError);
      throw listError;
    }

    // 4. Filter the results to include only the requested IDs
    const filteredUsers = users.filter(user => userIds.includes(user.id));

    // 5. Extract only necessary info (id, email) to send back
    const usersInfo = filteredUsers.map(user => ({
        id: user.id,
        email: user.email
    }));

    console.log(`Found info for ${usersInfo.length} users.`);

    // 6. Return success response
    return new Response(JSON.stringify({ users: usersInfo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // OK
    });

  } catch (error) {
    console.error('Error in get-users-by-ids function:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
