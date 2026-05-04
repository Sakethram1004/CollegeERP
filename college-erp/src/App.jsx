import { useState, useEffect } from "react";
import LoginPage from "./LoginPage";
import CollegeERP from "./CollegeERP";
import { clearAuth, getUser, setStoredValue, clearStoredValue } from "./api";

const PAGE_STORAGE_KEY = "erp_current_page";

export default function App() {
  const [user, setUser] = useState(null);

  // Load persisted session on startup
  useEffect(() => {
    const savedUser = getUser();
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogin = (role, name) => {
    // api.js setAuth() already wrote erp_token + erp_user to localStorage
    // Start each new session from the dashboard instead of the last visited page
    setStoredValue(PAGE_STORAGE_KEY, "dashboard");
    setUser({ role, name });
  };

  const handleLogout = () => {
    clearAuth();
    clearStoredValue(PAGE_STORAGE_KEY);
    setUser(null);
  };

  return user ? (
    <CollegeERP
      initialRole={user.role}   // CollegeERP expects "initialRole", not "role"
      userName={user.name}      // CollegeERP expects "userName", not "name"
      onLogout={handleLogout}
    />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}
