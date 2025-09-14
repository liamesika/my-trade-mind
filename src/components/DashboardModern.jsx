import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/useLanguage';
import { createTradeService, createStatsService } from '../services/tradeService';
import { useToasts } from '../services/toastService';
import TradeModal from './TradeModal';
import DailyJournalModal from './DailyJournalModal';
import CalendarWithJournal from './CalendarWithJournal';
import LanguageToggle from './LanguageToggle';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import '../styles/design-tokens.css';
import '../styles/dashboard-modern.css';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  CategoryScale,
  Tooltip,
  Legend
);

export default function DashboardModern() {
  const { user, signOut } = useAuth();
  const { t, currentLanguage, isRTL } = useLanguage();
  const { error: showError, success: showSuccess } = useToasts();

  // Services
  const [tradeService, setTradeService] = useState(null);
  const [statsService, setStatsService] = useState(null);

  // State
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isDailyJournalModalOpen, setIsDailyJournalModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  // Chart reference
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Initialize services when user is available
  useEffect(() => {
    if (user?.uid) {
      const ts = createTradeService(user.uid);
      const ss = createStatsService(user.uid);
      setTradeService(ts);
      setStatsService(ss);
    }
  }, [user]);

  // Subscribe to real-time trades updates
  useEffect(() => {
    if (!tradeService) return;

    let unsubscribe;
    
    const setupSubscription = async () => {
      try {
        unsubscribe = tradeService.subscribeToTrades((updatedTrades) => {
          console.log('📊 Trades updated:', updatedTrades.length);
          setTrades(updatedTrades);
          
          // Update stats when trades change
          if (statsService) {
            statsService.updateStats(updatedTrades).then(newStats => {
              setStats(newStats);
            });
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.error('❌ Error setting up trades subscription:', error);
        showError('Failed to load trades data');
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tradeService, statsService]);

  // Update chart when stats change
  useEffect(() => {
    if (stats && chartRef.current) {
      updateChart();
    }
  }, [stats, currentLanguage]);

  const updateChart = () => {
    if (!chartRef.current || !stats) return;

    const ctx = chartRef.current.getContext('2d');
    
    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Prepare monthly P&L data
    const monthlyData = Object.entries(stats.monthlyPnL || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12); // Last 12 months

    const labels = monthlyData.map(([month]) => {
      const date = new Date(month + '-01');
      return date.toLocaleDateString(currentLanguage === 'he' ? 'he-IL' : 'en-US', {
        month: 'short',
        year: 'numeric'
      });
    });

    const data = monthlyData.map(([, pnl]) => pnl);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: t('dashboard.monthlyPnL'),
          data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            rtl: isRTL,
            textDirection: isRTL ? 'rtl' : 'ltr'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat(currentLanguage === 'he' ? 'he-IL' : 'en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                }).format(value);
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            reverse: isRTL
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  };

  const handleAddTrade = () => {
    setSelectedTrade(null);
    setIsTradeModalOpen(true);
  };

  const handleEditTrade = (trade) => {
    setSelectedTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!tradeService) return;
    
    try {
      await tradeService.deleteTrade(tradeId);
      showSuccess(t('common.success'));
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      showError('Failed to delete trade');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currentLanguage === 'he' ? 'he-IL' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return new Intl.NumberFormat(currentLanguage === 'he' ? 'he-IL' : 'en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format((value || 0) / 100);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <div className="dashboard-header__left">
            <h1 className="dashboard-title animate-fade-in">
              {t('dashboard.title')}
            </h1>
            <p className="dashboard-subtitle">
              {t('common.loading')} {user?.displayName || user?.email}
            </p>
          </div>
          
          <div className="dashboard-header__right">
            <LanguageToggle variant="light" />
            <button 
              className="btn-add-trade"
              onClick={handleAddTrade}
            >
              + {t('journal.addTrade')}
            </button>
            <button 
              className="btn-logout"
              onClick={handleLogout}
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="dashboard-stats animate-slide-in">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__header">
              <h3>{t('dashboard.totalTrades')}</h3>
              <span className="stat-card__icon">📈</span>
            </div>
            <div className="stat-card__value">
              {stats?.totalTrades || 0}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <h3>{t('dashboard.winRate')}</h3>
              <span className="stat-card__icon">🎯</span>
            </div>
            <div className="stat-card__value">
              {formatPercentage(stats?.winRate)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <h3>{t('dashboard.totalPnL')}</h3>
              <span className="stat-card__icon">💰</span>
            </div>
            <div className={`stat-card__value ${(stats?.totalPnL || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(stats?.totalPnL)}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card__header">
              <h3>{t('dashboard.avgPnL')}</h3>
              <span className="stat-card__icon">📊</span>
            </div>
            <div className={`stat-card__value ${(stats?.avgPnL || 0) >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(stats?.avgPnL)}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Chart Section */}
          <section className="dashboard-chart-section animate-fade-in">
            <h2>{t('dashboard.tradingPerformance')}</h2>
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </section>

          {/* Recent Trades */}
          <section className="dashboard-trades-section animate-fade-in">
            <div className="section-header">
              <h2>{t('dashboard.recentTrades')}</h2>
              <button 
                className="btn-view-all"
                onClick={() => setIsDailyJournalModalOpen(true)}
              >
                View All
              </button>
            </div>
            
            <div className="trades-list">
              {trades.slice(0, 5).map((trade, index) => (
                <div key={trade.id} className="trade-item">
                  <div className="trade-item__main">
                    <span className="trade-symbol">{trade.symbol}</span>
                    <span className={`trade-side trade-side--${trade.side}`}>
                      {trade.side?.toUpperCase()}
                    </span>
                  </div>
                  <div className="trade-item__details">
                    <span className="trade-date">
                      {new Date(trade.timestamp).toLocaleDateString(
                        currentLanguage === 'he' ? 'he-IL' : 'en-US'
                      )}
                    </span>
                    <span className={`trade-pnl ${(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(trade.pnl)}
                    </span>
                  </div>
                </div>
              ))}
              
              {trades.length === 0 && (
                <div className="empty-state">
                  <p>No trades yet. Add your first trade to get started!</p>
                  <button 
                    className="btn-add-first-trade"
                    onClick={handleAddTrade}
                  >
                    {t('journal.addTrade')}
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Calendar Section */}
      <section className="dashboard-calendar animate-fade-in">
        <CalendarWithJournal 
          trades={trades}
          onEditTrade={handleEditTrade}
          onDeleteTrade={handleDeleteTrade}
        />
      </section>

      {/* Modals */}
      {isTradeModalOpen && (
        <TradeModal
          isOpen={isTradeModalOpen}
          onClose={() => {
            setIsTradeModalOpen(false);
            setSelectedTrade(null);
          }}
          trade={selectedTrade}
          tradeService={tradeService}
        />
      )}

      {isDailyJournalModalOpen && (
        <DailyJournalModal
          isOpen={isDailyJournalModalOpen}
          onClose={() => setIsDailyJournalModalOpen(false)}
          trades={trades}
          onEditTrade={handleEditTrade}
          onDeleteTrade={handleDeleteTrade}
        />
      )}
    </div>
  );
}