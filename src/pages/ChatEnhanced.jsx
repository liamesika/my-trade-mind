import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/useLanguage';
import { createChatService } from '../services/chatService';
import { useToasts } from '../services/toastService';
import { saveMentorToUser } from '../firebase/firebase-auth';
import LanguageToggle from '../components/LanguageToggle';
import MentorSelectionModal from '../components/MentorSelectionModal';
import MentorCharacter from '../components/MentorCharacter';
import '../styles/design-tokens.css';
import '../styles/chat-modern.css';

export default function ChatEnhanced() {
  const { user } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { error: showError, success: showSuccess } = useToasts();

  // Services
  const [chatService, setChatService] = useState(null);

  // State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [mentorSettings, setMentorSettings] = useState(null);
  const [showMentorSelection, setShowMentorSelection] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [characterAnimation, setCharacterAnimation] = useState('idle');

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize chat service
  useEffect(() => {
    if (user?.uid) {
      const cs = createChatService(user.uid);
      setChatService(cs);
    }
  }, [user]);

  // Check if user has mentor settings
  useEffect(() => {
    const checkMentorSettings = async () => {
      if (!chatService) return;

      try {
        const mentor = await chatService.getMentorSettings();
        if (mentor && mentor.mentorName) {
          setMentorSettings(mentor);
          initializeChat(mentor);
        } else {
          // First time user - show mentor selection
          setIsFirstTime(true);
          setShowMentorSelection(true);
        }
      } catch (error) {
        console.error('❌ Error checking mentor settings:', error);
        setIsFirstTime(true);
        setShowMentorSelection(true);
      }
    };

    checkMentorSettings();
  }, [chatService]);

  // Initialize chat with mentor
  const initializeChat = async (mentor) => {
    if (!chatService || !mentor) return;

    try {
      // Create a new chat session
      const sessionId = await chatService.createChatSession();
      setCurrentSessionId(sessionId);

      // Add welcome message
      const welcomeMessage = {
        id: 'welcome',
        content: getWelcomeMessage(mentor),
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Animate character for welcome
      setCharacterAnimation('talking');
      setTimeout(() => setCharacterAnimation('idle'), 3000);

    } catch (error) {
      console.error('❌ Error initializing chat:', error);
      showError('Failed to initialize chat');
    }
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatService || !currentSessionId) return;

    const unsubscribe = chatService.subscribeToMessages(currentSessionId, (newMessages) => {
      setMessages(newMessages);
      scrollToBottom();
    });

    return unsubscribe;
  }, [chatService, currentSessionId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = (mentor) => {
    const mentorName = mentor?.mentorName || mentor?.customName || mentor?.name || t('mentor.defaultName');
    return `Hi! I'm ${mentorName}, your personal trading mentor. I'm here to help you improve your trading skills, understand market dynamics, and develop winning strategies. What would you like to learn about today?`;
  };

  const handleMentorSelect = async (mentorData) => {
    try {
      // Save mentor to Firebase
      await saveMentorToUser(
        user.uid,
        mentorData.customName,
        mentorData.avatar,
        mentorData.type
      );

      // Update local state to match saved data structure
      const fullMentorData = {
        mentorName: mentorData.customName,
        mentorImg: mentorData.avatar,
        mentorType: mentorData.type,
        ...mentorData
      };
      
      setMentorSettings(fullMentorData);
      setShowMentorSelection(false);
      
      showSuccess(`${mentorData.customName} is now your trading mentor!`);
      
      // Initialize chat with new mentor
      await initializeChat(fullMentorData);
      
    } catch (error) {
      console.error('❌ Error saving mentor:', error);
      showError('Failed to save mentor settings');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatService || !currentSessionId || loading) return;

    const messageText = input.trim();
    setInput('');
    setLoading(true);
    
    // Animate character
    setCharacterAnimation('listening');

    try {
      // Send user message
      await chatService.sendMessage(currentSessionId, messageText, 'user');
      
      // Show thinking animation
      setCharacterAnimation('thinking');
      
      // Get AI response
      await chatService.getAIResponse(currentSessionId, messageText);
      
      // Show talking animation
      setCharacterAnimation('talking');
      setTimeout(() => setCharacterAnimation('idle'), 3000);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      showError('Failed to send message');
      setCharacterAnimation('idle');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return date.toLocaleTimeString(currentLanguage === 'he' ? 'he-IL' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMentorSettings = () => {
    setShowMentorSelection(true);
  };

  return (
    <div className="min-h-screen animated-bg text-white">
      {/* Animated Background Effects */}
      <div className="moving-grid"></div>
      <div className="floating-particles">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      {/* Header */}
      <header className="professional-header p-6 border-b border-gray-700 relative z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {mentorSettings && (
              <MentorCharacter 
                mentorSettings={mentorSettings} 
                animationState={characterAnimation}
                className="mr-4"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{t('chat.title')}</h1>
              <p className="text-gray-300">
                {mentorSettings 
                  ? `Chat with ${mentorSettings.mentorName || mentorSettings.customName}`
                  : t('chat.selectMentor')
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {mentorSettings && (
              <button
                onClick={openMentorSettings}
                className="action-btn p-2 rounded-lg"
                title={t('mentor.changeMentor')}
              >
                <i className="fas fa-cog"></i>
              </button>
            )}
            <LanguageToggle variant="header" />
          </div>
        </div>
      </header>

      {/* Back Navigation */}
      <nav className="app-nav border-b border-gray-700">
        <div className="app-nav__container max-w-6xl mx-auto">
          <Link to="/dashboard" className="app-nav__item">
            ← {t('common.back')} {t('nav.dashboard')}
          </Link>
        </div>
      </nav>

      {/* Main Chat Area */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-300px)]">
          
          {/* Chat Messages */}
          <div className="lg:col-span-3 metric-card rounded-xl flex flex-col">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                      : 'bg-gray-700/50 text-gray-100'
                  }`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700/50 text-gray-100 max-w-xs lg:max-w-md px-4 py-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex space-x-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={mentorSettings 
                    ? `Ask ${mentorSettings.mentorName || mentorSettings.customName} anything...`
                    : t('chat.placeholder')
                  }
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || !mentorSettings}
                  maxLength="500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading || !mentorSettings}
                  className="action-btn primary px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <span>{input.length}/500</span>
                <span>{t('chat.enterToSend')}</span>
              </div>
            </div>
          </div>

          {/* Mentor Sidebar */}
          <div className="space-y-4">
            {/* Mentor Info */}
            {mentorSettings && (
              <div className="metric-card p-6 rounded-xl text-center">
                <MentorCharacter 
                  mentorSettings={mentorSettings} 
                  animationState={characterAnimation}
                  className="mx-auto mb-4"
                />
                <div className="space-y-2">
                  <p className="text-gray-400 text-sm">{t('mentor.yourMentor')}</p>
                  <p className="font-semibold text-lg">{mentorSettings.mentorName || mentorSettings.customName}</p>
                  <p className="text-sm text-gray-500 capitalize">{mentorSettings.mentorType || mentorSettings.type} Mentor</p>
                </div>
                <button
                  onClick={openMentorSettings}
                  className="action-btn mt-4 px-4 py-2 rounded-lg text-sm"
                >
                  {t('mentor.changeMentor')}
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="metric-card p-6 rounded-xl">
              <h3 className="font-bold mb-4">{t('chat.quickActions')}</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setInput("What's the current market sentiment?")}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-sm"
                >
                  📈 Market Analysis
                </button>
                <button 
                  onClick={() => setInput("Help me create a trading strategy")}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-sm"
                >
                  🎯 Trading Strategy  
                </button>
                <button 
                  onClick={() => setInput("How do I manage risk better?")}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-sm"
                >
                  🛡️ Risk Management
                </button>
                <button 
                  onClick={() => setInput("Analyze my recent trades")}
                  className="w-full text-left px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-sm"
                >
                  📊 Performance Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Selection Modal */}
      <MentorSelectionModal
        isOpen={showMentorSelection}
        onClose={() => {
          if (!isFirstTime) setShowMentorSelection(false);
        }}
        onSelectMentor={handleMentorSelect}
      />
    </div>
  );
}