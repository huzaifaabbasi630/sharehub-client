import { useNavigate } from 'react-router-dom';
import LightRays from '../components/LightRays';
import DraggableRefreshButton from '../components/DraggableRefreshButton';

const features = [
  {
    icon: '💬',
    title: 'Real-time Chat',
    description: 'Instant messaging with typing indicators and read receipts. Chat seamlessly with your team members.'
  },
  {
    icon: '📁',
    title: 'File Sharing',
    description: 'Share files of any type securely. Drag and drop to upload and download with ease.'
  },
  {
    icon: '📹',
    title: 'Video Calls',
    description: 'Crystal clear video conferencing with screen sharing capabilities for better collaboration.'
  },
  {
    icon: '🎙️',
    title: 'Voice Calls',
    description: 'High-quality voice calls for when video is not needed. Stay connected always.'
  },
  {
    icon: '🔒',
    title: 'Secure Rooms',
    description: 'Create private rooms with unique codes. Approve who joins for maximum security.'
  },
  {
    icon: '📱',
    title: 'Cross Platform',
    description: 'Access from any device - desktop, tablet, or mobile. Your workspace follows you.'
  },
  {
    icon: '🌐',
    title: 'No Installation',
    description: 'Works directly in your browser. No downloads or installations required.'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Optimized for speed with real-time synchronization across all connected devices.'
  }
];

function Features() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <LightRays
        raysOrigin="top-center"
        raysColor="#8b5cf6"
        raysSpeed={0.3}
        lightSpread={0.8}
        rayLength={2.5}
        followMouse={true}
        mouseInfluence={0.15}
        saturation={0.9}
        fadeDistance={2}
      />
      
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <nav className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">ShareHub</span>
              </button>
              <button 
                onClick={() => navigate('/')}
                className="text-white/80 hover:text-white transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Seamless Collaboration
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to communicate and collaborate with your team in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 hover:scale-[1.02] transition-all group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Refresh Button */}
      <DraggableRefreshButton onRefresh={() => window.location.reload()} />
    </div>
  );
}

export default Features;
