import React from 'react';
import { useAuth } from '../firebase/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import ChatEnhanced from './ChatEnhanced';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="metric-card p-8 rounded-xl text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your mentor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ChatEnhanced />;
}