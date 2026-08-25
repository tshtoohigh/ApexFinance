import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Key, User, DollarSign } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select } from '@/components/ui';
import { useFinanceStore, type Account } from '@/stores/useFinanceStore';

export function SettingsPage() {
  const store = useFinanceStore();
  const navigate = useNavigate();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accName, setAccName] = useState('');
  const [accInst, setAccInst] = useState('');
  const [accType, setAccType] = useState<Account['type']>('checking');
  const [accBal, setAccBal] = useState('');
  const [accApy, setAccApy] = useState('');

  const handleAddAccount = () => {
    if (!accName || !accBal) return;
    store.addAccount({
      id: crypto.randomUUID(),
      name: accName,
      institution: accInst,
      type: accType,
      balance: Number(accBal),
      apy: accApy ? Number(accApy) : undefined,
    });
    setAccName(''); setAccInst(''); setAccBal(''); setAccApy('');
    setShowAddAccount(false);
  };

  return (
    <PageWrapper>
      <h1 className="mb-5 text-xl font-bold">Settings</h1>

      {/* Profile */}
      <Card className="mb-3">
        <CardHeader title="Profile" />
        <Input label="Name" placeholder="Your name" value={store.userName} onChange={(e) => store.setUserName(e.target.value)} />
        <Input label="Monthly Income" prefix="$" type="number" value={store.monthlyIncome.toString()} onChange={(e) => store.setMonthlyIncome(Number(e.target.value))} />
        <Input label="Monthly Budget" prefix="$" type="number" value={store.monthlyBudget.toString()} onChange={(e) => store.setMonthlyBudget(Number(e.target.value))} />
      </Card>

      {/* API Key */}
      <Card className="mb-3">
        <CardHeader title="AI Chatbot" subtitle="OpenRouter API key for AI assistant" />
        <Input
          label="API Key"
          type="password"
          placeholder="sk-or-v1-..."
          value={store.openRouterApiKey}
          onChange={(e) => store.setOpenRouterApiKey(e.target.value)}
        />
        <p className="text-[10px] text-muted-dark">Free at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-accent underline">openrouter.ai/keys</a>. Stored locally only.</p>
      </Card>

      {/* Accounts */}
      <Card className="mb-3">
        <CardHeader title="Accounts" action={<Button variant="ghost" size="sm" onClick={() => setShowAddAccount(!showAddAccount)}><Plus size={12} /> Add</Button>} />

        {showAddAccount && (
          <div className="mb-3 rounded-lg border border-accent/20 bg-surface p-3">
            <Input placeholder="Account name" value={accName} onChange={(e) => setAccName(e.target.value)} />
            <Input placeholder="Institution" value={accInst} onChange={(e) => setAccInst(e.target.value)} />
            <Select label="Type" value={accType} onChange={(e) => setAccType(e.target.value as Account['type'])} options={[
              { value: 'checking', label: 'Checking' }, { value: 'savings', label: 'Savings' },
              { value: 'brokerage', label: 'Brokerage' }, { value: 'retirement', label: 'Retirement' },
              { value: 'crypto', label: 'Crypto' }, { value: 'defi', label: 'DeFi' },
            ]} />
            <Input label="Balance" prefix="$" type="number" value={accBal} onChange={(e) => setAccBal(e.target.value)} />
            <Input label="APY (optional)" type="number" placeholder="4.15" value={accApy} onChange={(e) => setAccApy(e.target.value)} />
            <Button fullWidth size="sm" onClick={handleAddAccount}>Save Account</Button>
          </div>
        )}

        {store.accounts.map((acc) => (
          <div key={acc.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
            <div className="flex-1"><p className="text-xs text-white">{acc.name}</p><p className="text-[10px] text-muted-dark">{acc.institution} • {acc.type}</p></div>
            <p className="px-2 font-mono text-xs text-white">${acc.balance.toLocaleString()}</p>
            <button onClick={() => store.removeAccount(acc.id)} className="text-muted-dark hover:text-red"><Trash2 size={12} /></button>
          </div>
        ))}
      </Card>

      {/* Danger Zone */}
      <Card className="border-red/20">
        <CardHeader title="Danger Zone" />
        <Button variant="danger" fullWidth onClick={() => { store.resetAll(); navigate('/onboarding'); }}>
          Reset All Data & Start Over
        </Button>
      </Card>
    </PageWrapper>
  );
}
