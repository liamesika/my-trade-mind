// Trade Service - Unified data operations for trades
import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { firestore as db } from '../scripts/firebase-init.js';

/**
 * Data Model Structure:
 * users/{uid}/
 *   ├── profile/
 *   │   └── userProfile - User personal data
 *   ├── mentor/
 *   │   ├── settings - Mentor configuration
 *   │   └── chatSessions/{sessionId}/
 *   │       └── messages/{messageId} - Chat messages
 *   ├── trades/{tradeId} - Individual trades
 *   └── stats/
 *       └── summary - Cached trading statistics
 */

// Trade CRUD Operations
export class TradeService {
  constructor(userId) {
    this.userId = userId;
    this.tradesCollection = collection(db, 'users', userId, 'trades');
  }

  /**
   * Add a new trade
   * @param {Object} tradeData - Trade information
   * @returns {Promise<string>} - Trade ID
   */
  async addTrade(tradeData) {
    try {
      const trade = {
        ...tradeData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        tradeDate: tradeData.tradeDate || new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      };

      const docRef = await addDoc(this.tradesCollection, trade);
      console.log('✅ Trade added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding trade:', error);
      throw new Error('Failed to add trade');
    }
  }

  /**
   * Update an existing trade
   * @param {string} tradeId - Trade document ID
   * @param {Object} updates - Updated trade data
   */
  async updateTrade(tradeId, updates) {
    try {
      const tradeRef = doc(this.tradesCollection, tradeId);
      await updateDoc(tradeRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Trade updated successfully');
    } catch (error) {
      console.error('❌ Error updating trade:', error);
      throw new Error('Failed to update trade');
    }
  }

  /**
   * Delete a trade
   * @param {string} tradeId - Trade document ID
   */
  async deleteTrade(tradeId) {
    try {
      const tradeRef = doc(this.tradesCollection, tradeId);
      await deleteDoc(tradeRef);
      console.log('✅ Trade deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      throw new Error('Failed to delete trade');
    }
  }

  /**
   * Get a single trade
   * @param {string} tradeId - Trade document ID
   * @returns {Promise<Object|null>} - Trade data or null
   */
  async getTrade(tradeId) {
    try {
      const tradeRef = doc(this.tradesCollection, tradeId);
      const tradeDoc = await getDoc(tradeRef);
      
      if (tradeDoc.exists()) {
        return { id: tradeDoc.id, ...tradeDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting trade:', error);
      throw new Error('Failed to get trade');
    }
  }

  /**
   * Get all trades for a user
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of trades
   */
  async getTrades(options = {}) {
    try {
      // Use only timestamp ordering to avoid composite index requirement
      let q = query(this.tradesCollection, orderBy('timestamp', 'desc'));
      
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      // Remove date filtering from Firestore query to avoid composite index
      // Date filtering will be done on client side if needed
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamp to Date if needed
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
      }));
    } catch (error) {
      console.error('❌ Error getting trades:', error);
      throw new Error('Failed to get trades');
    }
  }

  /**
   * Subscribe to real-time trades updates
   * @param {Function} callback - Function to call when data changes
   * @param {Object} options - Query options
   * @returns {Function} - Unsubscribe function
   */
  subscribeToTrades(callback, options = {}) {
    try {
      let q = query(this.tradesCollection, orderBy('timestamp', 'desc'));
      
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      return onSnapshot(q, (querySnapshot) => {
        const trades = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
        }));
        callback(trades);
      }, (error) => {
        console.error('❌ Error in trades subscription:', error);
        throw new Error('Trades subscription failed');
      });
    } catch (error) {
      console.error('❌ Error setting up trades subscription:', error);
      throw new Error('Failed to subscribe to trades');
    }
  }

  /**
   * Get trades grouped by date
   * @returns {Promise<Object>} - Object with dates as keys and trades as values
   */
  async getTradesByDate() {
    try {
      const trades = await this.getTrades();
      const tradesByDate = {};

      trades.forEach(trade => {
        const date = trade.tradeDate || new Date(trade.timestamp).toISOString().split('T')[0];
        if (!tradesByDate[date]) {
          tradesByDate[date] = [];
        }
        tradesByDate[date].push(trade);
      });

      return tradesByDate;
    } catch (error) {
      console.error('❌ Error getting trades by date:', error);
      throw new Error('Failed to get trades by date');
    }
  }
}

