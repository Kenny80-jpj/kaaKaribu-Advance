import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Home, 
  CheckCheck, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  ChevronLeft, 
  User as UserIcon, 
  PhoneCall 
} from 'lucide-react';
import { MessageThread, Message, User, Property } from '../types';
import { INITIAL_THREADS } from '../data/seedData';

interface MessagesModalProps {
  isOpen?: boolean;
  currentUser: User | null;
  threads?: MessageThread[];
  activeThreadId?: string | null;
  initialRecipient?: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  } | null;
  initialProperty?: Property | null;
  onClose: () => void;
  onSendMessage?: (threadId: string, content: string) => Promise<void>;
  onMarkThreadRead?: (threadId: string) => void;
  onSelectProperty?: (propertyId: string) => void;
  onOpenLandlordProfile?: (landlordId: string) => void;
  onOpenTenantProfile?: (tenantId: string) => void;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  isOpen = true,
  currentUser,
  threads: propThreads,
  activeThreadId,
  initialRecipient,
  initialProperty,
  onClose,
  onSendMessage,
  onMarkThreadRead,
  onSelectProperty,
  onOpenLandlordProfile,
  onOpenTenantProfile
}) => {
  if (!isOpen) return null;

  const [internalThreads, setInternalThreads] = useState<MessageThread[]>(() => {
    if (propThreads && Array.isArray(propThreads) && propThreads.length > 0) {
      return propThreads;
    }
    return INITIAL_THREADS || [];
  });

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(activeThreadId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [mobileShowChat, setMobileShowChat] = useState<boolean>(!!activeThreadId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync internal threads if propThreads changes
  useEffect(() => {
    if (propThreads && Array.isArray(propThreads)) {
      setInternalThreads(propThreads);
    }
  }, [propThreads]);

  // Fetch threads from backend if available
  useEffect(() => {
    if (!currentUser?.id) return;
    fetch(`/api/messages/threads?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setInternalThreads(data);
        }
      })
      .catch((err) => {
        console.warn('Failed to load user threads, using local fallback', err);
      });
  }, [currentUser?.id]);

  // Handle initial recipient / property thread creation or selection
  useEffect(() => {
    if (!currentUser) return;

    if (initialRecipient) {
      // Look for existing thread with this recipient and property
      const targetPropertyId = initialProperty?.id;
      const existingThread = internalThreads.find(t => {
        const matchesUser = (t.tenantId === initialRecipient.id && t.landlordId === currentUser.id) ||
                            (t.landlordId === initialRecipient.id && t.tenantId === currentUser.id);
        if (targetPropertyId) {
          return matchesUser && t.propertyId === targetPropertyId;
        }
        return matchesUser;
      });

      if (existingThread) {
        setSelectedThreadId(existingThread.id);
        setMobileShowChat(true);
      } else if (initialProperty) {
        // Create new thread optimistically
        const isCurrentTenant = currentUser.role === 'tenant';
        const newThread: MessageThread = {
          id: `thread-${Date.now()}`,
          propertyId: initialProperty.id,
          propertyTitle: initialProperty.title,
          propertyImage: (initialProperty.images && initialProperty.images[0]) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
          propertyPrice: initialProperty.monthlyRent,
          propertyLocation: initialProperty.location,
          tenantId: isCurrentTenant ? currentUser.id : initialRecipient.id,
          tenantName: isCurrentTenant ? currentUser.name : initialRecipient.name,
          tenantAvatar: isCurrentTenant ? currentUser.avatar : initialRecipient.avatar,
          landlordId: isCurrentTenant ? initialRecipient.id : currentUser.id,
          landlordName: isCurrentTenant ? initialRecipient.name : currentUser.name,
          landlordAvatar: isCurrentTenant ? initialRecipient.avatar : currentUser.avatar,
          lastMessage: `Inquiry about ${initialProperty.title}`,
          lastMessageTime: new Date().toISOString(),
          unreadCountTenant: 0,
          unreadCountLandlord: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setInternalThreads(prev => [newThread, ...prev]);
        setSelectedThreadId(newThread.id);
        setMobileShowChat(true);

        // Also post to backend
        fetch('/api/messages/threads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: initialProperty.id,
            tenantId: isCurrentTenant ? currentUser.id : initialRecipient.id,
            landlordId: isCurrentTenant ? initialRecipient.id : currentUser.id,
            initialMessage: `Hello, I am inquiring about "${initialProperty.title}"`
          })
        }).catch(err => console.warn('Could not persist thread to backend', err));
      }
    } else if (!selectedThreadId && internalThreads.length > 0) {
      setSelectedThreadId(internalThreads[0].id);
    }
  }, [initialRecipient, initialProperty, currentUser?.id]);

  // Sync selected thread if activeThreadId prop changes
  useEffect(() => {
    if (activeThreadId) {
      setSelectedThreadId(activeThreadId);
      setMobileShowChat(true);
    }
  }, [activeThreadId]);

  // If no thread selected yet, pick first available
  useEffect(() => {
    if (!selectedThreadId && internalThreads.length > 0) {
      setSelectedThreadId(internalThreads[0].id);
    }
  }, [selectedThreadId, internalThreads]);

  // Fetch messages whenever selectedThreadId changes
  useEffect(() => {
    if (!selectedThreadId) return;

    setLoadingMessages(true);
    fetch(`/api/messages/threads/${selectedThreadId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else if (Array.isArray(data)) {
          setMessages(data);
        }
        setLoadingMessages(false);
        // Mark as read
        if (currentUser?.id) {
          if (onMarkThreadRead) {
            onMarkThreadRead(selectedThreadId);
          } else {
            fetch(`/api/messages/threads/${selectedThreadId}/read`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id })
            }).catch(() => null);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load thread messages', err);
        setLoadingMessages(false);
      });
  }, [selectedThreadId, currentUser?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentThread = internalThreads.find((t) => t.id === selectedThreadId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedThreadId || sending) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    const isCurrentTenant = currentUser?.role === 'tenant';
    const receiverId = isCurrentTenant ? (currentThread?.landlordId || '') : (currentThread?.tenantId || '');
    const receiverName = isCurrentTenant ? (currentThread?.landlordName || '') : (currentThread?.tenantName || '');

    // Optimistic message append
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      threadId: selectedThreadId,
      senderId: currentUser?.id || 'unknown',
      senderName: currentUser?.name || 'Me',
      senderRole: currentUser?.role || 'tenant',
      receiverId,
      receiverName,
      content: messageText,
      read: false,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...(prev || []), optimisticMsg]);

    // Update thread snippet locally
    setInternalThreads((prev) =>
      (prev || []).map((t) =>
        t.id === selectedThreadId
          ? { ...t, lastMessage: messageText, lastMessageTime: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : t
      )
    );

    try {
      if (onSendMessage) {
        await onSendMessage(selectedThreadId, messageText);
      } else {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: selectedThreadId,
            senderId: currentUser?.id || 'unknown',
            senderName: currentUser?.name || 'Me',
            senderRole: currentUser?.role || 'tenant',
            receiverId,
            receiverName,
            content: messageText
          })
        });
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  const handleQuickQuestion = (text: string) => {
    setInputMessage(text);
  };

  const threadsCount = (internalThreads || []).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="messages-modal"
        className="relative w-full max-w-5xl h-[88vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            {mobileShowChat && (
              <button
                onClick={() => setMobileShowChat(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
            )}
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <span>In-App Messages</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Direct & Dalali-Free
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct tenant-landlord communication for St John's University housing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Close messages"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Left Threads, Right Chat */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Threads Column */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col ${
            mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Conversations ({threadsCount})
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/60">
              {threadsCount > 0 ? (
                internalThreads.map((thread) => {
                  const isSelected = thread.id === selectedThreadId;
                  const isTenant = currentUser?.role === 'tenant';
                  const otherPartyName = isTenant ? thread.landlordName : thread.tenantName;
                  const otherPartyAvatar = isTenant ? thread.landlordAvatar : thread.tenantAvatar;
                  const unreadCount = isTenant ? thread.unreadCountTenant : thread.unreadCountLandlord;

                  return (
                    <div
                      key={thread.id}
                      onClick={() => {
                        setSelectedThreadId(thread.id);
                        setMobileShowChat(true);
                      }}
                      className={`p-3.5 cursor-pointer transition-colors flex gap-3 items-start ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-emerald-600'
                          : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Avatar with unread indicator */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={otherPartyAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={otherPartyName}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {otherPartyName}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex-shrink-0">
                            {new Date(thread.lastMessageTime || thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                          {thread.propertyTitle}
                        </p>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5 line-clamp-1">
                          {thread.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active conversations yet. Find a property and click "Message Landlord" to start!
                </div>
              )}
            </div>
          </div>

          {/* Right Active Chat Column */}
          <div className={`flex-1 flex flex-col bg-white dark:bg-slate-900 ${
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          }`}>
            {currentThread ? (
              <>
                {/* Active Thread Banner with Property Context */}
                <div className="p-3 sm:px-6 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {currentThread.propertyImage && (
                      <img
                        src={currentThread.propertyImage}
                        alt={currentThread.propertyTitle}
                        className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {currentUser?.role === 'tenant' ? currentThread.landlordName : currentThread.tenantName}
                        </span>
                        {currentUser?.role === 'tenant' ? (
                          <button
                            type="button"
                            onClick={() => onOpenLandlordProfile && onOpenLandlordProfile(currentThread.landlordId)}
                            className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>View Profile</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenTenantProfile && onOpenTenantProfile(currentThread.tenantId)}
                            className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Student Profile</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                        <Home className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{currentThread.propertyTitle}</span>
                        {currentThread.propertyPrice && (
                          <span className="font-bold text-emerald-600">
                            • {(currentThread.propertyPrice / 1000).toFixed(0)}k/mo
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {onSelectProperty && (
                    <button
                      type="button"
                      onClick={() => onSelectProperty(currentThread.propertyId)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 hover:border-emerald-500 transition-colors flex-shrink-0"
                    >
                      <span>View Room</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Messages Bubble List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/20 dark:bg-slate-900/30">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      Loading conversation...
                    </div>
                  ) : (messages && messages.length > 0) ? (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                            {!isMe && (
                              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {msg.senderName ? msg.senderName.charAt(0) : 'U'}
                              </div>
                            )}

                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-xs shadow-sm'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              
                              <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                isMe ? 'text-emerald-200' : 'text-slate-400'
                              }`}>
                                <span>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMe && (
                                  <CheckCheck className={`w-3 h-3 ${msg.read ? 'text-cyan-300' : 'text-emerald-200'}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      Send a message to inquire about room availability, viewing appointments, or water & Luku conditions.
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Student Inquiry Chips */}
                {currentUser?.role === 'tenant' && (
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                    <span className="text-slate-400 flex-shrink-0 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3 text-emerald-500" />
                      Quick:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickQuestion('Is this room still available for rent?')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 flex-shrink-0 transition-colors"
                    >
                      Room available?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickQuestion('Can I schedule an in-person room inspection tomorrow?')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 flex-shrink-0 transition-colors"
                    >
                      Schedule inspection
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickQuestion('Is the water supply constant and does it have a borehole tank?')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 flex-shrink-0 transition-colors"
                    >
                      Water tank status?
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickQuestion('How is the electricity sub-meter handled between tenants?')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 flex-shrink-0 transition-colors"
                    >
                      Luku sub-meter?
                    </button>
                  </div>
                )}

                {/* Message Input Box */}
                <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={currentUser?.role === 'tenant' ? "Type inquiry to landlord..." : "Reply to student tenant..."}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || sending}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
                Select a conversation thread on the left to read and send messages.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
