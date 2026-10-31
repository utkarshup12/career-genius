import React, { useState } from 'react';
import { UserProfile } from '../types/index.ts';
import { Sparkles, X, Send, Bot, Copy, Check, Terminal } from 'lucide-react';

interface AiMentorModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const AiMentorModal: React.FC<AiMentorModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [adviceResponse, setAdviceResponse] = useState<string | null>(null);
  const [modelBadge, setModelBadge] = useState<string>('gemini-3.8-flash');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'Generate a 30-day technical roadmap tailored to my CGPA and track',
    'Recommend 2 production-grade resume projects to stand out to hiring managers',
    'How should I prepare for technical interviews and coding rounds?',
    'Analyze my current domain assessment readiness and pinpoint gaps',
  ];

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim() || loading) return;
    setLoading(true);
    setAdviceResponse(null);

    try {
      const res = await fetch('/api/ai/career-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: questionText,
          studentContext: {
            cgpa: currentUser.cgpa,
            areaOfInterest: currentUser.areaOfInterest,
            college: currentUser.college,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.advice) {
        setAdviceResponse(data.advice);
        if (data.modelUsed) setModelBadge(data.modelUsed);
      } else {
        setAdviceResponse('Unable to retrieve career guidance at this moment. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setAdviceResponse('Failed to contact server-side career guidance engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!adviceResponse) return;
    navigator.clipboard.writeText(adviceResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Career Genius AI Mentor</h3>
                <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                  {modelBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Personalized advice for {currentUser.name} ({currentUser.areaOfInterest} · {currentUser.cgpa.toFixed(2)} CGPA)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            aria-label="Close AI Mentor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Quick Prompts */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Recommended Inquiries:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(p);
                    handleAsk(p);
                  }}
                  disabled={loading}
                  className="p-2.5 text-left text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl transition-colors font-medium leading-snug"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Display */}
          {loading && (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Bot className="w-8 h-8 text-indigo-600 animate-bounce mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Analyzing your CGPA ({currentUser.cgpa}), assessment scores & career roadmap...
              </p>
            </div>
          )}

          {adviceResponse && !loading && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Strategic Mentorship Analysis</span>
                </span>
                <button
                  onClick={handleCopy}
                  className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-2">
                {adviceResponse}
              </div>
            </div>
          )}
        </div>

        {/* Input Form Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(query);
          }}
          className="pt-3 border-t border-slate-100 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder="Ask a career or technical problem (e.g., 'How to explain 8.8 CGPA in FAANG interview?')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
