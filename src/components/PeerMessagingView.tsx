import React, { useState, useEffect, useRef } from 'react';
import { PeerMessage, PeerSummary, UserProfile } from '../types/index.ts';
import { Send, ArrowLeft, MessageSquare, Check, BookOpen, Clock } from 'lucide-react';

interface PeerMessagingViewProps {
  peers: PeerSummary[];
  activeThread: PeerMessage[];
  currentUser: UserProfile | null;
  selectedPeerId: string;
  onSelectPeer: (peerId: string) => void;
  onSendMessage: (receiverId: string, content: string) => Promise<void>;
}

export const PeerMessagingView: React.FC<PeerMessagingViewProps> = ({
  peers,
  activeThread,
  currentUser,
  selectedPeerId,
  onSelectPeer,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePeer = peers.find((p) => p.id === selectedPeerId) || peers[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePeer || sending) return;
    setSending(true);
    const textToSend = inputText;
    setInputText('');
    try {
      await onSendMessage(activePeer.id, textToSend);
    } catch (err) {
      console.error(err);
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleSelectPeerMobile = (peerId: string) => {
    onSelectPeer(peerId);
    setMobileChatOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Collaborative Mentorship & Doubt Resolution Network
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Peer & Faculty Direct Messaging
        </h2>
        <p className="text-slate-600 text-sm mt-1">
          Message high-performing student peers or reach university faculty mentors directly to ask technical doubts, review code solutions, and get personalized guidance.
        </p>
      </div>

      {/* Main Messaging Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[600px] flex">
        {/* Left Column: Peer Directory List */}
        <div
          className={`w-full md:w-84 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50 ${
            mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Contacts ({peers.length})
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold">Faculty & Peers</span>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {peers.map((peer) => {
              const isSelected = activePeer?.id === peer.id;
              const isTeacher = peer.role === 'teacher';
              return (
                <button
                  key={peer.id}
                  onClick={() => handleSelectPeerMobile(peer.id)}
                  className={`w-full p-4 text-left transition-colors flex items-start gap-3 ${
                    isSelected ? 'bg-white border-l-4 border-slate-900 shadow-xs' : 'hover:bg-slate-100/70'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                      isTeacher ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {isTeacher ? <BookOpen className="w-4 h-4" /> : peer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{peer.name}</span>
                      {isTeacher ? (
                        <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          Faculty
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold tabular-nums shrink-0">
                          {peer.cgpa} CGPA
                        </span>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium block truncate ${isTeacher ? 'text-indigo-700' : 'text-slate-600'}`}>
                      {peer.areaOfInterest}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {peer.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Conversation */}
        <div
          className={`flex-1 flex flex-col h-full bg-white ${
            !mobileChatOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {activePeer ? (
            <>
              {/* Conversation Top Bar */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileChatOpen(false)}
                    className="md:hidden p-1 text-slate-500 hover:text-slate-800"
                    aria-label="Back to peers list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                      activePeer.role === 'teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'
                    }`}
                  >
                    {activePeer.role === 'teacher' ? <BookOpen className="w-4 h-4" /> : activePeer.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{activePeer.name}</h4>
                      {activePeer.role === 'teacher' ? (
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-md">
                          Faculty Mentor
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                          {activePeer.cgpa} CGPA
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {activePeer.areaOfInterest} · {activePeer.college}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 hidden sm:block">
                  {activePeer.role === 'teacher' ? (
                    <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Office Hours: {activePeer.officeHours || 'Mon-Thu 2:00 PM - 5:00 PM'}</span>
                    </div>
                  ) : (
                    <span className="text-emerald-700 font-medium">● Active for Collaboration</span>
                  )}
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
                {activeThread.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-xs font-medium">No previous messages with {activePeer.name}.</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Say hello, discuss interview tips, or share study resources!
                    </p>
                  </div>
                ) : (
                  activeThread.map((msg) => {
                    const isMe = currentUser !== null && msg.senderId === currentUser.id;
                    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-slate-900 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                          <span>{timeStr}</span>
                          {isMe && <Check className="w-3 h-3 text-slate-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activePeer.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a peer to start messaging.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
