import React, { useState } from "react";
import {
  MessageCircle,
  Mail,
  Lock,
  User,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";


export default function AuthPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  
  const login = async() => {
    await api.get("/sanctum/csrf-cookie");

    const response = await api.post("/api/login", {
      email: email,
      password: password,
    });

    console.log(response);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative px-4">

      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl top-[-100px] left-[-100px] animate-pulse"></div>

      <div className="absolute w-[400px] h-[400px] bg-cyan-500/30 rounded-full blur-3xl bottom-[-100px] right-[-100px] animate-pulse"></div>

      {/* Floating Grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff22_1px,transparent_1px),linear-gradient(to_bottom,#ffffff22_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-8 transition-all duration-500">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-60 animate-pulse rounded-full"></div>

              <div className="relative bg-gradient-to-r from-cyan-400 to-purple-500 p-4 rounded-2xl">
                <MessageCircle className="text-white w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>

            <p className="text-gray-300 mt-2">
              {isLogin
                ? "Login and continue your chats 🚀"
                : "Join the conversation galaxy ✨"}
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5">

            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-4 text-gray-400 group-focus-within:text-cyan-400 transition" />

                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300"
                />
              </div>
            )}

            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-gray-400 group-focus-within:text-cyan-400 transition" />

              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-cyan-400 transition" />

              <input
                type="password"
                placeholder="Password"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300"
              />
            </div>

            {!isLogin && (
              <div className="relative group">
                <Lock className="absolute left-4 top-4 text-gray-400 group-focus-within:text-purple-400 transition" />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300"
                />
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-[1.02] active:scale-[0.98] text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/20"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles size={18} />

                {isLogin ? "Login Now" : "Create Account"}
              </span>

              <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition"></div>
            </button>
          </form>

          {/* Switch */}
          <p className="text-center text-gray-400 mt-8">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300 cursor-pointer ml-2 font-semibold transition"
            >
              {isLogin ? "Register" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}