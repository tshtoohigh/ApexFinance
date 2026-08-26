import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useChatbot, type ChatMessage } from '@/hooks/useChatbot';

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useChatbot();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/20 transition-transform hover:scale-105"
        >
          <MessageCircle size={20} className="text-bg" strokeWidth={2} />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-bg/95 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-dim">
                <MessageCircle size={14} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Apex AI</p>
                <p className="text-[10px] text-muted-dark">Financial Assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-surface">
              <X size={18} className="text-muted" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Disclaimer */}
            <div className="flex items-center gap-2 rounded-lg border border-amber/20 bg-amber/[0.04] px-3 py-2">
              <span className="text-[10px] text-muted">⚠️ Apex provides informational insights, not financial advice.</span>
            </div>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-dark">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-xs">Thinking...</span>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about your finances..."
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-white placeholder:text-muted-dark focus:border-accent focus:outline-none"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-bg disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed',
        isUser ? 'bg-accent text-bg rounded-br-sm' : 'bg-surface border border-border text-white rounded-bl-sm'
      )}>
        {message.content}
      </div>
    </div>
  );
}
