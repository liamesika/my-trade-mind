import React, { useState, useEffect,useCallback } from 'react';
import { auth, db } from '../scripts/firebase-init';
import {
  addDoc,
  updateDoc,
  getDocs,
  query,
  collection,
  doc,
} from 'firebase/firestore';

export default function DailyJournalModal({ isOpen, onClose, currentDate, refreshCalendar }) {
  const [form, setForm] = useState({
    dailyPnL: '',
    totalTrades: '',
    winningTrades: '',
    losingTrades: '',
    mood: '',
    notes: '',
    lessonLearned: '',
  });
  const [submitState, setSubmitState] = useState('Save Day');

  const dateStr = currentDate?.toLocaleDateString().split('T')[0] || '';

const loadJournal = useCallback(async () => {
  const user = auth.currentUser;
  if (!user || !dateStr) return;

  try {
    const q = query(collection(db, 'dailyJournals'));
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userId === user.uid && data.date === dateStr) {
        setForm({
          dailyPnL: data.dailyPnL || '',
          totalTrades: data.totalTrades || '',
          winningTrades: data.winningTrades || '',
          losingTrades: data.losingTrades || '',
          mood: data.mood || '',
          notes: data.notes || '',
          lessonLearned: data.lessonLearned || '',
        });
      }
    });
  } catch (error) {
    console.error("Error loading journal:", error);
  }
}, [dateStr]);

useEffect(() => {
  if (isOpen && currentDate) {
    loadJournal();
  }
}, [isOpen, currentDate, loadJournal]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !currentDate) return;

    const journalData = {
      ...form,
      userId: user.uid,
      date: dateStr,
      timestamp: new Date(),
      year: currentDate.getFullYear(),
      month: currentDate.getMonth() + 1,
      day: currentDate.getDate(),
      dailyPnL: parseFloat(form.dailyPnL) || 0,
      totalTrades: parseInt(form.totalTrades) || 0,
      winningTrades: parseInt(form.winningTrades) || 0,
      losingTrades: parseInt(form.losingTrades) || 0,
    };

    const q = query(collection(db, 'dailyJournals'));
    const snapshot = await getDocs(q);
    let existingDocId = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.userId === user.uid && data.date === dateStr) {
        existingDocId = docSnap.id;
      }
    });

    if (existingDocId) {
      await updateDoc(doc(db, 'dailyJournals', existingDocId), journalData);
    } else {
      await addDoc(collection(db, 'dailyJournals'), journalData);
    }

    setSubmitState('✓ Saved!');
    setTimeout(() => {
      setSubmitState('Save Day');
      onClose();
      refreshCalendar?.();
    }, 1500);
  };

  if (!isOpen) return null;

  const formattedTitle = currentDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-lg mx-4 glass-effect">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            Daily Journal - {formattedTitle}
          </h3>
          <button
            className="text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input name="dailyPnL" value={form.dailyPnL} onChange={handleChange} placeholder="P&L" className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            <input name="totalTrades" value={form.totalTrades} onChange={handleChange} placeholder="Total Trades" className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="winningTrades" value={form.winningTrades} onChange={handleChange} placeholder="Winning Trades" className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            <input name="losingTrades" value={form.losingTrades} onChange={handleChange} placeholder="Losing Trades" className="p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
          </div>

          <select name="mood" value={form.mood} onChange={handleChange} className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="">Select Mood</option>
            <option value="excellent">😁 Excellent</option>
            <option value="good">😊 Good</option>
            <option value="neutral">😐 Neutral</option>
            <option value="stressed">😰 Stressed</option>
            <option value="frustrated">😤 Frustrated</option>
          </select>

          <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Daily Notes" className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white resize-none" rows={4} />

          <input name="lessonLearned" value={form.lessonLearned} onChange={handleChange} placeholder="Key Lesson Learned" className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-white">
              {submitState}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
