import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Função Create Tenant inicializando...'); // Translated

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, password, fullName, blockNumber, apartmentNumber } = await req.json();

    // Validation
    if (!email || !password || !fullName || !blockNumber || !apartmentNumber) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: email, password, fullName, blockNumber, apartmentNumber' }), { // Translated
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // Add more robust validation as needed

    // Admin Client
    const supabaseUrl = Deno.env.get('APP_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('APP_SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Variáveis de ambiente Supabase ausentes.'); // Translated
        throw new Error('Erro de configuração do servidor.'); // Translated
    }
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Tentando criar usuário: ${email}`); // Translated

    // Create Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Erro ao criar usuário de autenticação:', authError); // Translated
      if (authError.message.includes('already registered')) {
         return new Response(JSON.stringify({ error: 'Este email já está cadastrado.' }), { // Already Portuguese
           status: 409,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      throw authError;
    }

    if (!authData || !authData.user) {
        throw new Error('Criação do usuário não retornou os dados esperados.'); // Translated
    }
    const userId = authData.user.id;
    console.log(`Usuário de autenticação criado com sucesso: ${userId}`); // Translated

    // Insert Profile
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: userId,
        role: 'tenant',
        full_name: fullName,
        block_number: blockNumber,
        apartment_number: apartmentNumber,
      });

    if (profileError) {
      console.error('Erro ao inserir perfil:', profileError); // Translated
      // TODO: Consider cleanup logic for auth user if profile insert fails
      throw profileError;
    }
    console.log(`Perfil criado com sucesso para o usuário: ${userId}`); // Translated

    // Success Response
    return new Response(JSON.stringify({ message: 'Inquilino criado com sucesso', userId: userId }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error('Erro na função create-tenant:', error); // Translated
    return new Response(JSON.stringify({ error: error.message || 'Erro Interno do Servidor' }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
