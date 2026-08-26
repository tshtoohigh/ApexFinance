import { PageWrapper } from '@/components/layout';
import { Card } from '@/components/ui';

export function TermsPage() {
  return (
    <PageWrapper>
      <h1 className="mb-5 text-xl font-bold">Terms & Disclaimer</h1>

      <Card className="mb-3">
        <h2 className="mb-2 text-sm font-semibold text-white">Disclaimer</h2>
        <p className="mb-3 text-[12px] leading-relaxed text-muted">
          Apex Finance is an informational tool designed to help you organize and view your financial data in one place. 
          It does <span className="font-semibold text-white">not</span> provide financial advice, investment recommendations, 
          or any form of professional financial guidance.
        </p>
        <p className="mb-3 text-[12px] leading-relaxed text-muted">
          The AI chatbot feature provides general informational responses based on the data you provide. Its outputs should 
          not be interpreted as professional financial, tax, or investment advice. Always consult a qualified financial advisor 
          before making financial decisions.
        </p>
        <p className="text-[12px] leading-relaxed text-muted">
          The "Risk Radar" and "Yield" features perform calculations based on the data you manually enter. These calculations 
          are illustrative and may not reflect your actual financial position. Apex Finance is not responsible for any financial 
          decisions made based on information displayed in this application.
        </p>
      </Card>

      <Card className="mb-3">
        <h2 className="mb-2 text-sm font-semibold text-white">Data & Privacy</h2>
        <p className="mb-3 text-[12px] leading-relaxed text-muted">
          Your account data is stored securely via Supabase (encrypted at rest and in transit). Financial data you enter 
          (balances, accounts, goals) is tied to your authenticated user profile and protected by Row Level Security policies.
        </p>
        <p className="mb-3 text-[12px] leading-relaxed text-muted">
          When you use the AI chatbot, a summary of your financial data is sent to OpenRouter's API to generate responses. 
          This data is not stored by OpenRouter beyond the duration of the request.
        </p>
        <p className="text-[12px] leading-relaxed text-muted">
          Live cryptocurrency prices are fetched from CoinGecko's public API. No personal data is sent in these requests.
        </p>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-white">No Autonomous Execution</h2>
        <p className="text-[12px] leading-relaxed text-muted">
          Apex Finance does not move, transfer, trade, or transact any funds on your behalf. It is a read-only dashboard 
          and planning tool. Any "suggested moves" or "yield opportunities" shown are informational only and require you 
          to take action independently through your own financial institutions.
        </p>
      </Card>
    </PageWrapper>
  );
}
