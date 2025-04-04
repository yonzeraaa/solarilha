import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Função Get Users By IDs inicializando...'); // Translated

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), { // Translated
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
  }

  try {
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: 'Campo obrigatório ausente ou inválido: userIds (deve ser um array não vazio)' }), { // Translated
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('APP_SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('APP_SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Variáveis de ambiente Supabase ausentes.'); // Translated
      throw new Error('Erro de configuração do servidor.'); // Translated
    }
    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`Tentando buscar usuários para IDs: ${userIds.join(', ')}`); // Translated

    const { data: { users }, error: listError } = await adminSupabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
    });

    if (listError) {
      console.error('Erro ao listar usuários:', listError); // Translated
      throw listError;
    }

    const filteredUsers = users.filter(user => userIds.includes(user.id));

    const usersInfo = filteredUsers.map(user => ({
        id: user.id,
        email: user.email
    }));

    console.log(`Informações encontradas para ${usersInfo.length} usuários.`); // Translated

    return new Response(JSON.stringify({ users: usersInfo }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função get-users-by-ids:', error); // Translated
    return new Response(JSON.stringify({ error: error.message || 'Erro Interno do Servidor' }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
