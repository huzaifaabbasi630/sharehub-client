const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to   { opacity: 1; transform: scale(1); }
    }

    .fp-wrap {
      position: relative;
      background: rgba(13,18,40,0.95);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      overflow: hidden;
      max-width: 220px;
      animation: fadeIn 0.25s ease;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    /* Remove button */
    .fp-remove {
      position: absolute;
      top: -8px; right: -8px;
      width: 24px; height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      border: 2px solid #03050f;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      color: #fff;
      box-shadow: 0 2px 8px rgba(239,68,68,0.5);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 10;
    }
    .fp-remove:hover {
      transform: scale(1.15);
      box-shadow: 0 4px 14px rgba(239,68,68,0.7);
    }

    /* Image / video preview */
    .fp-media {
      width: 100%; height: 120px;
      object-fit: cover;
      display: block;
    }

    /* Media overlay gradient */
    .fp-media-overlay {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 40px;
      background: linear-gradient(to top, rgba(3,5,15,0.7), transparent);
      pointer-events: none;
    }

    /* File (non-media) */
    .fp-file {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
    }
    .fp-file-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: rgba(79,142,247,0.1);
      border: 1px solid rgba(79,142,247,0.2);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .fp-file-name {
      font-family: 'DM Sans', sans-serif;
      font-size: 12.5px; font-weight: 500;
      color: rgba(238,242,255,0.8);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      max-width: 120px;
    }
    .fp-file-size {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      color: rgba(148,163,184,0.45);
      margin-top: 2px;
    }
  `}</style>
);

function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  return (
    <>
      <S />
      <div className="fp-wrap">

        {/* Remove button */}
        <button className="fp-remove" onClick={onRemove}>
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Image preview */}
        {isImage && (
          <>
            <img src={URL.createObjectURL(file)} alt="Preview" className="fp-media" />
            <div className="fp-media-overlay" />
          </>
        )}

        {/* Video preview */}
        {isVideo && (
          <>
            <video src={URL.createObjectURL(file)} className="fp-media" controls />
            <div className="fp-media-overlay" />
          </>
        )}

        {/* Generic file */}
        {!isImage && !isVideo && (
          <div className="fp-file">
            <div className="fp-file-icon">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4f8ef7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="fp-file-name">{file.name}</p>
              <p className="fp-file-size">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default FilePreview;