// src/pages/TradeJournal.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  addDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import TradeModal from "../components/TradeModal";
import { login, logout, watchAuthState } from "../firebase/firebase-auth";

const TradeJournal = () => {
  const navigate = useNavigate();
  const [tradesMap, setTradesMap] = useState({});
  const [userName, setUserName] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [dayTrades, setDayTrades] = useState([]);
  const [formData, setFormData] = useState({});
  const [user, setUser] = useState(null);

  // keep auth state in one place
  useEffect(() => {
    return watchAuthState({
      onIn: (u) => setUser(u),
      onOut: () => setUser(null),
    });
  }, []);

  // react to user changes (navigate/fetch)
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setUserName(user.email);
    generateCalendar(user.uid);
  }, [user, navigate]);

  // still keep listener to refresh calendar on native changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUserName(u.email);
        generateCalendar(u.uid);
      }
    });
    return () => unsub();
  }, []);

  const generateCalendar = async (uid) => {
    const snapshot = await getDocs(collection(db, "users", uid, "trades"));
    const newMap = {};
    snapshot.forEach((docSnap) => {
      const trade = docSnap.data();
      trade.id = docSnap.id;
      const dateKey = trade.datetime?.split("T")[0];
      if (dateKey) {
        newMap[dateKey] = newMap[dateKey] || [];
        newMap[dateKey].push(trade);
      }
    });
    setTradesMap(newMap);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const userCredential = await login(email, password);
      setUserName(userCredential.user.email);
      setShowLogin(false);
      generateCalendar(userCredential.user.uid);
    } catch (err) {
      alert("❌ שגיאה בהתחברות: " + err.message);
    }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    const u = auth.currentUser;
    if (!u) return alert("⛔ המשתמש לא מחובר");

    const trade = {
      ...formData,
      entry: parseFloat(formData.entry),
      exit: parseFloat(formData.exit),
      result: parseFloat(formData.result),
      createdAt: new Date(),
    };

    try {
      const docRef = formData.editingId
        ? doc(db, "users", u.uid, "trades", formData.editingId)
        : collection(db, "users", u.uid, "trades");

      formData.editingId
        ? await setDoc(docRef, trade)
        : await addDoc(docRef, trade);

      alert(formData.editingId ? "✅ עסקה עודכנה בהצלחה!" : "✅ עסקה נשמרה בהצלחה!");
      setFormData({});
      setShowTradeModal(false);
      generateCalendar(u.uid);
    } catch (err) {
      alert("❌ שגיאה בשמירה");
    }
  };

  const deleteTrade = async (tradeId) => {
    const u = auth.currentUser;
    if (!u) return alert("משתמש לא מחובר");
    if (!window.confirm("האם את בטוחה שברצונך למחוק את העסקה?")) return;

    try {
      await deleteDoc(doc(db, "users", u.uid, "trades", tradeId));
      alert("✅ העסקה נמחקה");
      generateCalendar(u.uid);
      setShowDayModal(false);
    } catch (err) {
      alert("❌ לא הצלחנו למחוק את העסקה");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("שגיאה בהתנתקות:", error);
    }
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
              alert("📭 אין עסקאות ליום זה");
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
      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-xl mb-4 text-center">התחברות</h2>
            <input type="email" name="email" className="w-full p-2 mb-2 bg-white/10 border border-gray-600" placeholder="אימייל" required />
            <input type="password" name="password" className="w-full p-2 mb-4 bg-white/10 border border-gray-600" placeholder="סיסמה" required />
            <button type="submit" className="w-full bg-blue-600 p-2 rounded">התחבר</button>
          </form>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-gray-800">
        <span>שלום, {userName}</span>
        <div>
          {user ? (
            <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded mr-2">🔓 התנתקות</button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-yellow-600 px-4 py-2 rounded mr-2">🔐 התחברות</button>
          )}
          <button onClick={() => setShowTradeModal(true)} className="bg-green-600 px-4 py-2 rounded">➕ הוסף עסקה</button>
        </div>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-4 p-4">{renderCalendar()}</div>

      {/* Day Trades Modal */}
      {showDayModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w/full max-w-3xl overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl mb-4 text-center">עסקאות ליום {selectedDay}</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-center">
                  <th className="p-2 border">נכס</th>
                  <th className="p-2 border">כיוון</th>
                  <th className="p-2 border">כניסה</th>
                  <th className="p-2 border">יציאה</th>
                  <th className="p-2 border">רווח</th>
                  <th className="p-2 border">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {dayTrades.map((t, idx) => (
                  <tr key={idx} className="text-center border-t">
                    <td className="p-2">{t.assetName}</td>
                    <td className="p-2">{t.direction}</td>
                    <td className="p-2">{t.entry}</td>
                    <td className="p-2">{t.exit}</td>
                    <td className="p-2">{t.result}</td>
                    <td className="p-2">
                      <button onClick={() => deleteTrade(t.id)} className="text-red-500">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowDayModal(false)} className="mt-4 w-full bg-gray-700 p-2 rounded">סגור</button>
          </div>
        </div>
      )}

      {/* Add/Edit Trade Modal */}
      <TradeModal show={showTradeModal} onClose={() => setShowTradeModal(false)} onSubmit={handleTradeSubmit} />
    </div>
  );
};

export default TradeJournal;
