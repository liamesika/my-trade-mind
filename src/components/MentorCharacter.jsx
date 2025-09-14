import React, { useState, useEffect } from 'react';


const IDLE_ANIMATIONS = [
  { transform: 'scale(1) rotate(0deg)', duration: '3s' },
  { transform: 'scale(1.05) rotate(1deg)', duration: '3s' },
  { transform: 'scale(1) rotate(-0.5deg)', duration: '3s' },
  { transform: 'scale(1.02) rotate(0deg)', duration: '3s' }
];

export default function MentorCharacter({ mentorSettings, animationState = 'idle', className = '' }) {
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (animationState === 'idle') {
      const interval = setInterval(() => {
        setCurrentAnimation(prev => (prev + 1) % IDLE_ANIMATIONS.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [animationState]);

  useEffect(() => {
    if (animationState === 'thinking' || animationState === 'talking') {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animationState]);

  if (!mentorSettings) return null;

  const getAnimationClass = () => {
    switch (animationState) {
      case 'thinking':
        return 'animate-pulse';
      case 'talking':
        return 'animate-bounce';
      case 'listening':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const getGlowColor = () => {
    switch (animationState) {
      case 'thinking':
        return 'shadow-yellow-400/50';
      case 'talking':
        return 'shadow-blue-400/50';
      case 'listening':
        return 'shadow-green-400/50';
      default:
        return 'shadow-purple-400/30';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background Glow */}
      <div className={`absolute inset-0 rounded-full blur-xl ${getGlowColor()} transition-all duration-500`}></div>
      
      {/* Main Character Container */}
      <div className="relative">
        {/* Sparkles Effect */}
        {showSparkles && (
          <div className="absolute -inset-4 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${20 + (i * 15)}%`,
                  top: `${10 + (i * 10)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}

        {/* Character Avatar */}
        <div 
          className={`w-24 h-24 rounded-full bg-gradient-to-r ${mentorSettings.color} p-1 shadow-2xl ${getAnimationClass()} transition-all duration-300 relative overflow-hidden`}
          style={animationState === 'idle' ? {
            transform: IDLE_ANIMATIONS[currentAnimation].transform,
            transition: `transform ${IDLE_ANIMATIONS[currentAnimation].duration} ease-in-out`
          } : {}}
        >
          {/* Avatar Image */}
          <img 
            src={mentorSettings.mentorImg || mentorSettings.avatar || '/image/ai-mentor/robot.png'}
            alt={mentorSettings.mentorName || mentorSettings.customName || mentorSettings.name}
            className="w-full h-full object-cover rounded-full relative z-10"
          />

          {/* Animated Border */}
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin-slow"></div>
          
          {/* Inner Glow */}
          <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm"></div>
        </div>

        {/* Character Info */}
        <div className="text-center mt-3">
          <p className="text-white font-semibold text-sm">
            {mentorSettings.mentorName || mentorSettings.customName || mentorSettings.name}
          </p>
          <p className="text-gray-400 text-xs capitalize">
            {mentorSettings.mentorType || mentorSettings.type} mentor
          </p>
        </div>

        {/* Status Indicator */}
        <div className="absolute -top-1 -right-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            animationState === 'thinking' ? 'bg-yellow-500' :
            animationState === 'talking' ? 'bg-blue-500' :
            animationState === 'listening' ? 'bg-green-500' :
            'bg-gray-500'
          } shadow-lg`}>
            {animationState === 'thinking' && '🤔'}
            {animationState === 'talking' && '💬'}
            {animationState === 'listening' && '👂'}
            {animationState === 'idle' && '😊'}
          </div>
        </div>
      </div>

      {/* Speech Bubble (when talking) */}
      {animationState === 'talking' && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-lg text-xs font-medium shadow-lg animate-fade-in">
          Thinking...
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white/90"></div>
        </div>
      )}

      {/* Pulse Ring */}
      {(animationState === 'listening' || animationState === 'thinking') && (
        <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping"></div>
      )}
    </div>
  );
}

// Add custom CSS for slow spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 8s linear infinite;
  }
  @keyframes fade-in {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;
if (!document.head.querySelector('[data-mentor-styles]')) {
  style.setAttribute('data-mentor-styles', 'true');
  document.head.appendChild(style);
}