// Statistics and Analytics
export class TradingStatsService {
  constructor(userId) {
    this.userId = userId;
    this.tradeService = new TradeService(userId);
    this.statsRef = doc(db, 'users', userId, 'stats', 'summary');
  }

  /**
   * Calculate trading statistics from trades
   * @param {Array} trades - Array of trade objects
   * @returns {Object} - Calculated statistics
   */
  calculateStats(trades) {
    if (!trades || trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgPnL: 0,
        bestTrade: 0,
        worstTrade: 0,
        bestDay: { date: null, pnl: 0 },
        worstDay: { date: null, pnl: 0 },
        symbolsTraded: [],
        monthlyPnL: {},
        lastUpdated: new Date()
      };
    }

    const stats = {
      totalTrades: trades.length,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      bestTrade: -Infinity,
      worstTrade: Infinity,
      symbolsTraded: new Set(),
      dailyPnL: {},
      monthlyPnL: {}
    };

    // Process each trade
    trades.forEach(trade => {
      const pnl = parseFloat(trade.pnl) || 0;
      stats.totalPnL += pnl;
      
      if (pnl > 0) stats.winningTrades++;
      else if (pnl < 0) stats.losingTrades++;
      
      stats.bestTrade = Math.max(stats.bestTrade, pnl);
      stats.worstTrade = Math.min(stats.worstTrade, pnl);
      
      // Track symbols
      if (trade.symbol) {
        stats.symbolsTraded.add(trade.symbol);
      }
      
      // Daily PnL
      const date = trade.tradeDate || new Date(trade.timestamp).toISOString().split('T')[0];
      stats.dailyPnL[date] = (stats.dailyPnL[date] || 0) + pnl;
      
      // Monthly PnL
      const month = date.substring(0, 7); // YYYY-MM
      stats.monthlyPnL[month] = (stats.monthlyPnL[month] || 0) + pnl;
    });

    // Calculate derived stats
    stats.winRate = stats.totalTrades > 0 ? (stats.winningTrades / stats.totalTrades) * 100 : 0;
    stats.avgPnL = stats.totalTrades > 0 ? stats.totalPnL / stats.totalTrades : 0;
    
    // Best and worst days
    const dailyEntries = Object.entries(stats.dailyPnL);
    if (dailyEntries.length > 0) {
      const bestDay = dailyEntries.reduce((a, b) => a[1] > b[1] ? a : b);
      const worstDay = dailyEntries.reduce((a, b) => a[1] < b[1] ? a : b);
      
      stats.bestDay = { date: bestDay[0], pnl: bestDay[1] };
      stats.worstDay = { date: worstDay[0], pnl: worstDay[1] };
    } else {
      stats.bestDay = { date: null, pnl: 0 };
      stats.worstDay = { date: null, pnl: 0 };
    }
    
    // Convert Set to Array
    stats.symbolsTraded = Array.from(stats.symbolsTraded);
    stats.lastUpdated = new Date();
    
    // Handle edge cases
    if (stats.bestTrade === -Infinity) stats.bestTrade = 0;
    if (stats.worstTrade === Infinity) stats.worstTrade = 0;
    
    return stats;
  }

  /**
   * Update cached statistics
   * @param {Array} trades - Current trades array
   */
  async updateStats(trades) {
    try {
      const stats = this.calculateStats(trades);
      await setDoc(this.statsRef, {
        ...stats,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Stats updated successfully');
      return stats;
    } catch (error) {
      console.error('❌ Error updating stats:', error);
      throw new Error('Failed to update statistics');
    }
  }

  /**
   * Get cached statistics
   * @returns {Promise<Object>} - Cached statistics
   */
  async getStats() {
    try {
      const statsDoc = await getDoc(this.statsRef);
      if (statsDoc.exists()) {
        return statsDoc.data();
      }
      
      // If no cached stats, calculate from trades
      const trades = await this.tradeService.getTrades();
      return await this.updateStats(trades);
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      throw new Error('Failed to get statistics');
    }
  }
}

// Export utility function to create service instances
export const createTradeService = (userId) => new TradeService(userId);
export const createStatsService = (userId) => new TradingStatsService(userId);