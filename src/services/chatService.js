// Chat Service - AI Mentor chat functionality
import { 
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  setDoc,
  limit
} from 'firebase/firestore';
import { firestore as db } from '../scripts/firebase-init.js';

export class ChatService {
  constructor(userId) {
    this.userId = userId;
    this.mentorRef = doc(db, 'users', userId, 'mentor', 'settings');
    this.tradesCollection = collection(db, 'users', userId, 'trades');
  }

  /**
   * Create a new chat session
   * @returns {Promise<string>} - Session ID
   */
  async createChatSession() {
    try {
      const sessionsCollection = collection(db, 'users', this.userId, 'chatSessions');
      const sessionDoc = await addDoc(sessionsCollection, {
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        messageCount: 0
      });
      
      console.log('✅ Chat session created:', sessionDoc.id);
      return sessionDoc.id;
    } catch (error) {
      console.error('❌ Error creating chat session:', error);
      throw new Error('Failed to create chat session');
    }
  }

  /**
   * Send a message in a chat session
   * @param {string} sessionId - Chat session ID
   * @param {string} message - Message content
   * @param {string} sender - 'user' or 'assistant'
   * @param {Object} metadata - Additional message metadata
   * @returns {Promise<string>} - Message ID
   */
  async sendMessage(sessionId, message, sender = 'user', metadata = {}) {
    try {
      const messagesCollection = collection(
        db, 
        'users', 
        this.userId, 
        'chatSessions', 
        sessionId, 
        'messages'
      );

      const messageDoc = await addDoc(messagesCollection, {
        content: message,
        sender,
        timestamp: serverTimestamp(),
        ...metadata
      });

      // Update session last activity
      const sessionRef = doc(db, 'users', this.userId, 'chatSessions', sessionId);
      await setDoc(sessionRef, {
        lastActivity: serverTimestamp(),
        messageCount: (await this.getMessageCount(sessionId)) + 1
      }, { merge: true });

      console.log('✅ Message sent:', messageDoc.id);
      return messageDoc.id;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get messages from a chat session
   * @param {string} sessionId - Chat session ID
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessages(sessionId) {
    try {
      const messagesCollection = collection(
        db, 
        'users', 
        this.userId, 
        'chatSessions', 
        sessionId, 
        'messages'
      );

      const q = query(messagesCollection, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
      }));
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      throw new Error('Failed to get messages');
    }
  }

