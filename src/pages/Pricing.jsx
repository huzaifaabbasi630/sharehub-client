import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LightRays from '../components/LightRays';
import DraggableRefreshButton from '../components/DraggableRefreshButton';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 rooms',
      '5 participants per room',
      'Basic chat & file sharing',
      '1GB file storage',
      'Standard support'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$5',
    period: '/month',
    description: 'Best for professionals',
    features: [
      'Unlimited rooms',
      '25 participants per room',
      'Video & voice calls',
      'Screen sharing',
      '10GB file storage',
      'Priority support',
      'Room history'
    ],
    cta: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Business',
    price: '$15',
    period: '/month',
    description: 'For teams and businesses',
    features: [
      'Everything in Pro',
      '100 participants per room',
      'Admin dashboard',
      'Custom branding',
      '100GB file storage',
      '24/7 dedicated support',
      'API access',
      'SSO integration'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Simple, Transparent<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your needs. Upgrade or downgrade anytime.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Yearly <span className="text-green-400 text-xs">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white/10 backdrop-blur-sm border rounded-2xl p-8 transition-all hover:scale-[1.02] ${
                  plan.popular 
                    ? 'border-purple-500/50 shadow-2xl shadow-purple-500/20' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm">{plan.description}</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60">{plan.period}</span>
                  {billingCycle === 'yearly' && plan.price !== '$0' && (
                    <p className="text-green-400 text-sm mt-1">
                      ${parseInt(plan.price.slice(1)) * 10}/year
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-white/80">
                      <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.name === 'Business' ? alert('Contact sales coming soon!') : navigate('/create')}
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-purple-500/30'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 text-white/50 text-sm">
            All plans include SSL security and automatic updates. Cancel anytime.
          </div>
        </div>
      </div>
      
      {/* Refresh Button */}
      <DraggableRefreshButton onRefresh={() => window.location.reload()} />
    </div>
  );
}

export default Pricing;
