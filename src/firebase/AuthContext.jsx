// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { watchAuthState } from "./firebase-auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = watchAuthState({
      onIn: (user) => {
        setUser(user);
        setLoading(false);
      },
      onOut: () => {
        setUser(null);
        setLoading(false);
      },
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);