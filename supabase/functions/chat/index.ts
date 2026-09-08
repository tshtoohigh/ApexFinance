// Supabase Edge Function: /chat
// Proxies AI chat requests to OpenRouter, keeping the API key server-side.
//
// Deploy: supabase functions deploy chat --no-verify-jwt
// Set secret: supabase secrets set OPENROUTER_API_KEY=sk-or-v1-your-key-here
//
// The client sends: { messages: [...], financialContext: string }
// This function adds the system prompt and forwards to OpenRouter.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Free models on OpenRouter, tried in order until one responds.
const MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.1-8b-instruct:free',
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify the user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT with Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the OpenRouter API key from server-side secrets
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured. Ask the admin to set OPENROUTER_API_KEY.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { messages, financialContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid request: messages array required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt with financial context
    const systemPrompt = `You are a helpful personal finance assistant for RS Finance (by RS Corp). Be concise, practical, and actionable. Use plain language, not jargon.

${financialContext || 'No financial data available yet.'}

Give short, actionable answers (2-4 sentences max). If asked about specific actions, give concrete next steps. Never recommend specific stocks or give investment advice that could be considered professional financial advice — frame suggestions as educational. Always remind users this is informational, not financial advice.`;

    // Try each free model in order until one succeeds
    let lastError = '';
    for (const model of MODELS) {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://rsfinance.app',
          'X-Title': 'RS Finance',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-10),
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          // Always return 200 so the client shows the reply cleanly
          return new Response(JSON.stringify({ content }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        lastError = 'Model returned an empty response.';
      } else {
        lastError = await response.text();
      }
      // otherwise loop to the next model
    }

    // All models failed — return 200 with a readable message so the UI shows it
    return new Response(
      JSON.stringify({ content: `The AI service is busy right now. (${lastError.slice(0, 120)}) Please try again in a moment.` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ content: `Something went wrong: ${String(err).slice(0, 120)}` }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
