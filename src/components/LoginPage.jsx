import { useState } from "react";
import { supabase } from "../lib/supabase";
import { BookOpen, Mail, KeyRound, Loader2, AlertCircle, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail]   = useState("");
  const [token, setToken]   = useState("");
  const [step, setStep]     = useState("email"); // "email" | "otp"
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  /* ── Paso 1: verificar email autorizado y enviar OTP ── */
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailNorm = email.toLowerCase().trim();

    // Verificar si el email está en la lista de autorizados
    const { data: autorizado, error: checkErr } = await supabase
      .from("authorized_emails")
      .select("email")
      .eq("email", emailNorm)
      .maybeSingle();

    if (checkErr || !autorizado) {
      setError("Este email no está autorizado para acceder al sistema.");
      setLoading(false);
      return;
    }

    // Enviar código OTP
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email: emailNorm,
      options: { shouldCreateUser: true },
    });

    if (otpErr) {
      setError("No se pudo enviar el código. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    setStep("otp");
    setLoading(false);
  };

  /* ── Paso 2: verificar el código OTP ── */
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email: email.toLowerCase().trim(),
      token: token.trim(),
      type: "email",
    });

    if (verifyErr) {
      setError("Código incorrecto o vencido. Podés solicitar uno nuevo.");
      setLoading(false);
      return;
    }
    // El AuthContext detecta el cambio de sesión automáticamente
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-2xl mb-3">
            <BookOpen size={32} className="text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">LibraPedidos</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">
            {step === "email"
              ? "Ingresá tu email institucional para continuar"
              : "Revisá tu bandeja de entrada"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-lg p-3 mb-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Paso 1: Email */}
        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Verificando..." : "Enviar código"}
            </button>
          </form>

        ) : (
          /* Paso 2: OTP */
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
              Enviamos un código de 6 dígitos a{" "}
              <strong className="text-slate-800">{email}</strong>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1.5">
                Código de verificación
              </label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={token}
                  onChange={(e) =>
                    setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  required
                  autoFocus
                  maxLength={6}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-center text-xl tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                El código vence en 10 minutos
              </p>
            </div>
            <button
              type="submit"
              disabled={loading || token.length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Verificando..." : "Ingresar"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setToken(""); setError(null); }}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} /> Cambiar email
            </button>
          </form>
        )}

        <p className="text-xs text-slate-400 text-center mt-6">
          Solo usuarios autorizados pueden ingresar
        </p>
      </div>
    </div>
  );
}
