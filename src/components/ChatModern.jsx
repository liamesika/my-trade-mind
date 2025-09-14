import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/useLanguage';
import { createChatService } from '../services/chatService';
import { useToasts } from '../services/toastService';
import LanguageToggle from './LanguageToggle';
import '../styles/design-tokens.css';
import '../styles/chat-modern.css';

export default function ChatModern() {
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

  // Load mentor settings and create session
  useEffect(() => {
    if (!chatService) return;

    const initializeChat = async () => {
      try {
        // Load mentor settings
        const mentor = await chatService.getMentorSettings();
        setMentorSettings(mentor);

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

      } catch (error) {
        console.error('❌ Error initializing chat:', error);
        showError('Failed to initialize chat');
      }
    };

    initializeChat();
  }, [chatService]);

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
    const mentorName = mentor?.mentorName || t('mentor.nameLabel');
    const welcomeMsg = t('chat.welcomeMessage');
    
    return welcomeMsg.replace('{name}', mentorName);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatService || !currentSessionId || loading) return;

    const messageText = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Send user message - the AI response will be triggered automatically
      await chatService.sendMessage(currentSessionId, messageText, 'user');
      
      // Get AI response
      await chatService.getAIResponse(currentSessionId, messageText);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      showError('Failed to send message');
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

  return (
    <div className="chat-modern">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__content">
          <div className="chat-header__left">
            <div className="mentor-info">
              {mentorSettings?.mentorImg && (
                <img 
                  src={mentorSettings.mentorImg} 
                  alt={mentorSettings.mentorName}
                  className="mentor-avatar"
                />
              )}
              <div>
                <h1 className="chat-title">{t('chat.title')}</h1>
                <p className="chat-subtitle">{t('chat.privateSubtitle')}</p>
              </div>
            </div>
          </div>
          
          <div className="chat-header__right">
            <LanguageToggle variant="header" />
          </div>
        </div>
      </header>

      {/* App Navigation */}
      <nav className="app-nav">
        <div className="app-nav__container">
          <Link to="/dashboard" className="app-nav__item">
            📊 {t('nav.dashboard')}
          </Link>
          <Link to="/journal" className="app-nav__item">
            📝 {t('nav.journal')}
          </Link>
          <Link to="/chat" className="app-nav__item app-nav__item--active">
            🤖 {t('nav.mentor')}
          </Link>
        </div>
      </nav>

      {/* Messages */}
      <div className="chat-messages">
        <div className="messages-container">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message message--${message.sender} animate-fade-in`}
            >
              <div className="message__content">
                <div className="message__bubble">
                  <p className="message__text">{message.content}</p>
                  <span className="message__timestamp">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="message message--assistant animate-fade-in">
              <div className="message__content">
                <div className="message__bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="chat-input">
        <div className="chat-input__container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.placeholder')}
              className="message-input"
              rows="1"
              maxLength="2000"
              disabled={loading}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="send-button"
              aria-label={t('chat.send')}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 21L23 12L2 3V10L17 12L2 14V21Z" 
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          
          <div className="input-footer">
            <span className="character-count">
              {input.length}/2000
            </span>
            <span className="input-hint">
              {t('chat.placeholder')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}