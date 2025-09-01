import { useEffect, useState, useRef } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

export default function TradeModal({ isOpen, onClose }) {
  const [form, setForm] = useState({
    symbol: '',
    type: 'LONG',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    date: '',
    notes: ''
  });
  const submitBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm((prev) => ({
        ...prev,
        date: new Date().toISOString().split('T')[0],
      }));
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id.replace('trade-', '')]: value }));
  };

  const handleCancel = () => {
    setForm({ symbol: '', type: 'LONG', entryPrice: '', exitPrice: '', quantity: '', date: '', notes: '' });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = auth.currentUser?.uid;
    if (!userId) return alert('You must be logged in');

    const data = {
      ...form,
      symbol: form.symbol.toUpperCase(),
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: parseFloat(form.exitPrice),
      quantity: parseFloat(form.quantity),
      timestamp: new Date(),
      userId,
    };

    const pnl = data.type === 'LONG'
      ? (data.exitPrice - data.entryPrice) * data.quantity
      : (data.entryPrice - data.exitPrice) * data.quantity;

    data.pnl = pnl;
    data.pnlPercentage = (pnl / (data.entryPrice * data.quantity)) * 100;

    try {
      await addDoc(collection(db, 'userTrades'), data);
      console.log('💰 Trade saved:', data);

      const btn = submitBtnRef.current;
      const originalText = btn.textContent;
      btn.textContent = '✓ Saved!';
      btn.style.background = 'linear-gradient(to right, #10b981, #059669)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        handleCancel();
      }, 1500);
    } catch (err) {
      console.error('❌ Error saving trade:', err);
      alert('Error saving trade. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 " >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-md mx-4  max-h-[80vh] glass-effect" style={{height:"80%",overflow:"auto"}}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Add New Trade</h3>
          <button onClick={handleCancel} className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-300 mb-2">Symbol</label>
            <input type="text" id="trade-symbol" placeholder="e.g., BTCUSD" value={form.symbol} onChange={handleChange} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Trade Type</label>
            <select id="trade-type" value={form.type} onChange={handleChange} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Entry Price</label>
              <input type="number" id="trade-entryPrice" value={form.entryPrice} onChange={handleChange} step="0.01" placeholder="0.00" className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Exit Price</label>
              <input type="number" id="trade-exitPrice" value={form.exitPrice} onChange={handleChange} step="0.01" placeholder="0.00" className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            </div>
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Quantity</label>
            <input type="number" id="trade-quantity" value={form.quantity} onChange={handleChange} step="0.01" placeholder="0.01" className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Date</label>
            <input type="date" id="trade-date" value={form.date} onChange={handleChange} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Notes (Optional)</label>
            <textarea id="trade-notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Add any notes..." className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleCancel} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">Cancel</button>
            <button type="submit" ref={submitBtnRef} className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg">Save Trade</button>
          </div>
        </form>
      </div>
    </div>
  );
}