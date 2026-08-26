import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Card, Button, Input, Select } from '@/components/ui';
import { useFinanceStore, type Account, type CryptoHolding } from '@/stores/useFinanceStore';

export function OnboardingPage() {
  const navigate = useNavigate();
  const store = useFinanceStore();
  const [step, setStep] = useState(0);

  // Step 0: Name & Income
  const [name, setName] = useState('');
  const [income, setIncome] = useState('');
  const [budget, setBudget] = useState('');

  // Step 1: Accounts
  const [accounts, setAccounts] = useState<Partial<Account>[]>([
    { name: '', institution: '', type: 'checking', balance: 0 },
  ]);

  // Step 2: Crypto
  const [holdings, setHoldings] = useState<Partial<CryptoHolding>[]>([]);

  const handleFinish = () => {
    store.setUserName(name);
    store.setMonthlyIncome(Number(income) || 0);
    store.setMonthlyBudget(Number(budget) || 0);

    accounts.forEach((acc) => {
      if (acc.name && acc.balance) {
        store.addAccount({
          id: crypto.randomUUID(),
          name: acc.name!,
          institution: acc.institution || '',
          type: acc.type as Account['type'],
          balance: Number(acc.balance),
          apy: acc.apy ? Number(acc.apy) : undefined,
        });
      }
    });

    holdings.forEach((h) => {
      if (h.symbol && h.amount) {
        store.addCryptoHolding({
          id: crypto.randomUUID(),
          symbol: h.symbol!,
          amount: Number(h.amount),
        });
      }
    });

    store.setOnboarded(true);
    navigate('/');
  };

  return (
    <div className="mx-auto min-h-screen max-w-[430px] px-4 py-8">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-mid bg-accent-dim">
          <Layers size={20} className="text-accent" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Apex Finance</h1>
          <p className="text-[11px] text-muted-dark">Let's set up your finances</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>

      {/* Step 0: Basics */}
      {step === 0 && (
        <Card>
          <h2 className="mb-4 text-base font-semibold">About You</h2>
          <Input label="Your Name" placeholder="Alex" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Monthly Income (after tax)" prefix="$" placeholder="7,500" type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
          <Input label="Monthly Spending Budget" prefix="$" placeholder="5,000" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <Button fullWidth onClick={() => setStep(1)} className="mt-2">
            Next <ArrowRight size={14} />
          </Button>
        </Card>
      )}

      {/* Step 1: Accounts */}
      {step === 1 && (
        <Card>
          <h2 className="mb-1 text-base font-semibold">Your Accounts</h2>
          <p className="mb-4 text-[11px] text-muted-dark">Add your bank accounts, brokerages, etc.</p>

          {accounts.map((acc, i) => (
            <div key={i} className="mb-4 rounded-lg border border-border bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-muted-dark">ACCOUNT {i + 1}</span>
                {accounts.length > 1 && (
                  <button onClick={() => setAccounts(accounts.filter((_, j) => j !== i))} className="text-red">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <Input placeholder="Account name (e.g. Chase Checking)" value={acc.name || ''} onChange={(e) => { const copy = [...accounts]; copy[i] = { ...copy[i], name: e.target.value }; setAccounts(copy); }} />
              <Input placeholder="Institution (e.g. Chase)" value={acc.institution || ''} onChange={(e) => { const copy = [...accounts]; copy[i] = { ...copy[i], institution: e.target.value }; setAccounts(copy); }} />
              <Select label="Type" value={acc.type || 'checking'} onChange={(e) => { const copy = [...accounts]; copy[i] = { ...copy[i], type: e.target.value as Account['type'] }; setAccounts(copy); }} options={[
                { value: 'checking', label: 'Checking' },
                { value: 'savings', label: 'Savings' },
                { value: 'brokerage', label: 'Brokerage' },
                { value: 'retirement', label: 'Retirement (401k/IRA)' },
                { value: 'crypto', label: 'Crypto Exchange' },
                { value: 'defi', label: 'DeFi Protocol' },
              ]} />
              <Input label="Balance" prefix="$" type="number" placeholder="10,000" value={acc.balance?.toString() || ''} onChange={(e) => { const copy = [...accounts]; copy[i] = { ...copy[i], balance: Number(e.target.value) }; setAccounts(copy); }} />
            </div>
          ))}

          <Button variant="ghost" fullWidth onClick={() => setAccounts([...accounts, { name: '', institution: '', type: 'checking', balance: 0 }])} className="mb-3">
            <Plus size={14} /> Add Another Account
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button fullWidth onClick={() => setStep(2)}>Next <ArrowRight size={14} /></Button>
          </div>
        </Card>
      )}

      {/* Step 2: Crypto */}
      {step === 2 && (
        <Card>
          <h2 className="mb-1 text-base font-semibold">Crypto Holdings</h2>
          <p className="mb-4 text-[11px] text-muted-dark">Enter how much crypto you own. Prices are fetched live.</p>

          {holdings.map((h, i) => (
            <div key={i} className="mb-3 flex items-end gap-2">
              <div className="flex-1">
                <Select label="Coin" value={h.symbol || ''} onChange={(e) => { const copy = [...holdings]; copy[i] = { ...copy[i], symbol: e.target.value }; setHoldings(copy); }} options={[
                  { value: '', label: 'Select...' },
                  { value: 'BTC', label: 'Bitcoin (BTC)' },
                  { value: 'ETH', label: 'Ethereum (ETH)' },
                  { value: 'SOL', label: 'Solana (SOL)' },
                  { value: 'ADA', label: 'Cardano (ADA)' },
                  { value: 'DOT', label: 'Polkadot (DOT)' },
                  { value: 'LINK', label: 'Chainlink (LINK)' },
                  { value: 'AVAX', label: 'Avalanche (AVAX)' },
                  { value: 'POL', label: 'Polygon (POL)' },
                ]} />
              </div>
              <div className="flex-1">
                <Input label="Amount" type="number" placeholder="0.5" value={h.amount?.toString() || ''} onChange={(e) => { const copy = [...holdings]; copy[i] = { ...copy[i], amount: Number(e.target.value) }; setHoldings(copy); }} />
              </div>
              <button onClick={() => setHoldings(holdings.filter((_, j) => j !== i))} className="mb-3 text-red"><Trash2 size={14} /></button>
            </div>
          ))}

          <Button variant="ghost" fullWidth onClick={() => setHoldings([...holdings, { symbol: '', amount: 0 }])} className="mb-3">
            <Plus size={14} /> Add Crypto
          </Button>

          <p className="mb-4 text-[10px] text-muted-dark">Skip this if you don't hold crypto.</p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button fullWidth onClick={handleFinish}>
              Launch Apex Finance <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Finish */}
      {step === 3 && (
        <Card>
          <h2 className="mb-1 text-base font-semibold">You're all set!</h2>
          <p className="mb-4 text-[11px] text-muted-dark">
            Your data will be saved securely. You can always edit your accounts, goals, and settings later.
            The AI chatbot is available via the chat bubble in the bottom-left corner.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button fullWidth onClick={handleFinish}>
              Launch Apex Finance <ArrowRight size={14} />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
