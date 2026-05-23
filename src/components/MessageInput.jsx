import { useState, useRef, useEffect } from 'react';

const S = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes pulse-record {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    @keyframes sound-wave {
      0%, 100% { height: 4px; }
      50% { height: 20px; }
    }

    .mi-wrap {
      background: rgba(7,12,27,0.95);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 12px 16px;
    }

    /* File preview chip */
    .mi-file-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(79,142,247,0.08);
      border: 1px solid rgba(79,142,247,0.2);
      border-radius: 10px;
      padding: 7px 12px;
      margin-bottom: 10px;
      animation: fadeUp 0.2s ease;
      max-width: 320px;
    }
    .mi-file-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: rgba(238,242,255,0.75);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }
    .mi-file-remove {
      background: none;
      border: none;
      color: rgba(148,163,184,0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
      transition: color 0.2s;
      flex-shrink: 0;
    }
    .mi-file-remove:hover { color: #f87171; }

    /* Voice recording */
    .mi-voice-recording {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 22px;
      padding: 10px 16px;
      flex: 1;
    }
    .mi-recording-dot {
      width: 12px;
      height: 12px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse-record 1s ease-in-out infinite;
    }
    .mi-recording-time {
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      color: #ef4444;
      font-weight: 500;
      min-width: 50px;
    }
    .mi-sound-waves {
      display: flex;
      align-items: center;
      gap: 3px;
      flex: 1;
      justify-content: center;
    }
    .mi-sound-wave {
      width: 3px;
      background: #ef4444;
      border-radius: 2px;
      animation: sound-wave 0.5s ease-in-out infinite;
    }
    .mi-sound-wave:nth-child(1) { animation-delay: 0s; }
    .mi-sound-wave:nth-child(2) { animation-delay: 0.1s; }
    .mi-sound-wave:nth-child(3) { animation-delay: 0.2s; }
    .mi-sound-wave:nth-child(4) { animation-delay: 0.3s; }
    .mi-sound-wave:nth-child(5) { animation-delay: 0.4s; }

    /* Form row */
    .mi-form {
      display: flex;
      align-items: flex-end;
      gap: 10px;
    }

    /* Icon buttons */
    .mi-icon-btn {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      color: rgba(148,163,184,0.55);
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.2s, color 0.2s, border-color 0.2s;
    }
    .mi-icon-btn:hover {
      background: rgba(79,142,247,0.1);
      border-color: rgba(79,142,247,0.25);
      color: #4f8ef7;
    }

    /* Input field */
    .mi-input-wrap {
      flex: 1;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 22px;
      padding: 10px 16px;
      display: flex;
      align-items: flex-end;
      gap: 8px;
      transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
    }
    .mi-input-wrap:focus-within {
      border-color: rgba(79,142,247,0.4);
      background: rgba(79,142,247,0.05);
      box-shadow: 0 0 0 3px rgba(79,142,247,0.08);
    }

    .mi-textarea {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      resize: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 14.5px;
      color: rgba(238,242,255,0.88);
      line-height: 1.5;
      max-height: 120px;
      min-height: 24px;
      padding: 0;
      overflow-y: auto;
      scrollbar-width: none;
    }
    .mi-textarea::-webkit-scrollbar { display: none; }
    .mi-textarea::placeholder { color: rgba(148,163,184,0.3); }

    /* Send button */
    .mi-send-btn {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f8ef7, #6a5af7);
      border: none;
      display: flex; align-items: center; justify-content: center;
      color: #fff;
      cursor: pointer;
      flex-shrink: 0;
      box-shadow: 0 0 20px rgba(79,142,247,0.4);
      transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    }
    .mi-send-btn:hover:not(:disabled) {
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 0 32px rgba(79,142,247,0.6);
    }
    .mi-send-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Hint text */
    .mi-hint {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: rgba(148,163,184,0.25);
      text-align: center;
      margin-top: 8px;
      letter-spacing: 0.2px;
    }
  `}</style>
);

function MessageInput({ onSendMessage, onTyping, isImproving, onImprove, improvedText }) {
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (improvedText) {
            setMessage(improvedText);
            if (inputRef.current) {
                // Auto-resize
                setTimeout(() => {
                    inputRef.current.style.height = 'auto';
                    inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
                }, 0);
            }
        }
    }, [improvedText]);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const handleTyping = () => {
        if (!isTyping) { setIsTyping(true); onTyping(true); }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false); onTyping(false);
        }, 1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() && !selectedFile) return;
        onSendMessage(
            message,
            selectedFile ? 'file' : 'text',
            selectedFile ? URL.createObjectURL(selectedFile) : null,
            selectedFile?.name
        );
        setMessage('');
        setSelectedFile(null);
        onTyping(false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        // Auto-resize reset
        if (inputRef.current) inputRef.current.style.height = 'auto';
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setSelectedFile(file);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleTextChange = (e) => {
        setMessage(e.target.value);
        handleTyping();
        // Auto-resize textarea
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    };

    const canSend = message.trim() || selectedFile || audioBlob;

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }
        setIsRecording(false);
        setAudioBlob(null);
        setRecordingTime(0);
    };

    const handleVoiceSubmit = async (e) => {
        e.preventDefault();
        if (audioBlob) {
            try {
                // Convert audio blob to base64 data URL so it can be shared
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result;
                    onSendMessage(base64Audio, 'voice', base64Audio, `voice_message_${Date.now()}.webm`);
                    setAudioBlob(null);
                    setRecordingTime(0);
                };
            } catch (error) {
                console.error('Error converting audio to data URL:', error);
                // Fallback to local URL
                const audioUrl = URL.createObjectURL(audioBlob);
                onSendMessage(audioUrl, 'voice', audioUrl, `voice_message_${Date.now()}.webm`);
                setAudioBlob(null);
                setRecordingTime(0);
            }
        } else if (message.trim() || selectedFile) {
            onSendMessage(
                message,
                selectedFile ? 'file' : 'text',
                selectedFile ? URL.createObjectURL(selectedFile) : null,
                selectedFile?.name
            );
            setMessage('');
            setSelectedFile(null);
            onTyping(false);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            if (inputRef.current) inputRef.current.style.height = 'auto';
        }
    };

    return (
        <>
            <S />
            <div className="mi-wrap">

                {/* File chip */}
                {selectedFile && !audioBlob && (
                    <div className="mi-file-chip">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span className="mi-file-name">{selectedFile.name}</span>
                        <button className="mi-file-remove" onClick={() => setSelectedFile(null)}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Voice message preview */}
                {audioBlob && !isRecording && (
                    <div className="mi-file-chip">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                            <path d="M19 10v2a7 7 0 01-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        <span className="mi-file-name">Voice message ({formatTime(recordingTime)})</span>
                        <button className="mi-file-remove" onClick={() => { setAudioBlob(null); setRecordingTime(0); }}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                )}

                <form onSubmit={handleVoiceSubmit} className="mi-form">

                    {/* Attach file */}
                    {!isRecording && !audioBlob && (
                        <button type="button" className="mi-icon-btn" onClick={() => fileInputRef.current?.click()} title="Attach file">
                            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                            </svg>
                        </button>
                    )}

                    <input ref={fileInputRef} type="file" onChange={handleFileSelect} style={{ display: 'none' }} />

                    {/* Recording UI */}
                    {isRecording ? (
                        <div className="mi-voice-recording">
                            <div className="mi-recording-dot"></div>
                            <span className="mi-recording-time">{formatTime(recordingTime)}</span>
                            <div className="mi-sound-waves">
                                <div className="mi-sound-wave"></div>
                                <div className="mi-sound-wave"></div>
                                <div className="mi-sound-wave"></div>
                                <div className="mi-sound-wave"></div>
                                <div className="mi-sound-wave"></div>
                            </div>
                        </div>
                    ) : (
                        /* Text input */
                        <div className="mi-input-wrap">
                            <textarea
                                ref={inputRef}
                                className="mi-textarea"
                                value={message}
                                onChange={handleTextChange}
                                onKeyDown={handleKeyDown}
                                placeholder={audioBlob ? "Press send to share voice message..." : "Type a message…"}
                                rows={1}
                                disabled={!!audioBlob}
                            />
                            {!audioBlob && message.trim().length > 5 && (
                                <button
                                    type="button"
                                    onClick={() => onImprove(message)}
                                    disabled={isImproving}
                                    className="p-1 px-2 rounded-lg bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all text-[10px] font-black uppercase flex items-center gap-1"
                                    title="AI Improve"
                                >
                                    {isImproving ? '...' : '🤖 Improve'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Voice / Send buttons */}
                    {!isRecording && !audioBlob && message.trim() === '' && !selectedFile ? (
                        /* Voice record button */
                        <button
                            type="button"
                            className="mi-icon-btn"
                            onClick={startRecording}
                            title="Record voice message"
                            style={{ color: '#ef4444' }}
                        >
                            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        </button>
                    ) : isRecording ? (
                        /* Stop recording button */
                        <button
                            type="button"
                            className="mi-send-btn"
                            onClick={stopRecording}
                            title="Stop recording"
                            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                        >
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                        </button>
                    ) : (
                        /* Send button */
                        <button type="submit" className="mi-send-btn" disabled={!canSend} title="Send">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    )}

                    {/* Cancel recording button */}
                    {isRecording && (
                        <button
                            type="button"
                            className="mi-icon-btn"
                            onClick={cancelRecording}
                            title="Cancel"
                        >
                            <svg width="19" height="19" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}

                </form>

                <p className="mi-hint">
                    {isRecording ? 'Recording... Click stop to finish' : audioBlob ? 'Click send to share voice message' : 'Enter to send · Shift+Enter for new line · Click mic to record'}
                </p>
            </div>
        </>
    );
}

export default MessageInput;