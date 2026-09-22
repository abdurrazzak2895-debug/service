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
  const [token, setToken] = useState("demo-token");
  const [loading, setLoading] = useState(true);

  // ────────────────────────────────────────────────
  // Load user & token from localStorage (if exists)
  // ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (err) {
      console.error("Failed to load auth:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
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
