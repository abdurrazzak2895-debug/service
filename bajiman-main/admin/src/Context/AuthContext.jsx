/* eslint-disable react-refresh/only-export-components */
// context/AuthProvider.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

// 👇 Demo user
const DEMO_USER = {
  name: "Demo User",
  email: "demo@example.com",
  password: "demo123", // ⚠️ demo only
  phone: "01700000000",
};

const AuthProvider = ({ children }) => {
  // 👇 null এর জায়গায় demo user
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────────────────────
  // This legacy context does not own the admin session. The Redux auth slice
  // rehydrates the server-backed session through the HttpOnly cookie.
  // ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("Failed to load auth:", err);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ────────────────────────────────────────────────
  // STRICT AUTH CHECK
  // ────────────────────────────────────────────────
  const isProfileComplete =
    !!user &&
    !!user.email &&
    !!user.password &&
    !!user.name &&
    !!user.phone;

  const authInfo = {
    user,
    token,
    loading,

    // 🔐 PrivateRoute allow only if profile complete
    isAuthenticated: isProfileComplete,

    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
