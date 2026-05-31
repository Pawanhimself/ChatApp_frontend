import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ChatDashboard from "./components/ChatDashboard";
import { getMe, logoutUser } from "./services/api";

export default function App() {
  const [page, setPage]         = useState("loading");
  const [user, setUser]         = useState(null);
  const [authView, setAuthView] = useState("login");

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ Timeout add kiya — 5 sec mein response nahi aaya toh auth page dikhao
        // Mobile pe loading forever rukne ki wajah yahi thi
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 5000)
        );

        const data = await Promise.race([getMe(), timeoutPromise]);
        setUser(data);
        setPage("chat");
      } catch {
        // Koi bhi error — 401, timeout, network — auth page dikhao
        setPage("auth");
      }
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (data) => {
    setUser(data.user);
    setPage("chat");
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    finally {
      setUser(null);
      setAuthView("login");
      setPage("auth");
    }
  };

  if (page === "loading") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (page === "auth") {
    return authView === "login" ? (
      <LoginForm
        onSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthView("register")}
      />
    ) : (
      <RegisterForm
        onSuccess={() => setAuthView("login")}
        onGoToLogin={() => setAuthView("login")}
      />
    );
  }

  return <ChatDashboard user={user} onLogout={handleLogout} />;
}