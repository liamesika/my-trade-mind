import React from 'react';
import { useLanguage } from '../i18n/useLanguage';

export default function DailyTradesModal({ isOpen, onClose, selectedDate, trades }) {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  const formatDate = (date) => {
    return date.toLocaleDateString(isRTL ? 'he-IL' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const totalPnL = trades.reduce((sum, trade) => sum + parseFloat(trade.pnl || 0), 0);
  const winningTrades = trades.filter(trade => parseFloat(trade.pnl || 0) > 0).length;
  const losingTrades = trades.filter(trade => parseFloat(trade.pnl || 0) < 0).length;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="glass-effect rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="professional-header p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {t('calendar.dailyTrades')}
              </h2>
              <p className="text-gray-300">
                {selectedDate && formatDate(selectedDate)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="action-btn p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* Daily Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="metric-card p-4 rounded-lg">
              <p className="text-gray-400 text-sm">{t('stats.totalTrades')}</p>
              <p className="text-2xl font-bold metric-number">{trades.length}</p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-gray-400 text-sm">{t('stats.winningTrades')}</p>
              <p className="text-2xl font-bold text-green-400">{winningTrades}</p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-gray-400 text-sm">{t('stats.losingTrades')}</p>
              <p className="text-2xl font-bold text-red-400">{losingTrades}</p>
            </div>
            <div className="metric-card p-4 rounded-lg">
              <p className="text-gray-400 text-sm">{t('stats.totalPnL')}</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'profit-positive' : 'profit-negative'}`}>
                {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Trades List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {trades.map((trade) => (
              <div key={trade.id} className="trade-item p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  {/* Symbol & Side */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        trade.side?.toLowerCase() === 'long' || trade.side?.toLowerCase() === 'buy' 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-bold text-white">{trade.symbol}</p>
                        <p className="text-sm text-gray-400 capitalize">{trade.side}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400">{t('trades.quantity')}</p>
                    <p className="font-semibold">{trade.quantity}</p>
                  </div>

                  {/* Entry Price */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400">{t('trades.entryPrice')}</p>
                    <p className="font-semibold">${parseFloat(trade.entryPrice || 0).toFixed(2)}</p>
                  </div>

                  {/* Exit Price */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400">{t('trades.exitPrice')}</p>
                    <p className="font-semibold">${parseFloat(trade.exitPrice || 0).toFixed(2)}</p>
                  </div>

                  {/* PnL */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400">{t('trades.pnl')}</p>
                    <p className={`font-bold text-lg ${
                      parseFloat(trade.pnl || 0) >= 0 ? 'profit-positive' : 'profit-negative'
                    }`}>
                      {parseFloat(trade.pnl || 0) >= 0 ? '+' : ''}${parseFloat(trade.pnl || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {trade.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-300">{trade.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="action-btn px-6 py-2 rounded-lg"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}