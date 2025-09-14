import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useLanguage } from '../i18n/useLanguage';

export default function TradeModal({ isOpen, onClose, tradeService }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    symbol: '',
    side: 'long', // 'long' or 'short'
    entry: '',
    exit: '',
    quantity: '',
    tradeDate: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        tradeDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      }));
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };


  const calculatePnL = (entry, exit, quantity, side) => {
    const entryPrice = parseFloat(entry);
    const exitPrice = parseFloat(exit);
    const qty = parseFloat(quantity);
    
    if (isNaN(entryPrice) || isNaN(exitPrice) || isNaN(qty)) return 0;
    
    // For long positions: (exit - entry) * quantity
    // For short positions: (entry - exit) * quantity  
    if (side === 'long') {
      return (exitPrice - entryPrice) * qty;
    } else {
      return (entryPrice - exitPrice) * qty;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.uid) {
      alert('You must be logged in');
      return;
    }
    
    if (!tradeService) {
      alert('Trade service not available');
      return;
    }

    // Validate required fields
    if (!form.symbol || !form.entry || !form.exit || !form.quantity) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const tradeData = {
        symbol: form.symbol.toUpperCase().trim(),
        side: form.side,
        entry: parseFloat(form.entry),
        exit: parseFloat(form.exit), 
        quantity: parseFloat(form.quantity),
        tradeDate: form.tradeDate,
        notes: form.notes.trim(),
        pnl: calculatePnL(form.entry, form.exit, form.quantity, form.side)
      };

      await tradeService.addTrade(tradeData);
      console.log('✅ Trade saved successfully');

      // Reset form
      setForm({
        symbol: '',
        side: 'long',
        entry: '',
        exit: '',
        quantity: '',
        tradeDate: new Date().toISOString().split('T')[0],
        notes: ''
      });

      // Close modal with success indication
      const btn = submitBtnRef.current;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Saved!';
        btn.style.background = 'linear-gradient(to right, #10b981, #059669)';
        
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          onClose();
        }, 1000);
      } else {
        onClose();
      }
      
    } catch (error) {
      console.error('❌ Error saving trade:', error);
      alert('Error saving trade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 " >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4  max-h-[80vh] glass-effect" style={{height:"80%",overflow:"auto"}}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">{t('journal.addTrade')}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2">{t('journal.symbol')}</label>
            <input 
              type="text" 
              id="symbol" 
              placeholder="e.g., BTCUSD" 
              value={form.symbol} 
              onChange={handleChange} 
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">{t('journal.side')}</label>
            <select 
              id="side" 
              value={form.side} 
              onChange={handleChange} 
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="long">{t('journal.long')}</option>
              <option value="short">{t('journal.short')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">{t('journal.entryPrice')}</label>
              <input 
                type="number" 
                id="entry" 
                value={form.entry} 
                onChange={handleChange} 
                step="0.01" 
                placeholder="0.00" 
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                required 
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">{t('journal.exitPrice')}</label>
              <input 
                type="number" 
                id="exit" 
                value={form.exit} 
                onChange={handleChange} 
                step="0.01" 
                placeholder="0.00" 
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" 
                required 
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">{t('journal.quantity')}</label>
            <input 
              type="number" 
              id="quantity" 
              value={form.quantity} 
              onChange={handleChange} 
              step="0.01" 
              placeholder="0.01" 
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">{t('journal.date')}</label>
            <input 
              type="date" 
              id="tradeDate" 
              value={form.tradeDate} 
              onChange={handleChange} 
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" 
              required 
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">{t('journal.notes')}</label>
            <textarea 
              id="notes" 
              value={form.notes} 
              onChange={handleChange} 
              rows="3" 
              placeholder={t('common.loading')} 
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none" 
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              ref={submitBtnRef} 
              disabled={isSubmitting}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white disabled:opacity-50"
            >
              {isSubmitting ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}