import { useState } from 'react';

const RefreshButton = ({ onRefresh, loading = false }) => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = async () => {
    setIsSpinning(true);
    if (onRefresh) {
      await onRefresh();
    } else {
      // Default behavior: reload current page data
      window.location.reload();
    }
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || isSpinning}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #4f8ef7, #6a5af7)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: loading || isSpinning ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 20px rgba(79,142,247,0.4)',
        transition: 'all 0.3s ease',
        opacity: loading || isSpinning ? 0.7 : 1,
        zIndex: 1000,
      }}
      onMouseEnter={e => {
        if (!loading && !isSpinning) {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(79,142,247,0.6)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,142,247,0.4)';
      }}
      title="Refresh Page"
    >
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          animation: isSpinning ? 'spin 0.8s linear infinite' : 'none',
        }}
      >
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default RefreshButton;