  /**
   * Subscribe to real-time messages in a chat session
   * @param {string} sessionId - Chat session ID
   * @param {Function} callback - Function to call when messages change
   * @returns {Function} - Unsubscribe function
   */
  subscribeToMessages(sessionId, callback) {
    try {
      const messagesCollection = collection(
        db, 
        'users', 
        this.userId, 
        'chatSessions', 
        sessionId, 
        'messages'
      );

      const q = query(messagesCollection, orderBy('timestamp', 'asc'));
      
      return onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
        }));
        callback(messages);
      }, (error) => {
        console.error('❌ Error in messages subscription:', error);
      });
    } catch (error) {
      console.error('❌ Error setting up messages subscription:', error);
      throw new Error('Failed to subscribe to messages');
    }
  }

  /**
   * Get chat sessions for a user
   * @returns {Promise<Array>} - Array of chat sessions
   */
  async getChatSessions() {
    try {
      const sessionsCollection = collection(db, 'users', this.userId, 'chatSessions');
      const q = query(sessionsCollection, orderBy('lastActivity', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        lastActivity: doc.data().lastActivity?.toDate?.() || doc.data().lastActivity
      }));
    } catch (error) {
      console.error('❌ Error getting chat sessions:', error);
      throw new Error('Failed to get chat sessions');
    }
  }

  /**
   * Get mentor settings for a user
   * @returns {Promise<Object|null>} - Mentor settings or null
   */
  async getMentorSettings() {
    try {
      const mentorDoc = await getDoc(this.mentorRef);
      if (mentorDoc.exists()) {
        return mentorDoc.data();
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting mentor settings:', error);
      throw new Error('Failed to get mentor settings');
    }
  }

  /**
   * Update mentor settings
   * @param {Object} mentorData - Mentor configuration
   */
  async updateMentorSettings(mentorData) {
    try {
      await setDoc(this.mentorRef, {
        ...mentorData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('✅ Mentor settings updated');
    } catch (error) {
      console.error('❌ Error updating mentor settings:', error);
      throw new Error('Failed to update mentor settings');
    }
  }

  /**
   * Get recent user trades for analysis
   * @param {number} limitCount - Number of recent trades to get
   * @returns {Promise<Array>} - Array of recent trades
   */
  async getRecentTrades(limitCount = 20) {
    try {
      const q = query(this.tradesCollection, orderBy('timestamp', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
      }));
    } catch (error) {
      console.error('❌ Error getting recent trades:', error);
      return []; // Return empty array if trades can't be loaded
    }
  }

  /**
   * Get AI response for a user message
   * @param {string} sessionId - Chat session ID
   * @param {string} userMessage - User's message content
   * @returns {Promise<void>}
   */
  async getAIResponse(sessionId, userMessage) {
    try {
      // Get recent messages for context
      const messages = await this.getMessages(sessionId);
      const recentMessages = messages.slice(-10); // Last 10 messages for context

      // Get recent trades for analysis
      const recentTrades = await this.getRecentTrades(15);
      
      // Create trading context for AI
      let tradingContext = '';
      if (recentTrades.length > 0) {
        const tradesAnalysis = this.analyzeTrades(recentTrades);
        tradingContext = `

USER'S TRADING DATA ANALYSIS:
${tradesAnalysis}

Use this trading data to provide personalized advice based on the user's actual trading patterns, strengths, and areas for improvement.`;
      }

      // Format messages for OpenAI
      const formattedMessages = [
        {
          role: 'system',
          content: `You are an experienced trading mentor. Analyze the user's trading history and provide personalized advice based on their actual trades. Be supportive, educational, and specific to their trading patterns. Keep responses concise but insightful.${tradingContext}`
        },
        ...recentMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      ];

      // Call Firebase function
      const response = await fetch('https://europe-west1-mytrademind-e1451.cloudfunctions.net/callOpenAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: formattedMessages })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.reply;

      // Save AI response to Firestore
      await this.sendMessage(sessionId, aiReply, 'assistant');

      console.log('✅ AI response generated and saved');
    } catch (error) {
      console.error('❌ Error getting AI response:', error);
      
      // Save error response
      await this.sendMessage(sessionId, 'Sorry, I encountered an error while processing your message. Please try again.', 'assistant');
    }
  }

  /**
   * Analyze trades to create insights for AI mentor
   * @param {Array} trades - Array of trade objects
   * @returns {string} - Formatted analysis string
   * @private
   */
  analyzeTrades(trades) {
    if (!trades || trades.length === 0) return 'No recent trades available for analysis.';

    // Calculate key statistics
    const totalTrades = trades.length;
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
    const losingTrades = trades.filter(t => (t.pnl || 0) < 0).length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : 0;
    
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgPnL = totalTrades > 0 ? (totalPnL / totalTrades).toFixed(2) : 0;
    
    // Get most traded symbols
    const symbolCounts = {};
    trades.forEach(t => {
      if (t.symbol) {
        symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;
      }
    });
    const mostTradedSymbols = Object.entries(symbolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symbol, count]) => `${symbol} (${count} trades)`)
      .join(', ');

    // Recent trades summary (last 5)
    const recentTradesInfo = trades.slice(0, 5).map(t => {
      const date = new Date(t.tradeDate || t.timestamp).toISOString().split('T')[0];
      const pnl = (t.pnl || 0).toFixed(2);
      const symbol = t.symbol || 'Unknown';
      const side = t.side || 'Unknown';
      return `${date}: ${symbol} ${side} P&L: $${pnl}`;
    }).join('\n');

    return `Total Trades: ${totalTrades}
Win Rate: ${winRate}% (${winningTrades} wins, ${losingTrades} losses)
Total P&L: $${totalPnL.toFixed(2)}
Average P&L per trade: $${avgPnL}
Most traded symbols: ${mostTradedSymbols || 'None'}

Recent trades:
${recentTradesInfo}`;
  }

  /**
   * Helper method to get message count for a session
   * @private
   */
  async getMessageCount(sessionId) {
    try {
      const sessionRef = doc(db, 'users', this.userId, 'chatSessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);
      return sessionDoc.exists() ? sessionDoc.data().messageCount || 0 : 0;
    } catch (error) {
      console.error('❌ Error getting message count:', error);
      return 0;
    }
  }
}

// Export utility function
export const createChatService = (userId) => new ChatService(userId);