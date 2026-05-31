import { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ChatDashboard from "./components/ChatDashboard";
import { getMe, logoutUser } from "./services/api";

export default function App() {
  const [page, setPage]       = useState("loading");
  const [user, setUser]       = useState(null);
  const [authView, setAuthView] = useState("login");

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Cookie hai toh /me kaam karega, nahi hai toh 401 aayega
        // localStorage check karne ki zarurat nahi — cookie browser khud manage karta hai
        const data = await getMe();
        setUser(data);
        setPage("chat");
      } catch {
        setPage("auth");
      }
    };
    initAuth();
  }, []);

  const handleLoginSuccess = (data) => {
    // Sirf user state save karo — token store karne ki zarurat nahi
    setUser(data.user);
    setPage("chat");
  };

  const handleLogout = async () => {
    try {
      await logoutUser(); // Laravel session destroy karega, cookie clear karega
    } catch {
      // Kuch bhi ho — logout toh karo
    } finally {
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