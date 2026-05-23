import { useEffect, useRef, useState } from 'react';

// Voice Message Player Component
const VoiceMessagePlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    let audio;
    try {
      audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('ended', () => setIsPlaying(false));

      // Handle playback errors
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
      });
    } catch (error) {
      console.error('Error creating audio element:', error);
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate random wave heights
  const waveBars = Array.from({ length: 20 }, (_, i) => {
    const progress = duration > 0 ? currentTime / duration : 0;
    const barProgress = i / 20;
    const isActive = barProgress <= progress;
    const height = 8 + Math.random() * 16;
    return { height, isActive };
  });

  return (
    <div className="cb-voice">
      <button className="cb-voice-play" onClick={togglePlay}>
        {isPlaying ? (
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#ef4444' }}>
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#ef4444' }}>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="cb-voice-wave">
        {waveBars.map((bar, i) => (
          <div
            key={i}
            className="cb-voice-bar"
            style={{
              height: `${bar.height}px`,
              background: bar.isActive ? '#ef4444' : 'rgba(239,68,68,0.3)'
            }}
          />
        ))}
      </div>
      <span className="cb-voice-time">
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </span>
    </div>
  );
};

const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes bounce-dot {
      0%,80%,100% { transform: translateY(0); }
      40%         { transform: translateY(-6px); }
    }
    @keyframes glow-pulse {
      0%,100% { opacity: 0.4; } 50% { opacity: 1; }
    }

    .cb-wrap {
      flex: 1;
      overflow-y: auto;
      background: #03050f;
      padding: 20px 16px 12px;
      position: relative;
      scroll-behavior: smooth;
    }

    /* Dot grid */
    .cb-wrap::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: radial-gradient(rgba(79,142,247,0.07) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
      z-index: 0;
    }

    /* Scrollbar */
    .cb-wrap::-webkit-scrollbar { width: 4px; }
    .cb-wrap::-webkit-scrollbar-track { background: transparent; }
    .cb-wrap::-webkit-scrollbar-thumb {
      background: rgba(79,142,247,0.18);
      border-radius: 4px;
    }
    .cb-wrap::-webkit-scrollbar-thumb:hover {
      background: rgba(79,142,247,0.32);
    }

    .cb-inner {
      max-width: 760px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: relative;
      z-index: 1;
    }

    /* ── Date divider ── */
    .cb-date-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 20px 0 12px;
    }
    .cb-date-divider::before,
    .cb-date-divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.05);
    }
    .cb-date-label {
      font-family: 'DM Sans', sans-serif;
      font-size: 11.5px;
      font-weight: 500;
      color: rgba(148,163,184,0.4);
      letter-spacing: 0.5px;
      padding: 4px 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      white-space: nowrap;
    }

    /* ── Message row ── */
    .cb-row {
      display: flex;
      animation: fadeUp 0.25s ease;
    }
    .cb-row.own  { justify-content: flex-end; }
    .cb-row.other { justify-content: flex-start; }

    /* ── Bubble ── */
    .cb-bubble {
      max-width: 68%;
      padding: 10px 14px;
      border-radius: 16px;
      position: relative;
      word-break: break-word;
    }

    /* Own message */
    .cb-bubble.own {
      background: linear-gradient(135deg, rgba(79,142,247,0.22), rgba(106,90,247,0.16));
      border: 1px solid rgba(79,142,247,0.25);
      border-bottom-right-radius: 4px;
      box-shadow: 0 2px 12px rgba(79,142,247,0.1);
    }

    /* Other message */
    .cb-bubble.other {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-bottom-left-radius: 4px;
    }

    /* Sender name */
    .cb-sender {
      font-family: 'Syne', sans-serif;
      font-size: 12px;
      font-weight: 700;
      color: #4f8ef7;
      margin-bottom: 4px;
      letter-spacing: 0.2px;
    }

    /* Message text */
    .cb-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 14.5px;
      color: rgba(238,242,255,0.88);
      line-height: 1.55;
      white-space: pre-wrap;
    }

    /* Timestamp + tick */
    .cb-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 5px;
    }
    .cb-meta.own  { justify-content: flex-end; }
    .cb-meta.other { justify-content: flex-start; }
    .cb-time {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: rgba(148,163,184,0.4);
    }

    /* ── File attachment ── */
    .cb-file {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 12px;
      padding: 10px 12px;
      margin-bottom: 6px;
    }
    .cb-file-icon {
      width: 36px; height: 36px; border-radius: 10px;
      background: rgba(79,142,247,0.12);
      border: 1px solid rgba(79,142,247,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .cb-file-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px; font-weight: 500;
      color: rgba(238,242,255,0.8);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 160px;
    }
    .cb-file-dl {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: #4f8ef7;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .cb-file-dl:hover { color: #38e8c4; }

    /* ── Voice message ── */
    .cb-voice {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(239,68,68,0.08);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 12px;
      padding: 10px 14px;
      margin-bottom: 6px;
      min-width: 200px;
    }
    .cb-voice-play {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(239,68,68,0.2);
      border: 1px solid rgba(239,68,68,0.3);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cb-voice-play:hover {
      background: rgba(239,68,68,0.3);
      transform: scale(1.05);
    }
    .cb-voice-wave {
      flex: 1;
      height: 24px;
      display: flex;
      align-items: center;
      gap: 2px;
    }
    .cb-voice-bar {
      width: 3px;
      background: rgba(239,68,68,0.5);
      border-radius: 2px;
      transition: height 0.2s;
    }
    .cb-voice-time {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      color: rgba(238,242,255,0.6);
      min-width: 40px;
      text-align: right;
    }

    /* ── Empty state ── */
    .cb-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      gap: 16px;
      animation: fadeUp 0.5s ease;
    }
    .cb-empty-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(79,142,247,0.08);
      border: 1px solid rgba(79,142,247,0.15);
      display: flex; align-items: center; justify-content: center;
      animation: glow-pulse 3s ease-in-out infinite;
    }

    /* ── Typing indicator ── */
    .cb-typing-bubble {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      padding: 10px 16px;
      width: fit-content;
      margin-top: 4px;
    }
    .cb-typing-dots {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .cb-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: rgba(79,142,247,0.6);
      animation: bounce-dot 1.2s ease-in-out infinite;
    }
    .cb-dot:nth-child(2) { animation-delay: 0.15s; background: rgba(79,142,247,0.45); }
    .cb-dot:nth-child(3) { animation-delay: 0.3s;  background: rgba(79,142,247,0.3); }

    .cb-typing-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: rgba(148,163,184,0.5);
    }
  `}</style>
);

function ChatBox({
  messages,
  currentUser,
  typingUsers,
  messagesEndRef,
  watermarkText,
  watermarkSize = '9xl',
  smartReplies = {},
  onSendSmartReply,
  translatedMessages = {},
  onTranslate
}) {
  console.log('ChatBox received watermarkText:', watermarkText, 'watermarkSize:', watermarkSize);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getMessageDate = (timestamp) => new Date(timestamp).toDateString();

  let lastDate = null;

  return (
    <>
      <S />
      <div className="cb-wrap">
        <div className="cb-inner">

          {/* ── Empty state ── */}
          {messages.length === 0 && (
            <div className="cb-empty">
              <div className="cb-empty-icon">
                <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Syne',sans-serif", fontSize: '16px', fontWeight: '700', color: 'rgba(238,242,255,0.5)', marginBottom: '6px' }}>
                  No messages yet
                </p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '13.5px', color: 'rgba(148,163,184,0.35)' }}>
                  Be the first to say something 👋
                </p>
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          {messages.map((message, index) => {
            const messageDate = getMessageDate(message.createdAt);
            const showDate = messageDate !== lastDate;
            lastDate = messageDate;
            const isOwn = message.senderName === currentUser.name;
            const isLastMessage = index === messages.length - 1;
            const currentSmartReplies = smartReplies[message._id] || [];
            const translatedText = translatedMessages[message.content];

            return (
              <div key={message._id || index} className="mb-4">

                {/* Date divider */}
                {showDate && (
                  <div className="cb-date-divider">
                    <span className="cb-date-label">{formatDate(message.createdAt)}</span>
                  </div>
                )}

                {/* Message row */}
                <div className={`cb-row ${isOwn ? 'own' : 'other'}`}>
                  {/* Avatar for others */}
                  {!isOwn && (
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: message.senderId === 'ai-assistant' ? 'linear-gradient(135deg, #7c3aed, #4f46e5)' : 'linear-gradient(135deg,#4f8ef7,#6a5af7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Syne',sans-serif", color: '#fff',
                      fontSize: '12px', fontWeight: '800',
                      flexShrink: 0, marginRight: '8px', marginTop: '2px',
                      alignSelf: 'flex-end',
                    }}>
                      {message.senderId === 'ai-assistant' ? '🤖' : message.senderName?.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className={`cb-bubble ${isOwn ? 'own' : 'other'}`}>

                    {/* Sender name (others only) */}
                    {!isOwn && (
                      <p className="cb-sender" style={{ color: message.senderId === 'ai-assistant' ? '#a78bfa' : '#4f8ef7' }}>
                        {message.senderName}
                        {message.senderId === 'ai-assistant' && <span className="ml-2 text-[9px] bg-purple-500/20 px-1.5 py-0.5 rounded text-purple-300 font-black uppercase tracking-widest">AI</span>}
                      </p>
                    )}

                    {/* Image message */}
                    {message.type === 'image' && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-white/10">
                        <img src={message.fileUrl} alt="Generated" className="w-full h-auto object-cover max-h-64" />
                      </div>
                    )}

                    {/* Voice message */}
                    {message.type === 'voice' ? (
                      <VoiceMessagePlayer audioUrl={message.fileUrl || message.content} />
                    ) : (
                      <div className="relative group/msg">
                        {/* File attachment */}
                        {(message.type === 'file' || message.fileUrl) ? (
                          <div>
                            <div className="cb-file">
                              <div className="cb-file-icon">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="cb-file-name">{message.fileName}</p>
                                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="cb-file-dl">
                                  Download ↓
                                </a>
                              </div>
                            </div>
                            {message.content && message.content.startsWith('http') === false && <p className="cb-text">{message.content}</p>}
                          </div>
                        ) : (
                          <>
                            <p className="cb-text">{message.content}</p>
                            {translatedText && (
                              <div className="mt-2 pt-2 border-t border-white/5 animate-fade-in">
                                <p className="text-[10px] font-bold text-azure opacity-40 uppercase tracking-widest mb-1 flex items-center gap-1">
                                  <span>🌐</span> Translated
                                </p>
                                <p className="text-sm italic text-indigo-300/80">{translatedText}</p>
                              </div>
                            )}
                          </>
                        )}

                        {/* Translation Buttons */}
                        {!isOwn && message.type === 'text' && (
                          <div className="absolute -right-32 top-0 opacity-0 group-hover/msg:opacity-100 transition-opacity flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 z-20">
                            <button onClick={() => onTranslate(message.content, 'Urdu')} className="text-[9px] font-bold px-1.5 py-1 hover:text-indigo-400 transition-colors" title="Translate to Urdu">اردو</button>
                            <button onClick={() => onTranslate(message.content, 'Hindi')} className="text-[9px] font-bold px-1.5 py-1 hover:text-pink-400 transition-colors" title="Translate to Hindi">हिन्दी</button>
                            <button onClick={() => onTranslate(message.content, 'English')} className="text-[9px] font-bold px-1.5 py-1 hover:text-azure transition-colors" title="Translate to English">EN</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Time + read tick */}
                    <div className={`cb-meta ${isOwn ? 'own' : 'other'}`}>
                      <span className="cb-time">{formatTime(message.createdAt)}</span>
                      {isOwn && (
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Smart Replies below the message */}
                {!isOwn && currentSmartReplies.length > 0 && isLastMessage && (
                  <div className="flex flex-wrap gap-2 mt-3 ml-12 animate-fade-up">
                    {currentSmartReplies.map((reply, ridx) => (
                      <button
                        key={ridx}
                        onClick={() => onSendSmartReply(reply)}
                        className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95 whitespace-nowrap"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Typing indicator ── */}
          {typingUsers.length > 0 && (
            <div className="cb-row other" style={{ marginTop: '4px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'rgba(79,142,247,0.1)',
                border: '1px solid rgba(79,142,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginRight: '8px', alignSelf: 'flex-end',
              }}>
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div className="cb-typing-bubble">
                <div className="cb-typing-dots">
                  <div className="cb-dot" />
                  <div className="cb-dot" />
                  <div className="cb-dot" />
                </div>
                <span className="cb-typing-text">
                  {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Watermark Overlay */}
      {watermarkText && (
        <div
          className="fixed inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 50px,
              rgba(0,0,0,0.05) 50px,
              rgba(0,0,0,0.05) 54px
            )`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`text-${watermarkSize} font-bold text-red-500 opacity-10 select-none whitespace-nowrap`}
              style={{
                transform: 'rotate(-30deg)',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {watermarkText}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatBox;