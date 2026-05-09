import { useState } from "react";
import { Lock, User, BookOpen, AlertCircle } from "lucide-react";

const CREDENCIALES = { usuario: "admin", contrasena: "libreria2024" };

export default function LoginAdmin({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(false);
  const [intentos, setIntentos] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (usuario === CREDENCIALES.usuario && contrasena === CREDENCIALES.contrasena) {
      setError(false);
      onLogin();
    } else {
      setError(true);
      setIntentos((n) => n + 1);
      setContrasena("");
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-2xl mb-4">
            <BookOpen size={28} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Acceso Administrativo</h2>
          <p className="text-sm text-slate-500 mt-1">Solo personal autorizado</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setError(false); }}
                placeholder="Usuario"
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={contrasena}
                onChange={(e) => { setContrasena(e.target.value); setError(false); }}
                placeholder="Contraseña"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle size={16} />
              <span>
                Credenciales incorrectas.
                {intentos >= 2 && <span className="font-medium"> Hint: admin / libreria2024</span>}
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors mt-2 cursor-pointer"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Solo administradores pueden acceder a este panel
        </p>
      </div>
    </div>
  );
}
