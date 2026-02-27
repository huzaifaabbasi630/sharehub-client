import { useState, useEffect } from 'react';

const SmartFileOrganizer = ({ files, onOrganize, isVisible, onClose }) => {
  const [organizedFiles, setOrganizedFiles] = useState({});
  const [duplicates, setDuplicates] = useState([]);
  const [oldFiles, setOldFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('folders');

  const analyzeFiles = () => {
    setLoading(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      // Group files by type
      const grouped = files.reduce((acc, file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        let category = 'Others';
        
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) category = 'Images';
        else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) category = 'Documents';
        else if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(ext)) category = 'Videos';
        else if (['mp3', 'wav', 'aac', 'flac'].includes(ext)) category = 'Audio';
        else if (['zip', 'rar', '7z', 'tar'].includes(ext)) category = 'Archives';
        else if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'py', 'java'].includes(ext)) category = 'Code';
        else if (['xls', 'xlsx', 'csv'].includes(ext)) category = 'Spreadsheets';
        else if (['ppt', 'pptx'].includes(ext)) category = 'Presentations';
        
        if (!acc[category]) acc[category] = [];
        acc[category].push(file);
        return acc;
      }, {});

      // Find duplicates (by name and size)
      const fileMap = new Map();
      const dups = [];
      
      files.forEach(file => {
        const key = `${file.name}_${file.size}`;
        if (fileMap.has(key)) {
          dups.push(file);
        } else {
          fileMap.set(key, file);
        }
      });

      // Find old files (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const old = files.filter(file => {
        const fileDate = new Date(file.timestamp || file.createdAt || Date.now());
        return fileDate.getTime() < thirtyDaysAgo;
      });

      setOrganizedFiles(grouped);
      setDuplicates(dups);
      setOldFiles(old);
      setLoading(false);
    }, 1500);
  };

  useEffect(() => {
    if (isVisible && files.length > 0) {
      analyzeFiles();
    }
  }, [isVisible, files]);

  const handleOrganize = () => {
    onOrganize(organizedFiles);
    alert('Files organized successfully!');
    onClose();
  };

  const handleDeleteDuplicates = () => {
    const confirmDelete = window.confirm(`Delete ${duplicates.length} duplicate files?`);
    if (confirmDelete) {
      // Remove duplicates from the list
      const remainingFiles = files.filter(f => !duplicates.includes(f));
      onOrganize(remainingFiles);
      setDuplicates([]);
      alert('Duplicates removed!');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📁</span>
              <div>
                <h2 className="text-xl font-bold">Smart File Organizer</h2>
                <p className="text-sm opacity-80">AI-powered file management</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50">
          <div className="bg-white p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">{files.length}</p>
            <p className="text-xs text-gray-500">Total Files</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">{Object.keys(organizedFiles).length}</p>
            <p className="text-xs text-gray-500">Categories</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-red-600">{duplicates.length}</p>
            <p className="text-xs text-gray-500">Duplicates</p>
          </div>
          <div className="bg-white p-3 rounded-xl text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-600">{oldFiles.length}</p>
            <p className="text-xs text-gray-500">Old Files</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {['folders', 'duplicates', 'old'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 font-medium capitalize transition-colors ${
                activeTab === tab 
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'folders' && '📂 Auto Folders'}
              {tab === 'duplicates' && '🔍 Duplicates'}
              {tab === 'old' && '⏰ Old Files'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[40vh]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">AI is analyzing your files...</p>
            </div>
          ) : (
            <>
              {activeTab === 'folders' && (
                <div className="space-y-4">
                  {Object.entries(organizedFiles).map(([category, categoryFiles]) => (
                    <div key={category} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          {category === 'Images' && '🖼️'}
                          {category === 'Documents' && '📄'}
                          {category === 'Videos' && '🎬'}
                          {category === 'Audio' && '🎵'}
                          {category === 'Archives' && '📦'}
                          {category === 'Code' && '💻'}
                          {category === 'Spreadsheets' && '📊'}
                          {category === 'Presentations' && '📽️'}
                          {category === 'Others' && '📎'}
                          {category}
                        </h3>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {categoryFiles.length} files
                        </span>
                      </div>
                      <div className="space-y-1">
                        {categoryFiles.slice(0, 3).map((file, idx) => (
                          <p key={idx} className="text-sm text-gray-600 truncate pl-4">• {file.name}</p>
                        ))}
                        {categoryFiles.length > 3 && (
                          <p className="text-sm text-gray-400 pl-4">+ {categoryFiles.length - 3} more...</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'duplicates' && (
                <div>
                  {duplicates.length > 0 ? (
                    <>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                        <p className="text-red-700">
                          Found {duplicates.length} duplicate files that can be removed to save space.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {duplicates.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-red-500">🔴</span>
                              <span className="text-gray-700">{file.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleDeleteDuplicates}
                        className="mt-4 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        🗑️ Remove Duplicates
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-6xl">✅</span>
                      <p className="mt-4 text-gray-600">No duplicate files found!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'old' && (
                <div>
                  {oldFiles.length > 0 ? (
                    <>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                        <p className="text-orange-700">
                          Found {oldFiles.length} files older than 30 days.
                        </p>
                      </div>
                      <div className="space-y-2">
                        {oldFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-orange-500">⏰</span>
                              <span className="text-gray-700">{file.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(file.timestamp || file.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <span className="text-6xl">🎉</span>
                      <p className="mt-4 text-gray-600">No old files found!</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={analyzeFiles}
            disabled={loading}
            className="text-gray-600 hover:text-gray-800 px-4 py-2"
          >
            🔄 Re-analyze
          </button>
          {activeTab === 'folders' && (
            <button
              onClick={handleOrganize}
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              📁 Organize Files
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartFileOrganizer;
