import { useState } from "react";
import { loginUser } from "../services/api";

export default function LoginForm({ onSuccess, onGoToRegister }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError("");
    try {
      const response = await loginUser(formData);
      onSuccess(response);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else if (err.message) setGeneralError(err.message);
      else setGeneralError("Kuch gadbad ho gayi. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      {/* subtle glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg shadow-indigo-600/30">
            💬
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-zinc-500 text-sm mt-1">Apne account mein login karo</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">

          {generalError && (
            <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tumhari@email.com"
                disabled={loading}
                className={`bg-zinc-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                  disabled:opacity-50
                  ${errors.email ? "border-red-500" : "border-zinc-700"}`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email[0]}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                className={`bg-zinc-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all
                  focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                  disabled:opacity-50
                  ${errors.password ? "border-red-500" : "border-zinc-700"}`}
              />
              {errors.password && <p className="text-xs text-red-400">{errors.password[0]}</p>}
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                text-white font-semibold text-sm py-3 rounded-xl transition-all
                hover:shadow-lg hover:shadow-indigo-600/25 active:scale-95 flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Login ho raha hai..." : "Login Karo"}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500 mt-5">
          Account nahi hai?{" "}
          <button
            type="button"
            onClick={onGoToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Register karo
          </button>
        </p>

      </div>
    </div>
  );
}