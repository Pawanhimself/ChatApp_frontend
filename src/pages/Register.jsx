import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  MessageCircleMore,
  User,
  Mail,
  Lock,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);
const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: ""
})

const [fieldErrors, setFieldErrors] = useState({}); // 🔥 Input specific errors ke liye
const [error, setError] = useState("");             // Generic server errors ke liye
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

    const response = await api.post("/api/register", formData);

    const token = response.data.token;

    // save token
    localStorage.setItem("auth_token", token);

    // get authenticated user
    const res = await api.get("/api/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(res.data);

    alert("Account Created Successfully!");

    navigate("/dashboard");

  } catch (err) {

    console.log(err.response?.data);

    if (err.response?.status === 422) {
      setFieldErrors(err.response.data.errors);
    } else {
      setError(err.response?.data?.message || "Registration failed");
    }

  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-fuchsia-600/20 blur-3xl rounded-full top-[-120px] left-[-120px]" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/20 blur-3xl rounded-full bottom-[-120px] right-[-120px]" />

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
            <MessageCircleMore size={30} />
          </div>

          <h1 className="text-3xl font-bold mt-5">
            Create Account
          </h1>

          <p className="text-zinc-400 text-sm mt-2 text-center">
            Join your futuristic chat space 🚀
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* Username */}
          <div>
            <label className="text-sm text-zinc-300 mb-2 block">
              Name
            </label>

            <div className="flex items-center bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 focus-within:border-fuchsia-500 transition">
              <User size={18} className="text-zinc-500" />

              <input
                type="text"
                name="name"
                placeholder="shadowcoder"
                className="w-full bg-transparent outline-none px-3 py-4 text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-zinc-300 mb-2 block">
              Email
            </label>

            <div className="flex items-center bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 focus-within:border-cyan-500 transition">
              <Mail size={18} className="text-zinc-500" />

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full bg-transparent outline-none px-3 py-4 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-zinc-300 mb-2 block">
              Password
            </label>

            <div className="flex items-center bg-zinc-900/70 border border-zinc-800 rounded-xl px-4 focus-within:border-fuchsia-500 transition">
              <Lock size={18} className="text-zinc-500" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full bg-transparent outline-none px-3 py-4 text-sm"
                value={formData.password}
                onChange={handleChange}
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
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              className="accent-fuchsia-500 w-4 h-4"
            />

            <p>
              I agree to Terms & Privacy Policy
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit" 
            className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Create Account
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-sm mt-8">
          Already have an account?{" "}
          <span className="text-cyan-400 hover:underline cursor-pointer">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}