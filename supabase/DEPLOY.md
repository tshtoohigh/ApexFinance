# Deploying the AI Chat Edge Function

## Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Logged in: `supabase login`
- Linked to your project: `supabase link --project-ref vabbtlufkdvgvcomhbxk`

## Steps

### 1. Set the OpenRouter API key as a secret
```bash
supabase secrets set OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 2. Deploy the function
```bash
supabase functions deploy chat --no-verify-jwt
```

### 3. Test it
The chatbot in the app will now work — it calls this Edge Function which proxies to OpenRouter.

## How it works
- Client sends chat messages + financial context to `/functions/v1/chat`
- Edge Function verifies the user's JWT (must be logged in)
- Edge Function calls OpenRouter with the server-side API key
- Response is returned to the client
- The API key is NEVER exposed to the browser

## Cost
- OpenRouter free tier: Llama 3.1 8B is free (rate-limited)
- Supabase Edge Functions: 500,000 invocations/month free
