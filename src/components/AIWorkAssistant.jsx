import { useState, useEffect } from 'react';

const GEMINI_API_KEY = 'AIzaSyAfAP3LWaiHyaMsyEKyIqEdFf4GYxvVxz4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const AIWorkAssistant = ({ messages, roomName, isVisible, onClose }) => {
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  const generateSummary = async () => {
    if (messages.length === 0) return;
    
    setLoading(true);
    try {
      // Prepare chat text for AI
      const chatText = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
      
      const prompt = `Analyze this meeting/chat conversation and provide:
1. A brief summary (2-3 sentences)
2. Action items (bullet points)
3. Any mentioned deadlines or important dates

Conversation:
${chatText}

Format your response as JSON:
{
  "summary": "brief summary here",
  "actionItems": ["item 1", "item 2"],
  "deadlines": ["deadline 1", "deadline 2"]
}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]) {
        const text = data.candidates[0].content.parts[0].text;
        
        // Try to parse JSON from response
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setSummary(parsed.summary || 'No summary available');
            setActionItems(parsed.actionItems || []);
            setDeadlines(parsed.deadlines || []);
          }
        } catch (e) {
          // Fallback: just set the raw text as summary
          setSummary(text);
        }
      }
    } catch (error) {
      console.error('AI Summary error:', error);
      setSummary('Failed to generate summary. Please try again.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isVisible && messages.length > 0) {
      generateSummary();
    }
  }, [isVisible]);

  const saveToLocalStorage = (type, content) => {
    const saved = JSON.parse(localStorage.getItem('sharehub_ai_tasks') || '[]');
    saved.push({
      type,
      content,
      roomName,
      createdAt: new Date().toISOString(),
      id: Date.now()
    });
    localStorage.setItem('sharehub_ai_tasks', JSON.stringify(saved));
    alert('Saved to your tasks!');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div>
                <h2 className="text-xl font-bold">AI Work Assistant</h2>
                <p className="text-sm opacity-80">Powered by Gemini AI</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {['summary', 'actions', 'deadlines'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'summary' && '📝 Summary'}
              {tab === 'actions' && '✅ Action Items'}
              {tab === 'deadlines' && '⏰ Deadlines'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">AI is analyzing your conversation...</p>
            </div>
          ) : (
            <>
              {activeTab === 'summary' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Meeting Summary</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-700 leading-relaxed">
                    {summary || 'No summary available. Start chatting to generate insights!'}
                  </div>
                  <button
                    onClick={() => saveToLocalStorage('summary', summary)}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    💾 Save Summary
                  </button>
                </div>
              )}

              {activeTab === 'actions' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Action Items</h3>
                  {actionItems.length > 0 ? (
                    <ul className="space-y-2">
                      {actionItems.map((item, index) => (
                        <li key={index} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                          <span className="text-green-600 font-bold">{index + 1}.</span>
                          <span className="flex-1 text-gray-700">{item}</span>
                          <button
                            onClick={() => saveToLocalStorage('action', item)}
                            className="text-green-600 hover:bg-green-100 p-1 rounded"
                            title="Save as task"
                          >
                            💾
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No action items detected yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'deadlines' && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Important Deadlines</h3>
                  {deadlines.length > 0 ? (
                    <ul className="space-y-2">
                      {deadlines.map((deadline, index) => (
                        <li key={index} className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                          <span className="text-2xl">🚨</span>
                          <span className="flex-1 text-gray-700">{deadline}</span>
                          <button
                            onClick={() => saveToLocalStorage('deadline', deadline)}
                            className="text-red-600 hover:bg-red-100 p-1 rounded"
                            title="Save deadline"
                          >
                            💾
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No deadlines detected yet.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-500">
            Analyzed {messages.length} messages
          </p>
          <button
            onClick={generateSummary}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            🔄 Refresh Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIWorkAssistant;
