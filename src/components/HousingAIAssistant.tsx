import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  Calculator, 
  MapPin, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Property, User } from '../types';

interface HousingAIAssistantProps {
  properties: Property[];
  currentUser: User | null;
  onSelectProperty: (property: Property) => void;
  onNavigateSearch?: (filters?: any) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  matchedPropertyIds?: string[];
}

const SUGGESTED_PROMPTS = [
  {
    icon: '🏠',
    title: 'Find Budget Rooms',
    prompt: 'Find me verified rooms under 120,000 TZS within walking distance of St John’s main campus.'
  },
  {
    icon: '🛡️',
    title: 'Check Dalali Scam',
    prompt: 'A broker on WhatsApp is asking for a 15,000 TZS viewing fee before showing me a room. Is this normal?'
  },
  {
    icon: '💡',
    title: 'Estimate Luku & Water',
    prompt: 'What is the realistic monthly cost for Luku sub-meter electricity and DUWASA water in Dodoma for a student?'
  },
  {
    icon: '💬',
    title: 'Draft Swahili WhatsApp',
    prompt: 'Draft a polite Swahili WhatsApp inquiry message to landlord Mzee Mwambene asking to view his Kikuyu room.'
  }
];

export const HousingAIAssistant: React.FC<HousingAIAssistantProps> = ({
  properties,
  currentUser,
  onSelectProperty,
  onNavigateSearch
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Habari! I am **Rafiki AI**, your St John's University Student Housing Assistant.

I can help you find verified off-campus rooms, calculate Dodoma living expenses, avoid broker (dalali) scams, and draft polite WhatsApp inquiries to verified landlords.

What are you looking for today?`,
      timestamp: new Date().toISOString()
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setLoading(true);

    try {
      // Build past history for context
      const history = messages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content
        }));

      const res = await fetch('/api/ai/housing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage.content,
          history,
          studentProfile: currentUser ? {
            name: currentUser.name,
            course: currentUser.courseOfStudy,
            year: currentUser.yearOfStudy
          } : undefined
        })
      });

      if (!res.ok) {
        throw new Error('API request failed');
      }

      const data = await res.json();
      const reply = data.reply || 'I could not generate a response. Please try again.';

      // Extract room tags if any [ROOM:prop-1]
      const matches = reply.match(/\[ROOM:([a-zA-Z0-9_-]+)\]/g) || [];
      const matchedIds = matches.map((m: string) => m.replace('[ROOM:', '').replace(']', ''));

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        matchedPropertyIds: matchedIds
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `I encountered a momentary connection issue. You can browse our verified rooms directly using the **Find Rooms** tab or contact our verified landlords on WhatsApp.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render markdown and embedded room cards
  const renderMessageContent = (msg: ChatMessage) => {
    // Strip the raw [ROOM:id] tags from text and render them as rich preview cards below
    const cleanContent = msg.content.replace(/\[ROOM:([a-zA-Z0-9_-]+)\]/g, '');

    const matchedProps = (msg.matchedPropertyIds || [])
      .map(id => properties.find(p => p.id === id))
      .filter((p): p is Property => p !== undefined);

    return (
      <div className="space-y-4">
        {/* Text body */}
        <div className="prose prose-stone dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
          {cleanContent}
        </div>

        {/* Embedded Interactive Property Recommendations */}
        {matchedProps.length > 0 && (
          <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 space-y-2">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Verified Rooms</span>
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {matchedProps.map((property) => (
                <div 
                  key={property.id}
                  className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:border-amber-500/80 transition-all flex flex-col justify-between"
                >
                  <div className="flex gap-3 items-start">
                    <img 
                      src={property.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'}
                      alt={property.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100 dark:bg-stone-800"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500">
                        <span className="font-semibold text-amber-700 dark:text-amber-400">{property.location}</span>
                        <span>•</span>
                        <span>{property.distanceFromUniversity}</span>
                      </div>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                        {property.title}
                      </h5>
                      <p className="font-mono text-xs font-bold text-stone-900 dark:text-stone-200 mt-1">
                        {new Intl.NumberFormat('en-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(property.monthlyRent)}
                        <span className="text-[10px] font-normal text-stone-500">/mo</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-stone-500 truncate">
                      Host: {property.landlordName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectProperty(property)}
                      className="px-2.5 py-1 rounded-md bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      View Room
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-mono tracking-tight border border-amber-200 dark:border-amber-800/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
            <span>GEMINI 3.8 FLASH • DODOMA CAMPUS INTELLIGENCE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
            Rafiki AI Housing Assistant
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Ask anything about St John's campus rentals, Luku budgeting, walking routes, or verify landlord credibility.
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `welcome-${Date.now()}`,
                role: 'assistant',
                content: `### New Session Initialized.
What would you like assistance with regarding St John's University housing?`,
                timestamp: new Date().toISOString()
              }
            ]);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Suggested Quick Prompt Pills */}
      {messages.length <= 2 && (
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-medium">
            Common Inquiries:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                className="p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 hover:border-amber-500/80 dark:hover:border-amber-500/80 hover:bg-amber-50/20 dark:hover:bg-stone-800/40 transition-all text-left group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                  {item.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Stream Container */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 backdrop-blur-sm p-4 sm:p-6 space-y-6 min-h-[420px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs font-serif font-bold text-sm">
                  R
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`p-4 rounded-2xl ${
                    isUser 
                      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-medium' 
                      : 'bg-stone-100/80 dark:bg-stone-800/70 text-stone-900 dark:text-stone-100 border border-stone-200/60 dark:border-stone-700/60'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm sm:text-base leading-relaxed">{msg.content}</p>
                  ) : (
                    renderMessageContent(msg)
                  )}
                </div>

                {/* Micro Actions Under Assistant Message */}
                {!isUser && (
                  <div className="flex items-center gap-2 px-1 text-[11px] font-mono text-stone-400">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <span>•</span>
                    <span>St John’s Housing Desk Verified</span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-stone-300 dark:bg-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200 shrink-0 font-bold text-xs">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 dark:bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs font-serif font-bold text-sm">
              R
            </div>
            <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/60 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs font-mono text-stone-500 dark:text-stone-400 ml-1">
                Consulting verified Dodoma listings...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box (Claude / Grok Styled Prompt Pill) */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-300/80 dark:border-stone-800 shadow-md focus-within:border-amber-600 dark:focus-within:border-amber-500 transition-all">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Rafiki AI about rooms, Luku tokens, dalali check, or Swahili inquiry..."
            className="flex-1 px-3 py-2 text-sm sm:text-base bg-transparent border-0 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-0 font-sans"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2.5 sm:px-4 sm:py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-semibold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-800 dark:hover:bg-white transition-all shadow-xs"
          >
            <span className="hidden sm:inline">Ask AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Footnote */}
      <p className="text-center text-[11px] font-mono text-stone-400 dark:text-stone-500">
        Rafiki AI verifies details against direct landlord database. Never send payment without in-person inspection.
      </p>

    </div>
  );
};
