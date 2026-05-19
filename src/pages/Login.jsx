import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function LoginPage() {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setFieldErrors({});
    setLoading(true);

    try {

      const response = await api.post("/api/login", formData);

      const token = response.data.token;

      // save token
      localStorage.setItem("auth_token", token);

      // get logged user
      const res = await api.get("/api/me");

      navigate("/dashboard");

    } catch (err) {

      console.log(err.response?.data);

      if (err.response?.status === 422) {
        setFieldErrors(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || "Login failed");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8">

        <h1 className="text-3xl text-white font-bold mb-8 text-center">
          Login
        </h1>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>

            <div className="flex items-center bg-zinc-900 rounded-xl px-4">
              <Mail size={18} className="text-zinc-500" />

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent outline-none px-3 py-4 text-white"
              />
            </div>

            {fieldErrors.email && (
              <p className="text-red-400 text-sm mt-1">
                {fieldErrors.email[0]}
              </p>
            )}
          </div>

          {/* Password */}
        <div>

        <div className="flex items-center bg-zinc-900 rounded-xl px-4">

            <Lock size={18} className="text-zinc-500" />

            <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-transparent outline-none px-3 py-4 text-white"
            />

            <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-zinc-500 hover:text-white transition"
            >
            {showPassword ? (
                <EyeOff size={18} />
            ) : (
                <Eye size={18} />
            )}
            </button>

        </div>

        {fieldErrors.password && (
            <p className="text-red-400 text-sm mt-1">
            {fieldErrors.password[0]}
            </p>
        )}

        </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold"
          >
            {loading ? "Loading..." : "Login"}
          </button>

        </form>
      </div>
    </div>
  );
}