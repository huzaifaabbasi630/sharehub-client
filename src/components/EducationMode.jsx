import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';

const EducationMode = ({
  isActive, onToggle, messages, participants, currentUser, isHost, roomCode,
  externalAttendance: attendance,
  setExternalAttendance: setAttendance,
  externalActiveQuiz: activeQuiz,
  setExternalActiveQuiz: setActiveQuiz
}) => {
  const { socket, emit, on, off } = useSocket();
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizResults, setQuizResults] = useState([]);
  const [screenMonitor, setScreenMonitor] = useState(false);
  const [notes, setNotes] = useState('');

  // Recording State
  const [recording, setRecording] = useState(false);
  const [recordedVideos, setRecordedVideos] = useState([]);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Auto attendance tracking
  useEffect(() => {
    if (isActive && participants) {
      const now = new Date().toISOString();
      const newAttendance = participants.map(p => ({
        name: p.name,
        joinedAt: now,
        status: 'present'
      }));
      setAttendance(prev => {
        const existing = new Map(prev.map(a => [a.name, a]));
        newAttendance.forEach(a => {
          if (!existing.has(a.name)) {
            existing.set(a.name, a);
          }
        });
        return Array.from(existing.values());
      });
    }
  }, [isActive, participants, setAttendance]);

  // Recording Functions
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true
      });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recordedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const name = `Class_Recording_${new Date().toLocaleTimeString()}.webm`;
        setRecordedVideos(prev => [...prev, { url, name, timestamp: new Date().toISOString() }]);
        setRecording(false);
        setRecordingTimer(0);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordingTimer(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Recording error:", err);
      alert("Failed to start recording: " + err.message);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Other Helper Functions
  const startQuiz = () => {
    if (!quizQuestion.trim() || quizOptions.some(o => !o.trim())) {
      alert('Please fill in the question and all options');
      return;
    }
    const quiz = {
      id: Date.now(),
      question: quizQuestion,
      options: quizOptions.filter(o => o.trim()),
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
      responses: {}
    };
    setActiveQuiz(quiz);
    setQuizMode(false);
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    emit('start_quiz', { roomCode: roomCode.toUpperCase(), quiz });
  };

  const submitQuizResponse = (optionIndex) => {
    if (!activeQuiz) return;
    setActiveQuiz(prev => ({
      ...prev,
      responses: { ...prev.responses, [currentUser.name]: optionIndex }
    }));
    emit('submit_quiz_answer', {
      roomCode: roomCode.toUpperCase(),
      userName: currentUser.name,
      optionIndex
    });
  };

  const endQuiz = (quiz) => {
    const results = quiz.options.map((option, idx) => ({
      option,
      count: Object.values(quiz.responses || {}).filter(r => r === idx).length,
      percentage: (Object.values(quiz.responses || {}).length > 0)
        ? (Object.values(quiz.responses).filter(r => r === idx).length / Object.keys(quiz.responses).length * 100).toFixed(1)
        : 0
    }));
    setQuizResults(prev => [...prev, { ...quiz, results, endedAt: new Date().toISOString() }]);
    setActiveQuiz(null);
  };

  const sendAttendanceRequest = (studentName) => {
    emit('attendance_request', {
      roomCode: roomCode.toUpperCase(),
      targetName: studentName,
      requesterName: currentUser.name,
      id: Date.now()
    });
    setAttendance(prev => prev.map(a =>
      a.name === studentName ? { ...a, confirmed: false, status: 'pending' } : a
    ));
    setTimeout(() => {
      setAttendance(prev => prev.map(a =>
        (a.name === studentName && !a.confirmed) ? { ...a, status: 'not responding' } : a
      ));
    }, 45000);
  };

  const sendAllAttendanceRequest = () => {
    emit('attendance_request', {
      roomCode: roomCode.toUpperCase(),
      targetName: null,
      requesterName: currentUser.name,
      id: Date.now()
    });
    setAttendance(prev => prev.map(a =>
      a.name !== currentUser.name ? { ...a, confirmed: false, status: 'pending' } : a
    ));
    setTimeout(() => {
      setAttendance(prev => prev.map(a =>
        (a.status === 'pending' && !a.confirmed) ? { ...a, status: 'not responding' } : a
      ));
    }, 45000);
  };

  const respondToAttendance = (status) => {
    emit('attendance_response', {
      roomCode: roomCode.toUpperCase(),
      userName: currentUser.name,
      status: status
    });
  };

  const downloadAttendance = () => {
    const csv = [
      ['Name', 'Status', 'Joined At'].join(','),
      ...attendance.map(a => [a.name, a.status, new Date(a.joinedAt).toLocaleString()].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const generateNotes = () => {
    const chatText = messages.map(m => `${m.senderName || m.sender}: ${m.content}`).join('\n');
    setNotes(`Class Notes - ${new Date().toLocaleDateString()}\n\n${chatText}`);
  };

  if (!isActive) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors z-40 flex items-center gap-2"
      >
        🎓 Education Mode
      </button>
    );
  }

  return (
    <>
      {/* Recording Toast Notification */}
      {recording && isHost && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border border-red-500/50 rounded-2xl p-4 flex items-center gap-6 shadow-2xl shadow-red-900/40 animate-bounce-subtle">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_#dc2626]"></div>
            <span className="text-white font-black text-sm tracking-widest uppercase">Recording Room</span>
          </div>
          <div className="text-red-400 font-mono text-lg font-bold bg-black/40 px-3 py-1 rounded-lg">
            {formatTimer(recordingTimer)}
          </div>
          <button
            onClick={stopScreenRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-900/20"
          >
            Stop Recording
          </button>
        </div>
      )}

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col scale-in-center">

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-4xl bg-white/20 p-2 rounded-2xl backdrop-blur-md">🎓</span>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Education Mode</h2>
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Digital Classroom Management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScreenMonitor(!screenMonitor)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${screenMonitor ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {screenMonitor ? '👁️ Monitoring Active' : '👁️ Screen Monitor'}
              </button>
              <button onClick={onToggle} className="text-white hover:bg-white/10 p-2 rounded-xl transition-all font-bold text-2xl">×</button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3">

            {/* Attendance */}
            <div className="border-r border-gray-100 flex flex-col">
              <div className="p-6 pb-2 border-b border-gray-100/50 flex justify-between items-center">
                <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">📋 Student Roster</h3>
                <button onClick={downloadAttendance} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold uppercase">Export</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {attendance.length === 0 && <p className="text-center text-xs text-gray-400 py-10 italic">No students joined yet</p>}
                {attendance.map((student, idx) => (
                  <div key={idx} className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl flex flex-col gap-3 group hover:border-indigo-200 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{student.name}</p>
                        <p className="text-[9px] text-gray-400 font-medium">Synced: {new Date(student.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-tighter ${student.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                          student.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {student.status}
                      </span>
                    </div>
                    {isHost && student.name !== currentUser.name && (
                      <button
                        onClick={() => sendAttendanceRequest(student.name)}
                        disabled={student.confirmed}
                        className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${student.confirmed ? 'bg-emerald-50 text-emerald-600 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/10 active:scale-95'
                          }`}
                      >
                        {student.confirmed ? '✓ Verified' : 'Verify Student'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Section */}
            <div className="border-r border-gray-100 flex flex-col bg-slate-50/30">
              <div className="p-6 pb-2 flex justify-between items-center">
                <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">📝 Live Assessment</h3>
                {isHost && !quizMode && !activeQuiz && (
                  <button
                    onClick={() => setQuizMode(true)}
                    className="text-[10px] bg-purple-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 active:scale-95"
                  >
                    + New Quiz
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col">
                {quizMode ? (
                  <div className="space-y-3 animate-slide-up">
                    <textarea
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      placeholder="What is the main topic today?"
                      className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none shadow-sm"
                    />
                    {quizOptions.map((opt, idx) => (
                      <input
                        key={idx}
                        value={opt}
                        onChange={(e) => {
                          const n = [...quizOptions];
                          n[idx] = e.target.value;
                          setQuizOptions(n);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none shadow-sm"
                      />
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={startQuiz} className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-sm">Launch Quiz</button>
                      <button onClick={() => setQuizMode(false)} className="px-4 text-gray-400 font-bold text-xs uppercase">Cancel</button>
                    </div>
                  </div>
                ) : activeQuiz ? (
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 animate-fade-in flex flex-col h-full">
                    <p className="text-indigo-900 font-black mb-6 leading-tight text-lg">{activeQuiz.question}</p>
                    <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      {activeQuiz.options.map((opt, idx) => {
                        const isSelected = activeQuiz.responses?.[currentUser?.name] === idx;
                        const hasResponded = activeQuiz.responses?.[currentUser?.name] !== undefined;
                        const count = Object.values(activeQuiz.responses || {}).filter(r => r === idx).length;
                        return (
                          <button
                            key={idx}
                            disabled={hasResponded || isHost}
                            onClick={() => submitQuizResponse(idx)}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50 shadow-inner' : (hasResponded || isHost) ? 'border-gray-50 opacity-60' : 'border-gray-100 hover:border-indigo-300'
                              }`}
                          >
                            <span className="font-bold text-sm text-gray-800">{opt}</span>
                            {(isHost || hasResponded) && <span className="bg-indigo-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black">{count}</span>}
                          </button>
                        )
                      })}
                    </div>
                    {isHost && (
                      <button onClick={() => endQuiz(activeQuiz)} className="w-full mt-6 bg-rose-500 text-white py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all">End Session</button>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                    <span className="text-6xl mb-4">🏆</span>
                    <p className="font-black uppercase tracking-tighter">No Active Quiz</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tools Panel */}
            <div className="flex flex-col h-full bg-slate-100/50">
              <div className="p-6 pb-2 border-b border-gray-100/50">
                <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">📚 Class Toolbox</h3>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                {/* Recording Section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Screen Capture</p>
                  <button
                    onClick={recording ? stopScreenRecording : startScreenRecording}
                    className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${recording ? 'bg-red-600 text-white shadow-red-900/20' : 'bg-white text-gray-900 shadow-gray-900/5 hover:border-indigo-500 border border-transparent'
                      }`}
                  >
                    {recording ? (
                      <>
                        <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                        Stop Session
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔴</span>
                        Start Screen Recording
                      </>
                    )}
                  </button>

                  {/* Recorded Video List */}
                  {recordedVideos.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">Lecture Archives</p>
                      {recordedVideos.map((vid, i) => (
                        <div key={i} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">📹</span>
                            <p className="text-[10px] font-bold text-gray-800 truncate max-w-[100px]">{vid.name}</p>
                          </div>
                          <a
                            href={vid.url}
                            download={vid.name}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-700"
                          >
                            Download
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Documentation</p>
                  <button
                    onClick={generateNotes}
                    className="w-full bg-indigo-50 text-indigo-700 py-3 rounded-2xl font-bold text-xs border border-indigo-100 hover:bg-indigo-100 transition-all"
                  >
                    ✨ Generate Chat Transcript
                  </button>
                  {notes && (
                    <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-2xl animate-fade-in relative group">
                      <h5 className="text-[9px] font-black text-amber-700 uppercase mb-2">Lecture Notes</h5>
                      <pre className="text-[10px] text-amber-900/70 whitespace-pre-wrap font-medium h-32 overflow-y-auto leading-relaxed">{notes}</pre>
                      <button
                        onClick={() => {
                          const b = new Blob([notes], { type: 'text/plain' });
                          const u = URL.createObjectURL(b);
                          const a = document.createElement('a');
                          a.href = u; a.download = `notes_${Date.now()}.txt`; a.click();
                        }}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all bg-amber-600 text-white px-2 py-1 rounded-md text-[9px] font-bold shadow-lg"
                      >
                        Save .txt
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Footer info */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{attendance.filter(a => a.status === 'present').length} Present</span>
            </div>
            <div className="w-px h-3 bg-gray-200"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ShareHub Edu-Console v4.0</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default EducationMode;
