import { useEffect, useState } from "react";
import { getDocs, query, collection } from "firebase/firestore";
import { db } from "../firebase/firebase"; // נתיב מותאם לפי פרויקט שלך

export default function CalendarGrid({ currentUser, currentDate, onDayClick }) {
  const [journalData, setJournalData] = useState([]);

  useEffect(() => {
    const fetchJournalData = async () => {
      if (!currentUser || !currentDate) return;
      try {
        const q = query(collection(db, "dailyJournals"));
        const snapshot = await getDocs(q);
        const entries = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.userId === currentUser.uid &&
            data.year === currentDate.getFullYear() &&
            data.month === currentDate.getMonth() + 1
          ) {
            entries.push(data);
          }
        });

        setJournalData(entries);
      } catch (error) {
        console.error("Error fetching journal data:", error);
      }
    };

    fetchJournalData();
  }, [currentUser, currentDate]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const renderDay = (day) => {
    const entry = journalData.find((d) => d.day === day);

    let className = "calendar-day h-20 rounded-lg p-2 cursor-pointer flex flex-col justify-between ";
    let pnlDisplay = null;

    if (entry) {
      if (entry.dailyPnL > 0) {
        className += "profit-day ";
        pnlDisplay = `+$${Math.abs(entry.dailyPnL).toLocaleString()}`;
      } else if (entry.dailyPnL < 0) {
        className += "loss-day ";
        pnlDisplay = `-$${Math.abs(entry.dailyPnL).toLocaleString()}`;
      } else if (entry.totalTrades === 0) {
        className += "no-trade-day ";
        pnlDisplay = "No Trading";
      }
    }

    return (
      <div
        key={day}
        className={className}
              onClick={() =>
          onDayClick(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
        }

      >
        <span className="text-sm font-semibold">{day}</span>
        {pnlDisplay && <span className="text-xs font-bold">{pnlDisplay}</span>}
      </div>
    );
  };

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-7 gap-1 md:gap-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div
          key={day}
          className="text-center py-3 text-gray-400 font-semibold"
        >
          {day}
        </div>
      ))}
      {days.map((day) => renderDay(day))}
    </div>
  );
}
