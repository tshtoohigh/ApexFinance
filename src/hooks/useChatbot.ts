import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useFinanceStore } from '@/stores/useFinanceStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * Chat hook that calls the Supabase Edge Function (which proxies to OpenRouter).
 * API key is stored server-side — never exposed to the client.
 */
export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your Apex Finance assistant. I can help you understand your finances, suggest strategies, or answer money questions. What can I help with?",
      timestamp: Date.now(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const accounts = useFinanceStore((s) => s.accounts);
  const monthlyIncome = useFinanceStore((s) => s.monthlyIncome);
  const monthlyBudget = useFinanceStore((s) => s.monthlyBudget);
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const goals = useFinanceStore((s) => s.goals);
  const cryptoHoldings = useFinanceStore((s) => s.cryptoHoldings);

  // Build financial context string for the AI
  const buildFinancialContext = () => {
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalSubs = subscriptions.reduce((sum, s) => sum + s.amount, 0);

    return `The user's financial snapshot:
- Total account balances: $${totalBalance.toLocaleString()}
- Monthly income: $${monthlyIncome.toLocaleString()}
- Monthly budget: $${monthlyBudget.toLocaleString()}
- Monthly subscriptions: $${totalSubs.toFixed(2)}
- Accounts: ${accounts.map(a => `${a.name} (${a.type}): $${a.balance.toLocaleString()}${a.apy ? ` @ ${a.apy}% APY` : ''}`).join(', ') || 'None added yet'}
- Crypto holdings: ${cryptoHoldings.map(h => `${h.amount} ${h.symbol}`).join(', ') || 'None'}
- Goals: ${goals.map(g => `${g.name}: $${g.current.toLocaleString()}/$${g.target.toLocaleString()}`).join(', ') || 'None set'}`;
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

      try {
        // Get current session for auth header
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          throw new Error('Not authenticated. Please log in again.');
        }

        // Call the Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('chat', {
          body: {
            messages: messages
              .filter((m) => m.id !== 'welcome')
              .slice(-10)
              .map((m) => ({ role: m.role, content: m.content }))
              .concat([{ role: 'user', content: content.trim() }]),
            financialContext: buildFinancialContext(),
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to get response');
        }

        const assistantContent = data?.content || "Sorry, I couldn't process that. Try again.";

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
          content: `⚠️ ${err instanceof Error ? err.message : 'Something went wrong. Please try again.'}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, accounts, monthlyIncome, monthlyBudget, subscriptions, goals, cryptoHoldings]
  );

  return { messages, sendMessage, isLoading };
}
