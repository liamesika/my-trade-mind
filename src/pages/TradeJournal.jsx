// src/pages/TradeJournal.jsx - Modernized with i18n and new services
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import { useLanguage } from "../i18n/useLanguage";
import { createTradeService, createStatsService } from "../services/tradeService";
import { useToasts } from "../services/toastService";
import TradeModal from "../components/TradeModal";
import LanguageToggle from "../components/LanguageToggle";
import "../styles/design-tokens.css";

const TradeJournal = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, currentLanguage } = useLanguage();
  const { success: showSuccess, error: showError } = useToasts();

  // Services
  const [tradeService, setTradeService] = useState(null);
  const [statsService, setStatsService] = useState(null);

  // State
  const [tradesMap, setTradesMap] = useState({});
  const [trades, setTrades] = useState([]);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [dayTrades, setDayTrades] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize services
  useEffect(() => {
    if (user?.uid) {
      const ts = createTradeService(user.uid);
      const ss = createStatsService(user.uid);
      setTradeService(ts);
      setStatsService(ss);
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Subscribe to trades updates
  useEffect(() => {
    if (!tradeService) return;

    let unsubscribe;
    
    const setupSubscription = async () => {
      try {
        unsubscribe = tradeService.subscribeToTrades((updatedTrades) => {
          setTrades(updatedTrades);
          generateCalendarFromTrades(updatedTrades);
          setLoading(false);
        });
      } catch (error) {
        console.error('❌ Error setting up trades subscription:', error);
        showError(t('common.error'));
        setLoading(false);
      }
    };

    setupSubscription();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [tradeService]);

  const generateCalendarFromTrades = (tradesData) => {
    const newMap = {};
    tradesData.forEach((trade) => {
      const dateKey = trade.tradeDate || (trade.datetime?.split("T")[0]) || new Date(trade.timestamp).toISOString().split('T')[0];
      if (dateKey) {
        newMap[dateKey] = newMap[dateKey] || [];
        newMap[dateKey].push(trade);
      }
    });
    setTradesMap(newMap);
  };

  const handleAddTrade = () => {
    setSelectedTrade(null);
    setShowTradeModal(true);
  };

  const deleteTrade = async (tradeId) => {
    if (!tradeService) return;
    
    const confirmMessage = currentLanguage === 'he' ? 
      "האם את בטוחה שברצונך למחוק את העסקה?" : 
      "Are you sure you want to delete this trade?";
      
    if (!window.confirm(confirmMessage)) return;

    try {
      await tradeService.deleteTrade(tradeId);
      showSuccess(t('common.success'));
      setShowDayModal(false);
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      showError(t('common.error'));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const viewTrade = (trade) => {
    setSelectedTrade(trade);
    setShowViewModal(true);
  };

  const editTrade = (trade) => {
    setSelectedTrade(trade);
    setShowTradeModal(true);
  };

  const exportToHTML = () => {
    const allTrades = Object.values(tradesMap).flat();
    const html = generateHTMLLandingPage(allTrades, user?.email);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-journal-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareTradeDetails = (trade) => {
    const details = `
🚀 Trade Details:
📈 Asset: ${trade.assetName}
🎯 Direction: ${trade.direction}
💰 Entry: ${trade.entry}
🏁 Exit: ${trade.exit}
💲 Result: ${trade.result}$
📅 Date: ${trade.datetime}
📝 Notes: ${trade.reason || 'No notes'}
    `.trim();

    if (navigator.share) {
      navigator.share({
        title: 'Trade Details',
        text: details
      });
    } else {
      navigator.clipboard.writeText(details).then(() => {
        alert('Trade details copied to clipboard!');
      });
    }
  };

  const generateHTMLLandingPage = (trades, userName) => {
    const totalPnL = trades.reduce((sum, trade) => sum + (parseFloat(trade.result) || 0), 0);
    const winningTrades = trades.filter(trade => (parseFloat(trade.result) || 0) > 0);
    const winRate = trades.length > 0 ? (winningTrades.length / trades.length * 100).toFixed(1) : 0;

    return `
<!DOCTYPE html>
<html lang="en" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trade Journal - ${userName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .glass-effect { backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.1); }
        .gradient-bg { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #8b5cf6 100%); }
    </style>
</head>
<body class="gradient-bg min-h-screen text-white">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-4">🚀 ${userName} Trade Journal</h1>
            <p class="text-xl opacity-90">Professional Trading Performance Dashboard</p>
            <div class="mt-6 grid grid-cols-3 gap-6">
                <div class="glass-effect rounded-xl p-6">
                    <h3 class="text-2xl font-bold text-green-400">$${totalPnL.toFixed(2)}</h3>
                    <p class="text-sm opacity-75">Total P&L</p>
                </div>
                <div class="glass-effect rounded-xl p-6">
                    <h3 class="text-2xl font-bold text-blue-400">${winRate}%</h3>
                    <p class="text-sm opacity-75">Win Rate</p>
                </div>
                <div class="glass-effect rounded-xl p-6">
                    <h3 class="text-2xl font-bold text-purple-400">${trades.length}</h3>
                    <p class="text-sm opacity-75">Total Trades</p>
                </div>
            </div>
        </header>

        <!-- Trades Table -->
        <div class="glass-effect rounded-2xl p-8 overflow-x-auto">
            <h2 class="text-3xl font-bold mb-6 text-center">📊 Trading History</h2>
            <table class="w-full table-auto">
                <thead>
                    <tr class="border-b border-white/20">
                        <th class="text-right p-4 font-bold">Date</th>
                        <th class="text-right p-4 font-bold">Asset</th>
                        <th class="text-right p-4 font-bold">Direction</th>
                        <th class="text-right p-4 font-bold">Entry</th>
                        <th class="text-right p-4 font-bold">Exit</th>
                        <th class="text-right p-4 font-bold">P&L</th>
                        <th class="text-right p-4 font-bold">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${trades.map(trade => `
                        <tr class="border-b border-white/10 hover:bg-white/5 transition-colors">
                            <td class="p-4">${new Date(trade.datetime).toLocaleDateString()}</td>
                            <td class="p-4 font-semibold">${trade.assetName}</td>
                            <td class="p-4">
                                <span class="px-3 py-1 rounded-full text-sm ${trade.direction === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}">
                                    ${trade.direction}
                                </span>
                            </td>
                            <td class="p-4">${trade.entry}</td>
                            <td class="p-4">${trade.exit}</td>
                            <td class="p-4 font-bold ${parseFloat(trade.result) >= 0 ? 'text-green-400' : 'text-red-400'}">
                                $${parseFloat(trade.result || 0).toFixed(2)}
                            </td>
                            <td class="p-4 text-sm opacity-75">${trade.reason || 'No notes'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <footer class="text-center mt-12 opacity-75">
            <p>Generated on ${new Date().toLocaleDateString()} | TradeMind Journal</p>
        </footer>
    </div>
</body>
</html>`;
  };

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const calendar = [];
    for (let i = 0; i < startDay; i++) calendar.push(<div key={`empty-${i}`} />);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const trades = tradesMap[dateStr] || [];
      calendar.push(
        <div
          key={dateStr}
          className="p-3 border border-blue-800 rounded bg-white/10 hover:bg-white/20 cursor-pointer"
          onClick={() => {
            if (trades.length > 0) {
              setSelectedDay(dateStr);
              setDayTrades(trades);
              setShowDayModal(true);
            } else {
              const noTradesMessage = currentLanguage === 'he' ? 
                "📭 אין עסקאות ליום זה" : 
                "📭 No trades for this day";
              alert(noTradesMessage);
            }
          }}
        >
          <div className="text-sm font-bold mb-2">{dateStr}</div>
          {trades.length > 0 ? (
            trades.map((t, idx) => (
              <div key={idx} className="text-xs text-green-300">
                🟢 {t.assetName} - {t.result}$
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-300">אין עסקאות</div>
          )}
        </div>
      );
    }
    return calendar;
  };

  return (
    <div className="text-white min-h-screen flex flex-col relative overflow-hidden bg-gray-900">

      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-gray-800">
        <div className="flex items-center gap-4">
          <span>{t('common.loading')}, {user?.displayName || user?.email}</span>
          <LanguageToggle variant="header" />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToHTML} 
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
            title="Export to HTML Landing Page"
          >
            📊 {t('journal.exportHtml')}
          </button>
          <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded">
            🔓 {t('nav.logout')}
          </button>
          <button onClick={handleAddTrade} className="bg-green-600 px-4 py-2 rounded">
            ➕ {t('journal.addTrade')}
          </button>
        </div>
      </div>

      {/* App Navigation */}
      <nav className="app-nav">
        <div className="app-nav__container">
          <Link to="/dashboard" className="app-nav__item">
            📊 {t('nav.dashboard')}
          </Link>
          <Link to="/journal" className="app-nav__item app-nav__item--active">
            📝 {t('nav.journal')}
          </Link>
          <Link to="/chat" className="app-nav__item">
            🤖 {t('nav.mentor')}
          </Link>
        </div>
      </nav>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-4 p-4">{renderCalendar()}</div>

      {/* Day Trades Modal */}
      {showDayModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w/full max-w-3xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl mb-4 text-center">
              {currentLanguage === 'he' ? `עסקאות ליום ${selectedDay}` : `Trades for ${selectedDay}`}
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-center">
                  <th className="p-2 border">{t('journal.symbol')}</th>
                  <th className="p-2 border">{t('journal.side')}</th>
                  <th className="p-2 border">{t('journal.entry')}</th>
                  <th className="p-2 border">{t('journal.exit')}</th>
                  <th className="p-2 border">{t('journal.pnl')}</th>
                  <th className="p-2 border">{currentLanguage === 'he' ? 'פעולות' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {dayTrades.map((t, idx) => (
                  <tr key={idx} className="text-center border-t">
                    <td className="p-2">{t.symbol || t.assetName}</td>
                    <td className="p-2">{t.side || t.direction}</td>
                    <td className="p-2">{t.entry}</td>
                    <td className="p-2">{t.exit}</td>
                    <td className="p-2">{t.pnl || t.result}</td>
                    <td className="p-2">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => viewTrade(t)} 
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          title="View Trade Details"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => editTrade(t)} 
                          className="text-green-500 hover:text-green-700 transition-colors"
                          title="Edit Trade"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => shareTradeDetails(t)} 
                          className="text-purple-500 hover:text-purple-700 transition-colors"
                          title="Share Trade Details"
                        >
                          📤
                        </button>
                        <button 
                          onClick={() => deleteTrade(t.id)} 
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Trade"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowDayModal(false)} className="mt-4 w-full bg-gray-700 p-2 rounded">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Trade Modal */}
      {showTradeModal && (
        <TradeModal
          isOpen={showTradeModal}
          onClose={() => setShowTradeModal(false)}
          trade={selectedTrade}
          tradeService={tradeService}
        />
      )}

      {/* View Trade Modal */}
      {showViewModal && selectedTrade && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">📊 Trade Details</h3>
              <button 
                onClick={() => setShowViewModal(false)} 
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-gray-400 text-sm">Asset</label>
                  <p className="text-white font-semibold text-lg">{selectedTrade.assetName}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-gray-400 text-sm">Direction</label>
                  <p className={`font-semibold text-lg ${selectedTrade.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedTrade.direction}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-gray-400 text-sm">Entry Price</label>
                  <p className="text-white font-semibold text-lg">{selectedTrade.entry}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-gray-400 text-sm">Exit Price</label>
                  <p className="text-white font-semibold text-lg">{selectedTrade.exit}</p>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-400 text-sm">P&L Result</label>
                <p className={`font-bold text-2xl ${parseFloat(selectedTrade.result) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${selectedTrade.result}
                </p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <label className="text-gray-400 text-sm">Date</label>
                <p className="text-white">{new Date(selectedTrade.datetime).toLocaleDateString()}</p>
              </div>
              
              {selectedTrade.reason && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <label className="text-gray-400 text-sm">Notes</label>
                  <p className="text-white">{selectedTrade.reason}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-6">
              <button 
                onClick={() => shareTradeDetails(selectedTrade)} 
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                📤 Share Trade
              </button>
              <button 
                onClick={() => {
                  setShowViewModal(false);
                  editTrade(selectedTrade);
                }} 
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                ✏️ Edit Trade
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TradeJournal;
