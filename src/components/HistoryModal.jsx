import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HistoryModal = ({ onClose, user }) => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showSecurityCheck, setShowSecurityCheck] = useState(false);
  const [showContactCreator, setShowContactCreator] = useState(false);
  const [showGuestLogin, setShowGuestLogin] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load ALL room history from localStorage (no limit)
    const history = JSON.parse(localStorage.getItem('sharehub_room_history') || '[]');
    
    // Show ALL rooms (no demo rooms, no 3-room limit, no 15-day limit)
    setRooms(history);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleRoomClick = (room) => {
    // Check if user is guest
    if (user?.isGuest) {
      setShowGuestLogin(true);
      return;
    }

    setSelectedRoom(room);
    setError('');
    
    // Check if user is the creator
    const createdRooms = JSON.parse(localStorage.getItem('sharehub_created_rooms') || '[]');
    const isCreator = createdRooms.includes(room.code);

    if (isCreator) {
      // Creator must enter room code AND room name for security
      setShowSecurityCheck(true);
    } else {
      // Non-creator sees contact creator message
      setShowContactCreator(true);
    }
  };

  const handleSecurityCheck = () => {
    // Validate room code only
    if (roomCodeInput.toUpperCase() === selectedRoom.code) {
      // Save room data to localStorage for ChatRoom to restore
      const roomData = {
        code: selectedRoom.code,
        name: selectedRoom.name,
        _id: selectedRoom._id || selectedRoom.code,
        createdAt: selectedRoom.createdAt,
      };
      localStorage.setItem('sharehub_current_room', JSON.stringify(roomData));
      
      // Save user as host
      const userData = {
        name: user?.name || 'Host',
        isHost: true,
      };
      localStorage.setItem('sharehub_current_user', JSON.stringify(userData));
      
      // Navigate without page reload
      navigate(`/room/${selectedRoom.code}`, { replace: false });
      onClose();
    } else {
      setError('Invalid room code. Please try again.');
    }
  };

  const checkIsCreator = (roomCode) => {
    const createdRooms = JSON.parse(localStorage.getItem('sharehub_created_rooms') || '[]');
    return createdRooms.includes(roomCode);
  };

  const handleClearHistory = () => {
    localStorage.removeItem('sharehub_room_history');
    localStorage.removeItem('sharehub_created_rooms');
    setRooms([]);
    setShowClearConfirm(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '26px',
            fontWeight: '800',
            color: 'var(--text)',
            marginBottom: '8px',
          }}>
            📜 Room History
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--muted)', fontSize: '14px' }}>
            All your collaboration spaces
          </p>
        </div>

        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
            <p>No room history yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rooms.map((room) => (
              <div
                key={room.code}
                onClick={() => handleRoomClick(room)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 20px',
                  background: checkIsCreator(room.code) 
                    ? 'rgba(16,185,129,0.08)' 
                    : 'rgba(79,142,247,0.08)',
                  border: `1px solid ${checkIsCreator(room.code) 
                    ? 'rgba(16,185,129,0.2)' 
                    : 'rgba(79,142,247,0.2)'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = checkIsCreator(room.code) 
                    ? 'rgba(16,185,129,0.12)' 
                    : 'rgba(79,142,247,0.12)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = checkIsCreator(room.code) 
                    ? 'rgba(16,185,129,0.08)' 
                    : 'rgba(79,142,247,0.08)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: checkIsCreator(room.code) 
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : 'linear-gradient(135deg, var(--accent1), #6a5af7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Syne', sans-serif",
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#fff',
                }}>
                  {room.name.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}>
                    {room.name}
                  </h3>
                  <p style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--muted)',
                  }}>
                    Code: <span style={{ color: 'var(--accent1)', fontFamily: 'monospace' }}>{room.code}</span> • Created {formatDate(room.createdAt)}
                  </p>
                </div>

                {checkIsCreator(room.code) ? (
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    padding: '4px 10px',
                    background: 'rgba(16,185,129,0.15)',
                    color: '#10b981',
                    borderRadius: '20px',
                  }}>
                    You Created
                  </span>
                ) : (
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    padding: '4px 10px',
                    background: 'rgba(79,142,247,0.15)',
                    color: '#4f8ef7',
                    borderRadius: '20px',
                  }}>
                    Joined
                  </span>
                )}

                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="var(--muted)" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Clear History Button */}
        {rooms.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '12px',
              marginTop: '20px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '12px',
              color: '#ef4444',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear History
          </button>
        )}

        <p style={{
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '12px',
          color: 'var(--muted)',
          marginTop: '16px',
        }}>
          Click on a room to access it • Green = You created • Blue = You joined
        </p>
      </div>

      {/* Security Check Modal - For Creators */}
      {showSecurityCheck && selectedRoom && (
        <div className="modal-backdrop" onClick={() => setShowSecurityCheck(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <button className="close-btn" onClick={() => setShowSecurityCheck(false)}>×</button>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '20px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '8px',
              }}>
                Security Verification
              </h3>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: 'var(--muted)',
              }}>
                Enter room details to verify you're the creator
              </p>
            </div>

            <div style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--muted)',
                marginBottom: '4px',
              }}>
                Room:
              </p>
              <p style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: '16px',
                fontWeight: '700',
                color: '#10b981',
              }}>
                {selectedRoom.name}
              </p>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
                color: '#ef4444',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <input
              type="text"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              placeholder="Enter room code (e.g., ABC123)"
              style={{
                width: '100%',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'var(--text)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '15px',
                marginBottom: '16px',
                textAlign: 'center',
                letterSpacing: '2px',
              }}
            />

            <button
              className="sh-btn-primary"
              onClick={handleSecurityCheck}
              style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              Enter Room
            </button>

            <p style={{
              textAlign: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--muted)',
              marginTop: '12px',
            }}>
              Enter room code to access
            </p>
          </div>
        </div>
      )}

      {/* Contact Creator Modal - For Non-Creators */}
      {showContactCreator && selectedRoom && (
        <div className="modal-backdrop" onClick={() => setShowContactCreator(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setShowContactCreator(false)}>×</button>

            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📞</div>
            
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '12px',
            }}>
              Contact Room Creator
            </h3>
            
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--muted)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              You joined this room previously, but for security reasons, you need the creator's permission to re-enter.
            </p>

            <div style={{
              background: 'rgba(79,142,247,0.08)',
              border: '1px solid rgba(79,142,247,0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              textAlign: 'left',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--muted)',
                marginBottom: '8px',
              }}>
                Room Details:
              </p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: 'var(--text)',
              }}>
                <strong>Name:</strong> {selectedRoom.name}<br />
                <strong>Code:</strong> {selectedRoom.code}<br />
                <strong>Last accessed:</strong> {formatDate(selectedRoom.createdAt)}
              </p>
            </div>

            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#fbbf24',
                lineHeight: '1.5',
              }}>
                📧 Please contact the room creator and ask them to:<br />
                1. Share the room link with you again, or<br />
                2. Provide you with the room code
              </p>
            </div>

            <button
              className="sh-btn-primary"
              onClick={() => {
                // Send join request
                const requests = JSON.parse(localStorage.getItem('sharehub_join_requests') || '[]');
                const requestId = Date.now().toString();
                requests.push({
                  requestId,
                  roomCode: selectedRoom.code.toUpperCase(),
                  roomName: selectedRoom.name,
                  userName: user?.name || 'User',
                  userId: user?.id || requestId,
                  timestamp: new Date().toISOString(),
                  status: 'pending'
                });
                localStorage.setItem('sharehub_join_requests', JSON.stringify(requests));
                
                // Trigger storage event for same-tab notification
                window.dispatchEvent(new StorageEvent('storage', {
                  key: 'sharehub_join_requests',
                  newValue: JSON.stringify(requests)
                }));
                
                alert('Join request sent to room creator!');
                setShowContactCreator(false);
              }}
              style={{ width: '100%', marginBottom: '12px' }}
            >
              Send Join Request
            </button>

            <button
              onClick={() => setShowContactCreator(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Guest Login Modal */}
      {showGuestLogin && (
        <div className="modal-backdrop" onClick={() => setShowGuestLogin(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <button className="close-btn" onClick={() => setShowGuestLogin(false)}>×</button>

            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
            
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '12px',
            }}>
              Please Login First
            </h3>
            
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--muted)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Guest users cannot access room history. Please login or create an account to view your room history.
            </p>

            <button
              className="sh-btn-primary"
              onClick={() => {
                setShowGuestLogin(false);
                onClose();
                // Navigate to login
                window.location.href = '/login';
              }}
              style={{ width: '100%' }}
            >
              Go to Login
            </button>

            <button
              onClick={() => setShowGuestLogin(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                marginTop: '12px',
                cursor: 'pointer',
              }}
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}

      {/* Clear History Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-backdrop" onClick={() => setShowClearConfirm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            
            <h3 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: '22px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '12px',
            }}>
              Clear History?
            </h3>
            
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: 'var(--muted)',
              marginBottom: '24px',
              lineHeight: '1.6',
            }}>
              Are you sure you want to clear all your room history? This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'var(--muted)',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleClearHistory}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(239,68,68,0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryModal;
