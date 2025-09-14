import { useEffect, useState } from "react";
import { createTradeService } from "../services/tradeService";

export default function TradingCalendar({ currentUser, currentDate, onDayClick, onDayTradesClick }) {
  const [tradesData, setTradesData] = useState([]);
  const [tradeService, setTradeService] = useState(null);

  // Initialize trade service
  useEffect(() => {
    if (currentUser?.uid) {
      const ts = createTradeService(currentUser.uid);
      setTradeService(ts);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchTradesData = async () => {
      if (!tradeService || !currentDate) return;
      
      try {
        // Get all trades without date filtering to avoid composite index
        const trades = await tradeService.getTrades();
        
        // Filter trades for current month on client side
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        const monthlyTrades = trades.filter(trade => {
          const tradeDate = trade.tradeDate || new Date(trade.timestamp?.toDate ? trade.timestamp.toDate() : trade.timestamp).toISOString().split('T')[0];
          const tradeYear = parseInt(tradeDate.split('-')[0]);
          const tradeMonth = parseInt(tradeDate.split('-')[1]) - 1; // JS months are 0-indexed
          
          return tradeYear === currentYear && tradeMonth === currentMonth;
        });
        
        // Group trades by date
        const tradesByDate = {};
        monthlyTrades.forEach(trade => {
          const tradeDate = trade.tradeDate || new Date(trade.timestamp?.toDate ? trade.timestamp.toDate() : trade.timestamp).toISOString().split('T')[0];
          const day = parseInt(tradeDate.split('-')[2]);
          
          if (!tradesByDate[day]) {
            tradesByDate[day] = [];
          }
          tradesByDate[day].push(trade);
        });

        setTradesData(tradesByDate);
      } catch (error) {
        console.error("Error fetching trades data:", error);
      }
    };

    fetchTradesData();
  }, [tradeService, currentDate]);

  const getDaysInMonth = () => {
    if (!currentDate) return 31; // fallback
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Note: PnL calculation removed as we only show trade counts on calendar

  const renderDay = (day) => {
    const dayTrades = tradesData[day] || [];
    const hasTrades = dayTrades.length > 0;

    let className = "calendar-day h-20 rounded-lg p-2 cursor-pointer flex flex-col justify-between ";

    // Only show green for days with trades (no red/profit indication)
    if (hasTrades) {
      className += "profit-day "; // Always use green styling for days with trades
    }

    const handleClick = () => {
      const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      
      if (hasTrades && onDayTradesClick) {
        // Show trades popup if there are trades for this day
        onDayTradesClick(clickDate, dayTrades);
      } else if (onDayClick) {
        // Open trade modal for adding new trade
        onDayClick(clickDate);
      }
    };

    return (
      <div
        key={day}
        className={className}
        onClick={handleClick}
      >
        <span className="text-sm font-semibold">{day}</span>
        <div className="flex flex-col items-end text-right">
          {hasTrades && (
            <span className="text-xs text-gray-300">
              {dayTrades.length} trade{dayTrades.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Early return if required props are missing  
  if (!currentDate) {
    return <div className="grid grid-cols-7 gap-1 md:gap-2" style={{minHeight: '200px'}}></div>;
  }

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