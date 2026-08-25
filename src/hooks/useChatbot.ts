import { useState, useCallback } from 'react';
import { useFinanceStore } from '@/stores/useFinanceStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Chat hook that calls OpenRouter API for AI financial advice.
 * User must set their own API key in settings.
 */
export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Apex Finance assistant. I can help you make financial decisions, analyze your portfolio, suggest savings strategies, or answer money questions. What can I help with?",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const apiKey = useFinanceStore((s) => s.openRouterApiKey);
  const accounts = useFinanceStore((s) => s.accounts);
  const monthlyIncome = useFinanceStore((s) => s.monthlyIncome);
  const monthlyBudget = useFinanceStore((s) => s.monthlyBudget);
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const goals = useFinanceStore((s) => s.goals);
  const cryptoHoldings = useFinanceStore((s) => s.cryptoHoldings);

  // Build context about user's finances for the AI
  const buildSystemPrompt = () => {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalSubs = subscriptions.reduce((sum, s) => sum + s.amount, 0);

    return `You are a helpful personal finance assistant for the Apex Finance app. Be concise, practical, and actionable. Use plain language, not jargon.

The user's financial snapshot:
- Total account balances: $${totalBalance.toLocaleString()}
- Monthly income: $${monthlyIncome.toLocaleString()}
- Monthly budget: $${monthlyBudget.toLocaleString()}
- Monthly subscriptions: $${totalSubs.toFixed(2)}
- Accounts: ${accounts.map(a => `${a.name} (${a.type}): $${a.balance.toLocaleString()}`).join(', ') || 'None added yet'}
- Crypto holdings: ${cryptoHoldings.map(h => `${h.amount} ${h.symbol}`).join(', ') || 'None'}
- Goals: ${goals.map(g => `${g.name}: $${g.current.toLocaleString()}/$${g.target.toLocaleString()}`).join(', ') || 'None set'}

Give short, actionable answers (2-4 sentences max). If asked about specific actions, give concrete next steps. Never recommend specific stocks or give investment advice that could be considered professional financial advice — frame suggestions as educational.`;
  };

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      if (!apiKey) {
        const noKeyMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I need an OpenRouter API key to respond. Go to Settings (tap the gear icon) and paste your key from openrouter.ai/keys — it's free to sign up!",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, noKeyMsg]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
              { role: 'system', content: buildSystemPrompt() },
              ...messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: content.trim() },
            ],
            max_tokens: 300,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const assistantContent =
          data.choices?.[0]?.message?.content || "Sorry, I couldn't process that. Try again.";

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}. Check your API key in Settings.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, messages, accounts, monthlyIncome, monthlyBudget, subscriptions, goals, cryptoHoldings]
  );

  return { messages, sendMessage, isLoading };
}
