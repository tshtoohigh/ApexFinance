import { useState } from 'react';
import { Target, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { Card, CardHeader, Badge, Button, Input } from '@/components/ui';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { cn } from '@/lib/cn';

export function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal } = useFinanceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const handleAdd = () => {
    if (!newName || !newTarget) return;
    addGoal({
      id: crypto.randomUUID(),
      name: newName,
      target: Number(newTarget),
      current: Number(newCurrent) || 0,
      deadline: newDeadline || 'No deadline',
      monthlyContribution: 0,
    });
    setNewName('');
    setNewTarget('');
    setNewCurrent('');
    setNewDeadline('');
    setShowAdd(false);
  };

  return (
    <PageWrapper>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-bold">Goals</h1>
        <Badge variant="accent">{goals.length} active</Badge>
      </div>

      {/* Add Goal */}
      <Card className="mb-3">
        <CardHeader
          title="Your Goals"
          action={<Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)}><Plus size={12} /> Add</Button>}
        />

        {showAdd && (
          <div className="mb-3 rounded-lg border border-accent/20 bg-surface p-3">
            <Input placeholder="Goal name (e.g. House Down Payment)" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input label="Target Amount" prefix="$" type="number" placeholder="100,000" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} />
            <Input label="Current Progress" prefix="$" type="number" placeholder="25,000" value={newCurrent} onChange={(e) => setNewCurrent(e.target.value)} />
            <Input label="Deadline" placeholder="Dec 2028" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
            <Button fullWidth size="sm" onClick={handleAdd}>Add Goal</Button>
          </div>
        )}

        {goals.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-dark">No goals yet. Set your first financial target!</p>
        )}

        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          const done = progress >= 100;
          return (
            <div key={goal.id} className="border-b border-border py-3 last:border-b-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {done ? <CheckCircle size={14} className="text-green" /> : <Target size={14} className="text-accent" />}
                  <span className="text-xs font-medium text-white">{goal.name}</span>
                </div>
                <span className={cn('text-[10px] font-semibold', done ? 'text-green' : 'text-muted-dark')}>{goal.deadline}</span>
              </div>
              <div className="mb-1.5 h-1.5 w-full rounded-full bg-border">
                <div className={cn('h-full rounded-full', done ? 'bg-green' : 'bg-accent')} style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-dark">
                <span>${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}</span>
                <span className="font-mono">{progress.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </Card>
    </PageWrapper>
  );
}
