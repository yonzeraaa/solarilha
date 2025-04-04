import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Função Reset Tenant Password inicializando...'); // Translated

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
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes: userId, newPassword' }), { // Translated
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (newPassword.length < 6) {
         return new Response(JSON.stringify({ error: 'Senha deve ter no mínimo 6 caracteres.' }), { // Translated
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

    console.log(`Tentando redefinir senha para usuário: ${userId}`); // Translated

    const { data: updateData, error: updateError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (updateError) {
      console.error(`Erro ao atualizar senha para usuário ${userId}:`, updateError); // Translated
      if (updateError.message.includes('not found')) {
         return new Response(JSON.stringify({ error: 'Usuário não encontrado.' }), { // Already Portuguese
           status: 404,
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         });
      }
      throw updateError;
    }

    console.log(`Senha redefinida com sucesso para usuário: ${userId}. Dados da resposta:`, updateData); // Translated

    return new Response(JSON.stringify({ message: 'Senha redefinida com sucesso' }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função reset-tenant-password:', error); // Translated
    return new Response(JSON.stringify({ error: error.message || 'Erro Interno do Servidor' }), { // Translated
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
