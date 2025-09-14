import React, { useState } from 'react';
import { useLanguage } from '../i18n/useLanguage';

const MENTOR_CHARACTERS = [
  {
    id: 'trading_boy',
    type: 'human',
    name: 'Alex',
    defaultName: 'Alex',
    avatar: '/image/ai-mentor/ai-man.png',
    personality: 'Experienced trading mentor',
    color: 'from-blue-500 to-purple-600',
    description: 'A experienced human trader who combines technical expertise with psychological insights and practical market experience.'
  },
  {
    id: 'trading_robot',
    type: 'robot',
    name: 'Robo',
    defaultName: 'Robo',
    avatar: '/image/ai-mentor/robot.png',
    personality: 'AI trading specialist',
    color: 'from-green-500 to-teal-600', 
    description: 'An advanced AI mentor focused on data-driven analysis, algorithmic strategies, and systematic trading approaches.'
  }
];

export default function MentorSelectionModal({ isOpen, onClose, onSelectMentor }) {
  const { t, isRTL } = useLanguage();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [customName, setCustomName] = useState('');
  const [step, setStep] = useState(1); // 1: Select character, 2: Customize name

  if (!isOpen) return null;

  const handleCharacterSelect = (mentor) => {
    setSelectedMentor(mentor);
    setCustomName(mentor.defaultName);
    setStep(2);
  };

  const handleConfirm = () => {
    if (selectedMentor && customName.trim()) {
      const mentorData = {
        ...selectedMentor,
        customName: customName.trim(),
        selectedAt: new Date()
      };
      onSelectMentor(mentorData);
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedMentor(null);
    setCustomName('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="glass-effect rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="professional-header p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {step === 1 ? t('mentor.selectCharacter') : t('mentor.customizeMentor')}
              </h2>
              <p className="text-gray-300">
                {step === 1 
                  ? t('mentor.chooseYourTradingMentor')
                  : t('mentor.personalizeYourMentor')
                }
              </p>
            </div>
            {step === 2 && (
              <button
                onClick={handleBack}
                className="action-btn p-2 rounded-lg mr-4"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
            )}
          </div>
        </div>

        {/* Step 1: Character Selection */}
        {step === 1 && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MENTOR_CHARACTERS.map((mentor) => (
                <div
                  key={mentor.id}
                  onClick={() => handleCharacterSelect(mentor)}
                  className="metric-card p-6 rounded-xl cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <div className="corner-glow"></div>
                  
                  {/* Character Avatar */}
                  <div className="text-center mb-4">
                    <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-r ${mentor.color} p-1 mb-4 shadow-lg`}>
                      <img 
                        src={mentor.avatar} 
                        alt={mentor.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{mentor.name}</h3>
                    <p className="text-sm text-gray-400 capitalize">
                      {mentor.type} • {mentor.personality}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 text-sm text-center leading-relaxed">
                    {mentor.description}
                  </p>

                  {/* Type Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      mentor.type === 'robot' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {mentor.type === 'robot' ? '🤖 AI' : '👤 Human-like'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Name Customization */}
        {step === 2 && selectedMentor && (
          <div className="p-8">
            <div className="max-w-md mx-auto text-center">
              {/* Selected Character Preview */}
              <div className="mb-8">
                <div className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-r ${selectedMentor.color} p-1 mb-4 shadow-lg animate-pulse`}>
                  <img 
                    src={selectedMentor.avatar}
                    alt={selectedMentor.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedMentor.name}</h3>
                <p className="text-gray-400">{selectedMentor.description}</p>
              </div>

              {/* Name Input */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-semibold mb-3">
                    {t('mentor.customName')}
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={selectedMentor.defaultName}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('mentor.nameHint')} (max 20 characters)
                  </p>
                </div>

                {/* Preview */}
                {customName.trim() && (
                  <div className="metric-card p-4 rounded-lg">
                    <p className="text-gray-400 text-sm mb-1">{t('mentor.preview')}:</p>
                    <p className="text-white">
                      "Hi! I'm <span className="font-bold text-blue-400">{customName.trim()}</span>, your trading mentor. Ready to improve your trading skills?"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button
                  onClick={onClose}
                  className="flex-1 action-btn px-6 py-3 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!customName.trim()}
                  className="flex-1 action-btn primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('mentor.startChatting')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}