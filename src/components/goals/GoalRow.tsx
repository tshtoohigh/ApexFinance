import { useState } from 'react';
import { Target, CheckCircle, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui';
import { useFinanceStore, type Goal } from '@/stores/useFinanceStore';
import { cn } from '@/lib/cn';

interface GoalRowProps {
  goal: Goal;
}

/** A goal row with progress bar + inline edit (name, target, current, deadline) and delete. */
export function GoalRow({ goal }: GoalRowProps) {
  const { updateGoal, removeGoal } = useFinanceStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(goal.name);
  const [target, setTarget] = useState(goal.target.toString());
  const [current, setCurrent] = useState(goal.current.toString());
  const [deadline, setDeadline] = useState(goal.deadline);

  const save = () => {
    updateGoal(goal.id, {
      name: name.trim() || goal.name,
      target: Number(target) || goal.target,
      current: Number(current) || 0,
      deadline: deadline.trim() || goal.deadline,
    });
    setEditing(false);
  };

  const cancel = () => {
    setName(goal.name);
    setTarget(goal.target.toString());
    setCurrent(goal.current.toString());
    setDeadline(goal.deadline);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="border-b border-border py-3 last:border-b-0">
        <Input placeholder="Goal name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Target Amount" prefix="$" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Input label="Current Progress" prefix="$" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input label="Deadline" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={save} className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-accent py-2 text-[11px] font-semibold text-bg">
            <Check size={12} /> Save
          </button>
          <button onClick={cancel} className="flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-[11px] font-semibold text-muted">
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    );
  }

  const progress = goal.target > 0 ? Math.min((goal.current / goal.target) * 100, 100) : 0;
  const done = progress >= 100;

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {done ? <CheckCircle size={14} className="text-green" /> : <Target size={14} className="text-accent" />}
          <span className="text-xs font-medium text-white">{goal.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-[10px] font-semibold', done ? 'text-green' : 'text-muted-dark')}>{goal.deadline}</span>
          <button onClick={() => setEditing(true)} className="text-muted-dark hover:text-accent">
            <Pencil size={11} />
          </button>
          <button onClick={() => removeGoal(goal.id)} className="text-muted-dark hover:text-red">
            <Trash2 size={11} />
          </button>
        </div>
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
}
