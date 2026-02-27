import { useState, useRef, useEffect } from 'react';

const DraggableRefreshButton = ({ onRefresh, loading = false, cooldown = 0 }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownProgress, setCooldownProgress] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const buttonRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const initialPosRef = useRef({ x: 0, y: 0 });
  const cooldownIntervalRef = useRef(null);

  // Initialize position to bottom-right corner
  useEffect(() => {
    if (buttonRef.current && position.x === 0 && position.y === 0) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        x: window.innerWidth - rect.width - 24,
        y: window.innerHeight - rect.height - 24
      });
    }
  }, []);

  const handleMouseDown = (e) => {
    if (loading || isSpinning) return;
    
    setIsDragging(true);
    setHasDragged(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPosRef.current = { ...position };
    
    // Prevent text selection while dragging
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Check if actually dragged (more than 5px)
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasDragged(true);
    }
    
    setPosition({
      x: initialPosRef.current.x + deltaX,
      y: initialPosRef.current.y + deltaY
    });
  };

  const handleMouseUp = async () => {
    setIsDragging(false);
    
    // Only trigger refresh if not dragged (just clicked)
    if (!hasDragged) {
      await handleRefresh();
    }
  };

  const handleTouchStart = (e) => {
    if (loading || isSpinning) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setHasDragged(false);
    dragStartRef.current = { x: touch.clientX, y: touch.clientY };
    initialPosRef.current = { ...position };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartRef.current.x;
    const deltaY = touch.clientY - dragStartRef.current.y;
    
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasDragged(true);
    }
    
    setPosition({
      x: initialPosRef.current.x + deltaX,
      y: initialPosRef.current.y + deltaY
    });
  };

  const handleTouchEnd = async () => {
    setIsDragging(false);
    
    if (!hasDragged) {
      await handleRefresh();
    }
  };

  const handleRefresh = async () => {
    if (isCooldown) return;
    
    setIsSpinning(true);
    if (onRefresh) {
      await onRefresh();
    }
    
    // Start cooldown if specified
    if (cooldown > 0) {
      setIsCooldown(true);
      setCooldownProgress(100);
      
      const step = 100 / (cooldown / 100); // Update every 100ms
      let progress = 100;
      
      cooldownIntervalRef.current = setInterval(() => {
        progress -= step;
        setCooldownProgress(Math.max(0, progress));
        
        if (progress <= 0) {
          clearInterval(cooldownIntervalRef.current);
          setIsCooldown(false);
          setIsSpinning(false);
        }
      }, 100);
    } else {
      setTimeout(() => setIsSpinning(false), 500);
    }
  };
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  // Add global mouse/touch events for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, hasDragged, position]);

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      disabled={loading || isSpinning || isCooldown}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        background: isCooldown 
          ? `conic-gradient(#4f8ef7 ${cooldownProgress}%, rgba(79,142,247,0.3) ${cooldownProgress}%)`
          : 'linear-gradient(135deg, #4f8ef7, #6a5af7)',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : (loading || isSpinning || isCooldown ? 'not-allowed' : 'grab'),
        boxShadow: isDragging 
          ? '0 8px 30px rgba(79,142,247,0.6)' 
          : '0 4px 20px rgba(79,142,247,0.4)',
        transition: isDragging ? 'none' : 'all 0.3s ease',
        opacity: loading || isSpinning || isCooldown ? 0.7 : 1,
        zIndex: 10000,
        transform: isDragging ? 'scale(1.15)' : 'scale(1)',
      }}
      onMouseEnter={e => {
        if (!loading && !isSpinning && !isDragging) {
          e.currentTarget.style.boxShadow = '0 6px 30px rgba(79,142,247,0.6)';
        }
      }}
      onMouseLeave={e => {
        if (!isDragging) {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,142,247,0.4)';
        }
      }}
      title="Drag to move, Click to refresh"
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
      
      {/* Drag indicator dots */}
      <div style={{
        position: 'absolute',
        bottom: '4px',
        display: 'flex',
        gap: '2px',
        opacity: 0.6,
      }}>
        <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
        <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
        <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#fff' }} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default DraggableRefreshButton;
