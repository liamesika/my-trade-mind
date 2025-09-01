// scripts/journal.js - גרסה מתוקנת עם Firebase מודולרי (v9)

import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { auth, db } from "./firebase-init.js";
import { signInWithEmailAndPassword } from "firebase/auth";

window.openAddTradeModal = () => document.getElementById("trade-modal-overlay")?.classList.remove("hidden");
window.closeAddTradeModal = () => document.getElementById("trade-modal-overlay")?.classList.add("hidden");
window.openLoginModal = () => document.getElementById("login-modal-overlay")?.classList.remove("hidden");
window.closeLoginModal = () => document.getElementById("login-modal-overlay")?.classList.add("hidden");
console.log("✅ מודלים מוכנים", window.openAddTradeModal, window.closeLoginModal);

window.openDayTradesModal = function (dateStr, trades) {
  const modal = document.getElementById("day-trades-modal");
  const title = document.getElementById("day-trades-title");
  const tbody = document.getElementById("day-trades-table-body");

  title.textContent = `עסקאות ליום ${dateStr}`;
  tbody.innerHTML = "";

  trades.forEach((trade) => {
    const row = document.createElement("tr");
    row.className = "border-t border-gray-700 text-center bg-white text-black";
    row.innerHTML = `
      <td class="p-2 font-semibold">${trade.assetName}</td>
      <td class="p-2">${trade.direction}</td>
      <td class="p-2">${trade.entry}</td>
      <td class="p-2">${trade.exit}</td>
      <td class="p-2 flex flex-col gap-2 items-center justify-center">
        <span>${trade.result}</span>
        <div class="flex gap-2">
          <button onclick="editTrade('${trade.id}')" class="text-blue-600 hover:underline text-xs">✏️ ערוך</button>
          <button onclick="deleteTrade('${trade.id}', '${dateStr}')" class="text-red-600 hover:underline text-xs">🗑️ מחק</button>
        </div>
      </td>
    `;

    const noteRow = document.createElement("tr");
    noteRow.innerHTML = `
      <td colspan="5" class="bg-yellow-100 text-black text-sm italic px-4 py-2 text-right border-b border-gray-400">
        📌 הערה: ${trade.reason || '---'}
      </td>
    `;

    tbody.appendChild(row);
    tbody.appendChild(noteRow);
  });

  modal.classList.remove("hidden");
};

window.closeDayTradesModal = () => document.getElementById("day-trades-modal")?.classList.add("hidden");

window.deleteTrade = async (tradeId, dateStr) => {
  const user = auth.currentUser;
  if (!user) return alert("משתמש לא מחובר");

  if (!confirm("האם את בטוחה שברצונך למחוק את העסקה?")) return;

  try {
    await deleteDoc(doc(db, "users", user.uid, "trades", tradeId));
    alert("✅ העסקה נמחקה");
    window.generateCalendar();
    window.closeDayTradesModal();
  } catch (err) {
    console.error("שגיאה במחיקת עסקה:", err);
    alert("❌ לא הצלחנו למחוק את העסקה");
  }
};

window.editTrade = async (tradeId) => {
  const user = auth.currentUser;
  if (!user) return alert("משתמש לא מחובר");

  try {
    const docRef = doc(db, "users", user.uid, "trades", tradeId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return alert("⚠️ עסקה לא נמצאה");

    const trade = docSnap.data();
    const form = document.getElementById("trade-form");
    if (!form) return;

    form.dataset.editingId = tradeId;
    for (const [key, value] of Object.entries(trade)) {
      if (form[key]) form[key].value = value;
    }

    closeDayTradesModal();
    openAddTradeModal();
  } catch (err) {
    console.error("שגיאה בשליפת עסקה לעריכה:", err);
    alert("❌ לא ניתן לערוך את העסקה");
  }
};

window.generateCalendar = async () => {
  const container = document.getElementById("trade-calendar");
  if (!container) return;
  container.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  for (let i = 0; i < startDay; i++) container.appendChild(document.createElement("div"));

  const user = auth.currentUser;
  const tradesMap = {};

  if (user) {
    const snap = await getDocs(collection(db, "users", user.uid, "trades"));
    snap.forEach((docSnap) => {
      const trade = docSnap.data();
      trade.id = docSnap.id;
      const dateKey = trade.datetime?.split("T")[0];
      if (dateKey) {
        tradesMap[dateKey] = tradesMap[dateKey] || [];
        tradesMap[dateKey].push(trade);
      }
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const tradesForDay = tradesMap[dateStr] || [];
    const cell = document.createElement("div");

    cell.className = "p-3 border border-blue-800 rounded bg-white/10 hover:bg-white/20 transition cursor-pointer";
    cell.innerHTML = `
      <div class="text-sm font-bold mb-2">${dateStr}</div>
      ${tradesForDay.length ? tradesForDay.map(t => `<div class="text-xs text-green-300">🟢 ${t.assetName} - ${t.result}$</div>`).join("") : '<div class="text-xs text-gray-300">אין עסקאות</div>'}
    `;

    cell.addEventListener("click", () => {
      if (tradesForDay.length > 0) openDayTradesModal(dateStr, tradesForDay);
      else alert("📭 אין עסקאות ליום זה");
    });

    container.appendChild(cell);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.generateCalendar();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("userName", user.email);
      const nameEl = document.getElementById("user-name");
      if (nameEl) nameEl.textContent = `שלום, ${user.email}`;
    } else {
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddTradeModal();
      closeLoginModal();
      closeDayTradesModal();
    }
  });

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem("userId", userCredential.user.uid);
        localStorage.setItem("userName", userCredential.user.email);
        alert("✅ התחברת בהצלחה!");
        closeLoginModal();
        location.reload();
      } catch (err) {
        alert("❌ שגיאה בהתחברות: " + err.message);
      }
    });
  }

  const tradeForm = document.getElementById("trade-form");
  if (tradeForm && !tradeForm.dataset.listenerAttached) {
    tradeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) return alert("⛔ המשתמש לא מחובר");

      const formData = new FormData(tradeForm);
      const trade = Object.fromEntries(formData.entries());
      trade.entry = parseFloat(trade.entry);
      trade.exit = parseFloat(trade.exit);
      trade.result = parseFloat(trade.result);
      trade.createdAt = new Date();

      try {
        const editingId = tradeForm.dataset.editingId;
        const docRef = editingId
          ? doc(db, "users", user.uid, "trades", editingId)
          : collection(db, "users", user.uid, "trades");

        editingId ? await setDoc(docRef, trade) : await addDoc(docRef, trade);
        alert(editingId ? "✅ עסקה עודכנה בהצלחה!" : "✅ עסקה נשמרה בהצלחה!");

        tradeForm.reset();
        delete tradeForm.dataset.editingId;
        closeAddTradeModal();
        generateCalendar();
      } catch (err) {
        console.error("שגיאה בשמירת עסקה:", err);
        alert("❌ שגיאה בשמירה");
      }
    });
    tradeForm.dataset.listenerAttached = "true";
  }
});