// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { watchAuthState, login, register, logout } from "./firebase-auth";
import toastService from "../services/toastService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchAuthState({
      onIn: (user) => {
        setUser(user);
        setLoading(false);
        console.log("✅ User signed in:", user.email);
      },
      onOut: () => {
        setUser(null);
        setLoading(false);
        console.log("👋 User signed out");
      },
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const user = await login(email, password);
      toastService.success("Welcome back!");
      return user;
    } catch (error) {
      console.error("❌ Sign in error:", error);
      let errorMessage = "Sign in failed. Please try again.";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      toastService.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      const user = await register(email, password, displayName);
      toastService.success("Account created successfully!");
      return user;
    } catch (error) {
      console.error("❌ Sign up error:", error);
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Please enter a valid email address.";
      }
      
      toastService.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await logout();
      toastService.success("Signed out successfully");
    } catch (error) {
      console.error("❌ Sign out error:", error);
      toastService.error("Failed to sign out. Please try again.");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);