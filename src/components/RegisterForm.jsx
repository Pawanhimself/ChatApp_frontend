import { useState } from "react";
import { registerUser } from "../services/api";

// ✅ Field ko BAHAR rakha — ab yeh re-render pe naya nahi banega
// Pehle andar tha isliye har keystroke pe focus kho jaata tha
const Field = ({ label, name, type = "text", placeholder, value, onChange, disabled, error }) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`bg-zinc-800 border rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all
        focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
        disabled:opacity-50
        ${error ? "border-red-500" : "border-zinc-700"}`}
    />
    {error && <p className="text-xs text-red-400">{error[0]}</p>}
  </div>
);

export default function RegisterForm({ onSuccess, onGoToLogin }) {
  const [formData, setFormData] = useState({ name:"", email:"", password:"", password_confirmation:"" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = ["Naam daalna zaroori hai"];
    if (!formData.email.trim()) e.email = ["Email daalna zaroori hai"];
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = ["Valid email daalo"];
    if (formData.password.length < 8) e.password = ["Min 8 characters chahiye"];
    if (formData.password !== formData.password_confirmation) e.password_confirmation = ["Passwords match nahi kar rahe"];
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ce = validateForm();
    if (Object.keys(ce).length > 0) { setErrors(ce); return; }
    setLoading(true); setErrors({}); setGeneralError("");
    try {
      await registerUser(formData);
      onSuccess();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else if (err.message) setGeneralError(err.message);
      else setGeneralError("Registration nahi ho payi.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">

      <div className="fixed bottom-0 right-1/3 w-[500px] h-[250px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg shadow-indigo-600/30">
            ✦
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Naaya Account</h1>
          <p className="text-zinc-500 text-sm mt-1">Join karo aur chat shuru karo</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">

          {generalError && (
            <div className="mb-5 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label="Poora Naam"            name="name"                  placeholder="Tumhara Naam"      value={formData.name}                  onChange={handleChange} disabled={loading} error={errors.name} />
            <Field label="Email"                 name="email"       type="email"    placeholder="tumhari@email.com" value={formData.email}                 onChange={handleChange} disabled={loading} error={errors.email} />
            <Field label="Password"              name="password"    type="password" placeholder="•••••••• (min 8)"  value={formData.password}              onChange={handleChange} disabled={loading} error={errors.password} />
            <Field label="Password Confirm Karo" name="password_confirmation" type="password" placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} disabled={loading} error={errors.password_confirmation} />

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
              {loading ? "Account ban raha hai..." : "Register Karo"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Pehle se account hai?{" "}
          <button type="button" onClick={onGoToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Login karo
          </button>
        </p>

      </div>
    </div>
  );
}