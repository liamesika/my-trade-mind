// Restored Original Dashboard with Working Functionality
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/useLanguage';
import { createTradeService, createStatsService } from '../services/tradeService';
import { useToasts } from '../services/toastService';
import TradeModal from '../components/TradeModal';
import DailyJournalModal from '../components/DailyJournalModal';
import CalendarWithJournal from '../components/CalendarWithJournal';
import LanguageToggle from '../components/LanguageToggle';
import '../styles/design-tokens.css';
import '../styles/dashboard-original.css';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t, currentLanguage, isRTL } = useLanguage();
  const { error: showError, success: showSuccess } = useToasts();

  // Services
  const [tradeService, setTradeService] = useState(null);
  const [statsService, setStatsService] = useState(null);

  // State
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isDailyJournalModalOpen, setIsDailyJournalModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentSection, setCurrentSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Refs
  const sidebarRef = useRef(null);

  // Initialize services
  useEffect(() => {
    if (user?.uid) {
      const ts = createTradeService(user.uid);
      const ss = createStatsService(user.uid);
      setTradeService(ts);
      setStatsService(ss);
    }
  }, [user]);

  // Load trades and stats
  useEffect(() => {
    const loadData = async () => {
      if (!tradeService || !statsService) return;

      try {
        const [tradesData, statsData] = await Promise.all([
          tradeService.getTrades({ limit: 10 }),
          statsService.getStats()
        ]);
        
        setTrades(tradesData);
        setStats(statsData);
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
      }
    };

    loadData();
  }, [tradeService, statsService, showError]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setIsDailyJournalModalOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const showSection = (sectionId) => {
    setCurrentSection(sectionId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Sign out error:', error);
      showError('Failed to sign out');
    }
  };

  // Calculate win rate for display
  const winRate = stats ? Math.round(stats.winRate) : 0;
  const totalPnL = stats ? stats.totalPnL : 0;

  return (
    <div className="min-h-screen animated-bg text-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Animated Background Effects */}
      <div className="moving-grid"></div>
      <div className="floating-particles">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 right-4 z-50 action-btn p-2 rounded-lg"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-80 glass-effect p-6 transform transition-transform duration-300 z-40 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-white"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold">TradeMind</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <LanguageToggle variant="sidebar" />
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => showSection('overview')}
            className={`sidebar-item w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
              currentSection === 'overview' ? 'active' : ''
            }`}
          >
            <i className="fas fa-home"></i>
            <span>{t('nav.overview')}</span>
          </button>
          
          <button
            onClick={() => showSection('analytics')}
            className={`sidebar-item w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
              currentSection === 'analytics' ? 'active' : ''
            }`}
          >
            <i className="fas fa-chart-area"></i>
            <span>{t('nav.analytics')}</span>
          </button>

          <Link
            to="/journal"
            className="sidebar-item w-full text-left p-3 rounded-lg flex items-center space-x-3 block"
          >
            <i className="fas fa-book"></i>
            <span>{t('nav.journal')}</span>
          </Link>

          <Link
            to="/chat"
            className="sidebar-item w-full text-left p-3 rounded-lg flex items-center space-x-3 block"
          >
            <i className="fas fa-robot"></i>
            <span>{t('nav.mentor')}</span>
          </Link>

          <button
            onClick={() => showSection('settings')}
            className={`sidebar-item w-full text-left p-3 rounded-lg flex items-center space-x-3 ${
              currentSection === 'settings' ? 'active' : ''
            }`}
          >
            <i className="fas fa-cog"></i>
            <span>{t('nav.settings')}</span>
          </button>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-700">
          <button
            onClick={handleSignOut}
            className="sidebar-item w-full text-left p-3 rounded-lg flex items-center space-x-3 text-red-400 hover:text-red-300"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>{t('auth.signOut')}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'md:mr-80' : 'md:mr-80'} p-6`}>
        {/* Overview Section */}
        {currentSection === 'overview' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="professional-header p-6 rounded-xl">
              <h1 className="text-4xl font-bold mb-2">
                {t('dashboard.welcome')} {user?.displayName || user?.email}
              </h1>
              <p className="text-gray-300">{t('dashboard.subtitle')}</p>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setIsTradeModalOpen(true)}
                  className="action-btn primary px-6 py-3 rounded-lg flex items-center space-x-2"
                >
                  <i className="fas fa-plus"></i>
                  <span>{t('trades.addTrade')}</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="metric-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('stats.totalTrades')}</p>
                    <p className="text-3xl font-bold metric-number">
                      {stats?.totalTrades || 0}
                    </p>
                  </div>
                  <div className="emotion-indicator w-12 h-12 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-blue-400"></i>
                  </div>
                </div>
              </div>

              <div className="metric-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('stats.winRate')}</p>
                    <p className="text-3xl font-bold metric-number">{winRate}%</p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="win-rate-progress h-2 rounded-full transition-all duration-500"
                        style={{ width: `${winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="metric-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('stats.totalPnL')}</p>
                    <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                      ${Math.abs(totalPnL).toLocaleString()}
                    </p>
                  </div>
                  <div className="glow-face">
                    <span className="emotion-face">
                      {totalPnL >= 0 ? '😊' : '😔'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="metric-card p-6 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{t('stats.avgTrade')}</p>
                    <p className="text-3xl font-bold metric-number">
                      ${Math.abs(stats?.avgPnL || 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="emotion-indicator w-12 h-12 rounded-full flex items-center justify-center">
                    <i className="fas fa-calculator text-purple-400"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar and Recent Trades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Calendar */}
              <div className="metric-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-6 metric-number">
                  {t('dashboard.tradingCalendar')}
                </h3>
                <CalendarWithJournal
                  currentUser={user}
                  currentDate={selectedDate}
                  onDayClick={handleDayClick}
                />
              </div>

              {/* Recent Trades */}
              <div className="metric-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-6 metric-number">
                  {t('dashboard.recentTrades')}
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {trades.length > 0 ? (
                    trades.map((trade) => (
                      <div key={trade.id} className="trade-item p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{trade.symbol}</p>
                            <p className="text-sm text-gray-400">
                              {trade.side} • {trade.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${
                              parseFloat(trade.pnl) >= 0 ? 'profit-positive' : 'profit-negative'
                            }`}>
                              {parseFloat(trade.pnl) >= 0 ? '+' : ''}${parseFloat(trade.pnl).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(trade.timestamp?.toDate ? trade.timestamp.toDate() : trade.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="fas fa-chart-line text-4xl mb-4 opacity-50"></i>
                      <p>{t('trades.noTrades')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {currentSection === 'analytics' && (
          <div className="space-y-8">
            <div className="professional-header p-6 rounded-xl">
              <h1 className="text-4xl font-bold mb-2">{t('nav.analytics')}</h1>
              <p className="text-gray-300">{t('dashboard.analyticsSubtitle')}</p>
            </div>
            
            <div className="metric-card p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-6 metric-number">
                {t('dashboard.performanceMetrics')}
              </h3>
              <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">
                  {t('dashboard.chartPlaceholder')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Settings Section */}
        {currentSection === 'settings' && (
          <div className="space-y-8">
            <div className="professional-header p-6 rounded-xl">
              <h1 className="text-4xl font-bold mb-2">{t('nav.settings')}</h1>
              <p className="text-gray-300">{t('dashboard.settingsSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="metric-card p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-6 metric-number">
                  {t('settings.general')}
                </h3>
                <div className="space-y-4">
                  <div className="setting-item">
                    <div className="flex justify-between items-center">
                      <span>{t('settings.language')}</span>
                      <LanguageToggle variant="toggle" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />
      
      <DailyJournalModal
        isOpen={isDailyJournalModalOpen}
        onClose={() => setIsDailyJournalModalOpen(false)}
        currentDate={selectedDate}
      />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}