// Modern Dashboard using new services and i18n
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
import '../styles/dashboard-original.css';

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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { t, currentLanguage, isRTL } = useLanguage();
  const { error: showError, success: showSuccess } = useToasts();

  // Services
  const [tradeService, setTradeService] = useState(null);
  const [statsService, setStatsService] = useState(null);

  // State
  const [trades, setTrades] = useState([]);
  const [recentTrade, setRecentTrade] = useState(null);
  const [stats, setStats] = useState(null);
  const [portfolioStats, setPortfolioStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isDailyJournalModalOpen, setIsDailyJournalModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'journal', or 'portfolio'
  const [journalFilters, setJournalFilters] = useState({
    dateFrom: '',
    dateTo: '',
    symbol: ''
  });

  // Chart reference
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Real-time KPI calculations
  const calculateKPIs = (allTrades) => {
    if (!allTrades || allTrades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgPnL: 0,
        totalPnL: 0,
        bestDayPnL: 0,
        worstDayPnL: 0,
        mostTradedSymbol: '',
        bestTrade: 0,
        worstTrade: 0
      };
    }

    const totalTrades = allTrades.length;
    const winningTrades = allTrades.filter(trade => (trade.pnl || 0) > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const totalPnL = allTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
    
    const bestTrade = Math.max(...allTrades.map(trade => trade.pnl || 0));
    const worstTrade = Math.min(...allTrades.map(trade => trade.pnl || 0));

    // Group by date for daily P&L
    const dailyPnL = {};
    allTrades.forEach(trade => {
      const date = trade.tradeDate || new Date(trade.timestamp).toISOString().split('T')[0];
      if (!dailyPnL[date]) dailyPnL[date] = 0;
      dailyPnL[date] += (trade.pnl || 0);
    });

    const dailyPnLValues = Object.values(dailyPnL);
    const bestDayPnL = dailyPnLValues.length > 0 ? Math.max(...dailyPnLValues) : 0;
    const worstDayPnL = dailyPnLValues.length > 0 ? Math.min(...dailyPnLValues) : 0;

    // Most traded symbol
    const symbolCounts = {};
    allTrades.forEach(trade => {
      if (trade.symbol) {
        symbolCounts[trade.symbol] = (symbolCounts[trade.symbol] || 0) + 1;
      }
    });
    const mostTradedSymbol = Object.keys(symbolCounts).length > 0 
      ? Object.keys(symbolCounts).reduce((a, b) => symbolCounts[a] > symbolCounts[b] ? a : b)
      : '';

    return {
      totalTrades,
      winRate,
      avgPnL,
      totalPnL,
      bestDayPnL,
      worstDayPnL,
      mostTradedSymbol,
      bestTrade,
      worstTrade
    };
  };

  // Portfolio calculations
  const calculatePortfolioStats = (allTrades) => {
    if (!allTrades || allTrades.length === 0) {
      return {
        exposureBySymbol: {},
        cumulativePnLBySymbol: {},
        equityCurve: [],
        totalExposure: 0,
        symbolCount: 0
      };
    }

    // Calculate exposure by symbol (based on quantity * entry price)
    const exposureBySymbol = {};
    const cumulativePnLBySymbol = {};
    let totalExposure = 0;

    allTrades.forEach(trade => {
      const symbol = trade.symbol || 'Unknown';
      const exposure = (trade.quantity || 0) * (trade.entry || 0);
      const pnl = trade.pnl || 0;

      totalExposure += Math.abs(exposure);
      exposureBySymbol[symbol] = (exposureBySymbol[symbol] || 0) + Math.abs(exposure);
      cumulativePnLBySymbol[symbol] = (cumulativePnLBySymbol[symbol] || 0) + pnl;
    });

    // Convert exposure to percentages
    const exposurePercentages = {};
    Object.keys(exposureBySymbol).forEach(symbol => {
      exposurePercentages[symbol] = totalExposure > 0 
        ? (exposureBySymbol[symbol] / totalExposure) * 100 
        : 0;
    });

    // Calculate rolling equity curve (cumulative P&L over time)
    const sortedTrades = [...allTrades].sort((a, b) => {
      const dateA = new Date(a.tradeDate || a.timestamp);
      const dateB = new Date(b.tradeDate || b.timestamp);
      return dateA - dateB;
    });

    let runningTotal = 0;
    const equityCurve = sortedTrades.map(trade => {
      runningTotal += (trade.pnl || 0);
      return {
        date: trade.tradeDate || new Date(trade.timestamp).toISOString().split('T')[0],
        equity: runningTotal,
        trade: trade
      };
    });

    return {
      exposureBySymbol: exposurePercentages,
      cumulativePnLBySymbol,
      equityCurve,
      totalExposure,
      symbolCount: Object.keys(exposureBySymbol).length
    };
  };

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

    let unsubscribeAll;
    let unsubscribeRecent;
    
    const setupSubscriptions = async () => {
      try {
        // Subscribe to all trades for KPIs and journal
        unsubscribeAll = tradeService.subscribeToTrades((updatedTrades) => {
          console.log('📊 All trades updated:', updatedTrades.length);
          setTrades(updatedTrades);
          
          // Calculate KPIs in real-time from live data
          const kpis = calculateKPIs(updatedTrades);
          setStats(kpis);
          
          // Calculate portfolio stats in real-time
          const portfolio = calculatePortfolioStats(updatedTrades);
          setPortfolioStats(portfolio);
          
          setLoading(false);
        });

        // Subscribe to recent trade (limit 1)
        unsubscribeRecent = tradeService.subscribeToTrades((recentTrades) => {
          console.log('📊 Recent trade updated:', recentTrades.length);
          if (recentTrades.length > 0) {
            setRecentTrade(recentTrades[0]);
          }
        }, { limit: 1 });

      } catch (error) {
        console.error('❌ Error setting up trades subscription:', error);
        showError(t('common.error'));
        setLoading(false);
      }
    };

    setupSubscriptions();

    return () => {
      if (unsubscribeAll) unsubscribeAll();
      if (unsubscribeRecent) unsubscribeRecent();
    };
  }, [tradeService]);

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
      showError(t('common.error'));
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
              {currentLanguage === 'he' ? 'שלום' : 'Hello'}, {user?.displayName || user?.email}
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

      {/* App Navigation */}
      <nav className="app-nav">
        <div className="app-nav__container">
          <Link to="/dashboard" className="app-nav__item app-nav__item--active">
            📊 {t('nav.dashboard')}
          </Link>
          <Link to="/journal" className="app-nav__item">
            📝 {t('nav.journal')}
          </Link>
          <Link to="/chat" className="app-nav__item">
            🤖 {t('nav.mentor')}
          </Link>
        </div>
      </nav>

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

          {/* Tab Navigation */}
          <div className="dashboard-tabs">
            <button 
              className={`dashboard-tab ${activeTab === 'overview' ? 'dashboard-tab--active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`dashboard-tab ${activeTab === 'portfolio' ? 'dashboard-tab--active' : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              💼 Portfolio
            </button>
            <button 
              className={`dashboard-tab ${activeTab === 'journal' ? 'dashboard-tab--active' : ''}`}
              onClick={() => setActiveTab('journal')}
            >
              📝 Trade Journal
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Recent Trade (Single Latest) */}
              <section className="dashboard-trades-section animate-fade-in">
                <div className="section-header">
                  <h2>{t('dashboard.recentTrades')}</h2>
                </div>
                
                <div className="trades-list">
                  {recentTrade ? (
                    <div className="trade-item trade-item--featured">
                      <div className="trade-item__main">
                        <span className="trade-symbol">{recentTrade.symbol}</span>
                        <span className={`trade-side trade-side--${recentTrade.side}`}>
                          {recentTrade.side?.toUpperCase()}
                        </span>
                      </div>
                      <div className="trade-item__details">
                        <div className="trade-prices">
                          <span className="trade-entry">Entry: {formatCurrency(recentTrade.entry)}</span>
                          <span className="trade-exit">Exit: {formatCurrency(recentTrade.exit)}</span>
                        </div>
                        <div className="trade-result">
                          <span className="trade-date">
                            {new Date(recentTrade.timestamp).toLocaleDateString(
                              currentLanguage === 'he' ? 'he-IL' : 'en-US'
                            )}
                          </span>
                          <span className={`trade-pnl ${(recentTrade.pnl || 0) >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(recentTrade.pnl)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>{currentLanguage === 'he' ? 'עדיין אין עסקאות. הוסף את העסקה הראשונה!' : 'No trades yet. Add your first trade to get started!'}</p>
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
            </>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <section className="portfolio-section animate-fade-in">
              <PortfolioView 
                portfolioStats={portfolioStats}
                trades={trades}
                formatCurrency={formatCurrency}
                formatPercentage={formatPercentage}
                currentLanguage={currentLanguage}
                t={t}
              />
            </section>
          )}

          {/* Trade Journal Tab */}
          {activeTab === 'journal' && (
            <section className="journal-section animate-fade-in">
              <TradeJournalView 
                trades={trades}
                filters={journalFilters}
                onFiltersChange={setJournalFilters}
                currentLanguage={currentLanguage}
                onEditTrade={handleEditTrade}
                onDeleteTrade={handleDeleteTrade}
                formatCurrency={formatCurrency}
                t={t}
              />
            </section>
          )}
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
};

// Trade Journal View Component
const TradeJournalView = ({ trades, filters, onFiltersChange, currentLanguage, onEditTrade, onDeleteTrade, formatCurrency, t }) => {
  // Filter trades based on filters
  const filteredTrades = trades.filter(trade => {
    const tradeDate = trade.tradeDate || new Date(trade.timestamp).toISOString().split('T')[0];
    const matchesDateFrom = !filters.dateFrom || tradeDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || tradeDate <= filters.dateTo;
    const matchesSymbol = !filters.symbol || trade.symbol?.toLowerCase().includes(filters.symbol.toLowerCase());
    
    return matchesDateFrom && matchesDateTo && matchesSymbol;
  });

  // Group trades by date (descending)
  const tradesByDate = {};
  filteredTrades.forEach(trade => {
    const date = trade.tradeDate || new Date(trade.timestamp).toISOString().split('T')[0];
    if (!tradesByDate[date]) {
      tradesByDate[date] = [];
    }
    tradesByDate[date].push(trade);
  });

  const sortedDates = Object.keys(tradesByDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="trade-journal-view">
      {/* Filters */}
      <div className="journal-filters">
        <div className="filter-group">
          <label>{t('journal.date')} From:</label>
          <input 
            type="date" 
            value={filters.dateFrom} 
            onChange={(e) => onFiltersChange({...filters, dateFrom: e.target.value})}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>{t('journal.date')} To:</label>
          <input 
            type="date" 
            value={filters.dateTo} 
            onChange={(e) => onFiltersChange({...filters, dateTo: e.target.value})}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <label>{t('journal.symbol')}:</label>
          <input 
            type="text" 
            value={filters.symbol} 
            onChange={(e) => onFiltersChange({...filters, symbol: e.target.value})}
            placeholder="e.g., BTC"
            className="filter-input"
          />
        </div>
        <button 
          onClick={() => onFiltersChange({dateFrom: '', dateTo: '', symbol: ''})}
          className="filter-clear-btn"
        >
          Clear Filters
        </button>
      </div>

      {/* Trades List by Date */}
      <div className="journal-trades-list">
        {sortedDates.length > 0 ? sortedDates.map(date => (
          <div key={date} className="journal-date-group">
            <div className="date-header">
              <h3>{new Date(date).toLocaleDateString(currentLanguage === 'he' ? 'he-IL' : 'en-US', {
                weekday: 'long',
                year: 'numeric', 
                month: 'long',
                day: 'numeric'
              })}</h3>
              <span className="trades-count">{tradesByDate[date].length} {tradesByDate[date].length === 1 ? 'trade' : 'trades'}</span>
            </div>
            
            <div className="date-trades">
              {tradesByDate[date].map(trade => (
                <div key={trade.id} className="journal-trade-item">
                  <div className="trade-main-info">
                    <span className="trade-symbol">{trade.symbol}</span>
                    <span className={`trade-side trade-side--${trade.side}`}>
                      {trade.side?.toUpperCase()}
                    </span>
                    <span className="trade-quantity">Qty: {trade.quantity}</span>
                  </div>
                  
                  <div className="trade-prices">
                    <span className="trade-entry">Entry: {formatCurrency(trade.entry)}</span>
                    <span className="trade-exit">Exit: {formatCurrency(trade.exit)}</span>
                  </div>
                  
                  <div className="trade-result">
                    <span className={`trade-pnl ${(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(trade.pnl)}
                    </span>
                  </div>
                  
                  <div className="trade-actions">
                    <button 
                      onClick={() => onEditTrade(trade)}
                      className="trade-action-btn trade-action-btn--edit"
                      title="Edit Trade"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onDeleteTrade(trade.id)}
                      className="trade-action-btn trade-action-btn--delete"
                      title="Delete Trade"
                    >
                      🗑️
                    </button>
                  </div>

                  {trade.notes && (
                    <div className="trade-notes">
                      <small>{trade.notes}</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="journal-empty-state">
            <p>{currentLanguage === 'he' ? 'לא נמצאו עסקאות בפילטרים שנבחרו.' : 'No trades found with the selected filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Portfolio View Component
const PortfolioView = ({ portfolioStats, trades, formatCurrency, formatPercentage, currentLanguage, t }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Create equity curve chart
  useEffect(() => {
    if (portfolioStats?.equityCurve && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const equityCurveData = portfolioStats.equityCurve.map(point => ({
        x: point.date,
        y: point.equity
      }));

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: 'Equity Curve',
            data: equityCurveData,
            borderColor: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary-light)',
            borderWidth: 3,
            fill: false,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'var(--color-text-inverse)'
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'var(--color-text-inverse)',
                callback: function(value) {
                  return formatCurrency(value);
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [portfolioStats, formatCurrency]);

  if (!portfolioStats) {
    return (
      <div className="portfolio-loading">
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  const topExposures = Object.entries(portfolioStats.exposureBySymbol)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  const topPnLSymbols = Object.entries(portfolioStats.cumulativePnLBySymbol)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  return (
    <div className="portfolio-view">
      {/* Portfolio Overview Cards */}
      <div className="portfolio-overview">
        <div className="portfolio-card">
          <div className="portfolio-card__header">
            <h3>Portfolio Diversity</h3>
            <span className="portfolio-card__icon">🎯</span>
          </div>
          <div className="portfolio-card__value">
            {portfolioStats.symbolCount} Symbols
          </div>
          <div className="portfolio-card__subtitle">
            Total Exposure: {formatCurrency(portfolioStats.totalExposure)}
          </div>
        </div>

        <div className="portfolio-card">
          <div className="portfolio-card__header">
            <h3>Equity Curve</h3>
            <span className="portfolio-card__icon">📈</span>
          </div>
          <div className="portfolio-card__value">
            {portfolioStats.equityCurve.length > 0 ? 
              formatCurrency(portfolioStats.equityCurve[portfolioStats.equityCurve.length - 1]?.equity) 
              : formatCurrency(0)
            }
          </div>
          <div className="portfolio-card__subtitle">
            Current Equity
          </div>
        </div>
      </div>

      {/* Exposure by Symbol */}
      <div className="portfolio-section">
        <h2 className="portfolio-section__title">Exposure by Symbol (%)</h2>
        <div className="exposure-cards">
          {topExposures.map(([symbol, percentage]) => (
            <div key={symbol} className="exposure-card">
              <div className="exposure-card__header">
                <span className="exposure-symbol">{symbol}</span>
                <span className="exposure-percentage">{formatPercentage(percentage)}</span>
              </div>
              <div className="exposure-bar">
                <div 
                  className="exposure-bar__fill"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cumulative P&L by Symbol */}
      <div className="portfolio-section">
        <h2 className="portfolio-section__title">Cumulative P&L by Symbol</h2>
        <div className="pnl-cards">
          {topPnLSymbols.map(([symbol, pnl]) => (
            <div key={symbol} className="pnl-card">
              <div className="pnl-card__header">
                <span className="pnl-symbol">{symbol}</span>
              </div>
              <div className={`pnl-card__value ${pnl >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(pnl)}
              </div>
              <div className="pnl-card__trades">
                {trades.filter(t => t.symbol === symbol).length} trades
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equity Curve Chart */}
      <div className="portfolio-section">
        <h2 className="portfolio-section__title">Rolling Equity Curve</h2>
        <div className="equity-chart-container">
          <canvas ref={chartRef} className="equity-chart"></canvas>
        </div>
      </div>
    </div>
  );
};