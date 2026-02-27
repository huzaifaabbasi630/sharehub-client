import { useState, useEffect } from 'react';

const EducationMode = ({ isActive, onToggle, messages, participants, currentUser }) => {
  const [attendance, setAttendance] = useState([]);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [screenMonitor, setScreenMonitor] = useState(false);
  const [notes, setNotes] = useState('');
  const [recording, setRecording] = useState(false);

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
  }, [isActive, participants]);

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
  };

  const submitQuizResponse = (optionIndex) => {
    if (!activeQuiz) return;
    
    const updatedQuiz = {
      ...activeQuiz,
      responses: {
        ...activeQuiz.responses,
        [currentUser.name]: optionIndex
      }
    };
    
    setActiveQuiz(updatedQuiz);
    
    // Check if all participants responded
    if (Object.keys(updatedQuiz.responses).length >= participants.length) {
      endQuiz(updatedQuiz);
    }
  };

  const endQuiz = (quiz) => {
    const results = quiz.options.map((option, idx) => ({
      option,
      count: Object.values(quiz.responses).filter(r => r === idx).length,
      percentage: (Object.values(quiz.responses).filter(r => r === idx).length / Object.keys(quiz.responses).length * 100).toFixed(1)
    }));
    
    setQuizResults(results);
    setQuizResults(prev => [...prev, { ...quiz, results, endedAt: new Date().toISOString() }]);
    setActiveQuiz(null);
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
    const chatText = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎓</span>
              <div>
                <h2 className="text-xl font-bold">Education Mode</h2>
                <p className="text-sm opacity-80">Teaching tools & classroom management</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setScreenMonitor(!screenMonitor)}
                className={`px-3 py-1 rounded-lg text-sm ${screenMonitor ? 'bg-red-500' : 'bg-white/20'}`}
              >
                👁️ {screenMonitor ? 'Monitoring ON' : 'Monitor'}
              </button>
              <button
                onClick={onToggle}
                className="text-white/80 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-0">
          {/* Left Panel - Attendance */}
          <div className="border-r p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">📋 Attendance</h3>
              <button
                onClick={downloadAttendance}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
              >
                Download CSV
              </button>
            </div>
            <div className="space-y-2">
              {attendance.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{student.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    student.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {student.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {attendance.length} students present
            </p>
          </div>

          {/* Center Panel - Quiz */}
          <div className="border-r p-4 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">📝 Live Quiz</h3>
              {!quizMode && !activeQuiz && (
                <button
                  onClick={() => setQuizMode(true)}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                >
                  + Create Quiz
                </button>
              )}
            </div>

            {quizMode ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  placeholder="Enter question..."
                  className="w-full border rounded-lg p-2 text-sm"
                />
                {quizOptions.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...quizOptions];
                      newOpts[idx] = e.target.value;
                      setQuizOptions(newOpts);
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                ))}
                <div className="flex gap-2">
                  <button
                    onClick={startQuiz}
                    className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-sm hover:bg-purple-700"
                  >
                    Start Quiz
                  </button>
                  <button
                    onClick={() => setQuizMode(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : activeQuiz ? (
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="font-medium text-purple-900 mb-3">{activeQuiz.question}</p>
                <div className="space-y-2">
                  {activeQuiz.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitQuizResponse(idx)}
                      disabled={activeQuiz.responses[currentUser.name] !== undefined}
                      className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                        activeQuiz.responses[currentUser.name] === idx
                          ? 'bg-purple-600 text-white'
                          : 'bg-white hover:bg-purple-100'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-purple-600 mt-3">
                  {Object.keys(activeQuiz.responses).length} / {participants.length + 1} responded
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl">📝</span>
                <p className="mt-2 text-sm">No active quiz</p>
                <p className="text-xs">Create a quiz to engage students</p>
              </div>
            )}

            {/* Quiz History */}
            {quizResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Previous Quizzes</h4>
                {quizResults.slice(-3).map((quiz, idx) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded mb-2 text-xs">
                    <p className="font-medium truncate">{quiz.question}</p>
                    <p className="text-gray-500">
                      {Object.keys(quiz.responses).length} responses
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Notes & Recording */}
          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-4">📚 Class Tools</h3>
            
            {/* Recording */}
            <div className="mb-4">
              <button
                onClick={() => setRecording(!recording)}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 ${
                  recording ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {recording ? '⏹️ Stop Recording' : '🔴 Start Recording'}
              </button>
              {recording && (
                <p className="text-xs text-red-500 mt-1 text-center">
                  Recording in progress...
                </p>
              )}
            </div>

            {/* Auto Notes */}
            <div className="mb-4">
              <button
                onClick={generateNotes}
                className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 text-sm"
              >
                📝 Generate Notes from Chat
              </button>
            </div>

            {/* Notes Display */}
            {notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Class Notes</h4>
                <pre className="text-xs text-yellow-700 whitespace-pre-wrap overflow-y-auto max-h-32">
                  {notes}
                </pre>
                <button
                  onClick={() => {
                    const blob = new Blob([notes], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `notes_${new Date().toISOString().split('T')[0]}.txt`;
                    a.click();
                  }}
                  className="mt-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
                >
                  Download Notes
                </button>
              </div>
            )}

            {/* Screen Monitor Warning */}
            {screenMonitor && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <span className="animate-pulse">🔴</span>
                  Screen monitoring is active
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Students are being monitored for focus
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationMode;
