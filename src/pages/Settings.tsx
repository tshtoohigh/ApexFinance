import { useState } from 'react';
import { Plus, Trash2, LogOut } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Button, Input, Select } from '@/components/ui';
import { useFinanceStore, type Account } from '@/stores/useFinanceStore';
import { useAuth } from '@/hooks/useAuth';

export function SettingsPage() {
  const store = useFinanceStore();
  const { user, signOut } = useAuth();
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

  const handleLogout = async () => {
    await signOut();
  };

  const handleDeleteAll = async () => {
    store.resetAll();
    await signOut();
  };

  return (
    <PageWrapper>
      <h1 className="mb-5 text-xl font-bold">Settings</h1>

      {/* User Info */}
      <Card className="mb-3">
        <CardHeader title="Account" />
        <div className="flex items-center gap-3 rounded-lg bg-surface p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-dim text-sm font-bold text-accent">
            {(user?.user_metadata?.full_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.user_metadata?.full_name || 'User'}</p>
            <p className="text-[11px] text-muted-dark">{user?.email}</p>
          </div>
        </div>
      </Card>

      {/* Profile */}
      <Card className="mb-3">
        <CardHeader title="Financial Profile" />
        <Input label="Display Name" placeholder="Your name" value={store.userName} onChange={(e) => store.setUserName(e.target.value)} />
        <Input label="Monthly Income" prefix="$" type="number" value={store.monthlyIncome ? store.monthlyIncome.toString() : ''} onChange={(e) => store.setMonthlyIncome(Number(e.target.value))} />
        <Input label="Monthly Budget" prefix="$" type="number" value={store.monthlyBudget ? store.monthlyBudget.toString() : ''} onChange={(e) => store.setMonthlyBudget(Number(e.target.value))} />
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
        <p className="text-[10px] text-muted-dark">Free at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="text-accent underline">openrouter.ai/keys</a></p>
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

        {store.accounts.length === 0 && (
          <p className="py-3 text-center text-xs text-muted-dark">No accounts added yet.</p>
        )}

        {store.accounts.map((acc) => (
          <div key={acc.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
            <div className="flex-1"><p className="text-xs text-white">{acc.name}</p><p className="text-[10px] text-muted-dark">{acc.institution} • {acc.type}</p></div>
            <p className="px-2 font-mono text-xs text-white">${acc.balance.toLocaleString()}</p>
            <button onClick={() => store.removeAccount(acc.id)} className="text-muted-dark hover:text-red"><Trash2 size={12} /></button>
          </div>
        ))}
      </Card>

      {/* Crypto Holdings */}
      <Card className="mb-3">
        <CardHeader title="Crypto Holdings" subtitle="Prices fetched live from CoinGecko" />
        {store.cryptoHoldings.length === 0 && (
          <p className="py-3 text-center text-xs text-muted-dark">No crypto added. Add via onboarding or here.</p>
        )}
        {store.cryptoHoldings.map((h) => (
          <div key={h.id} className="flex items-center border-b border-border py-2.5 last:border-b-0">
            <div className="flex-1"><p className="text-xs text-white">{h.symbol}</p><p className="text-[10px] text-muted-dark">{h.amount} coins</p></div>
            <button onClick={() => store.removeCryptoHolding(h.id)} className="text-muted-dark hover:text-red"><Trash2 size={12} /></button>
          </div>
        ))}
      </Card>

      {/* Actions */}
      <Card className="mb-3 border-border">
        <Button variant="outline" fullWidth className="mb-2" onClick={handleLogout}>
          <LogOut size={14} /> Log Out
        </Button>
        <Button variant="danger" fullWidth onClick={handleDeleteAll}>
          Delete All Data & Log Out
        </Button>
      </Card>
    </PageWrapper>
  );
}
