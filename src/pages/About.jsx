import { useNavigate } from 'react-router-dom';
import LightRays from '../components/LightRays';
import DraggableRefreshButton from '../components/DraggableRefreshButton';

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Rooms Created' },
  { value: '1M+', label: 'Messages Sent' },
  { value: '99.9%', label: 'Uptime' }
];

const team = [
  { name: 'Alex Chen', role: 'Founder & CEO', avatar: 'AC' },
  { name: 'Sarah Miller', role: 'Head of Product', avatar: 'SM' },
  { name: 'James Wilson', role: 'Lead Developer', avatar: 'JW' },
  { name: 'Emily Zhang', role: 'Design Lead', avatar: 'EZ' }
];

function About() {
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
          {/* Hero */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              About <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">ShareHub</span>
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              We're on a mission to make real-time collaboration simple, secure, and accessible to everyone.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Story</h2>
              <p className="text-white/70 mb-4 leading-relaxed">
                ShareHub was born from a simple idea: communication should be effortless. Founded in 2024, 
                we set out to create a platform that brings people together without the complexity.
              </p>
              <p className="text-white/70 mb-4 leading-relaxed">
                What started as a small project has grown into a platform used by thousands of teams 
                worldwide. From startups to enterprises, ShareHub helps people collaborate in real-time.
              </p>
              <p className="text-white/70 leading-relaxed">
                We believe in privacy-first design, lightning-fast performance, and making technology 
                work for people, not the other way around.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Our Values</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Privacy First</h4>
                    <p className="text-white/60 text-sm">Your data belongs to you, period.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-400 text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Simplicity</h4>
                    <p className="text-white/60 text-sm">Powerful features, simple interface.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-400 text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Reliability</h4>
                    <p className="text-white/60 text-sm">Always on, always fast.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Team */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Meet the Team</h2>
            <p className="text-white/70">The people behind ShareHub</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                <p className="text-white/60 text-sm">{member.role}</p>
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

export default About;
