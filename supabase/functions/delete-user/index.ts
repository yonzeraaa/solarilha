import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Função Delete User inicializando...'); // Translated

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
    const { userId } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Campo obrigatório ausente: userId' }), { // Translated
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

    console.log(`Tentando excluir usuário: ${userId}`); // Translated

    const { data: deletionData, error: deletionError } = await adminSupabase.auth.admin.deleteUser(
      userId
    );

    if (deletionError) {
      console.error(`Erro ao excluir usuário ${userId}:`, deletionError); // Translated
      if (deletionError.message.includes('not found')) {
         return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), { // Already Portuguese
           status: 404,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      throw deletionError;
    }

    console.log(`Usuário ${userId} excluído com sucesso. Dados da resposta:`, deletionData); // Translated

    return new Response(JSON.stringify({ message: 'Usuário excluído com sucesso' }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função delete-user:', error); // Translated
    return new Response(JSON.stringify({ error: error.message || 'Erro Interno do Servidor' }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
