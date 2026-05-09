import { useState, useEffect } from "react";
import { api } from "../lib/api";
import {
  UserPlus, Trash2, Shield, User,
  Loader2, AlertCircle, CheckCircle, Users,
  KeyRound, X, Eye, EyeOff
} from "lucide-react";

/* ── Modal cambio de contraseña ── */
function ModalCambioPassword({ usuario, onClose, onGuardado }) {
  const [nueva,     setNueva]     = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ver,       setVer]       = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nueva !== confirmar) { setError("Las contraseñas no coinciden"); return; }
    if (nueva.length < 4)   { setError("Mínimo 4 caracteres"); return; }
    setLoading(true);
    setError(null);
    try {
      await api.put(`/api/users/${encodeURIComponent(usuario)}/password`, { password: nueva });
      onGuardado();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <KeyRound size={16} className="text-indigo-600" />
            Cambiar contraseña
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-4 bg-slate-50 rounded-lg px-3 py-2 truncate">{usuario}</p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-700 rounded-lg p-2.5 mb-3 text-xs">
            <AlertCircle size={13} className="shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Nueva contraseña</label>
            <div className="relative">
              <input
                type={ver ? "text" : "password"}
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                autoFocus
                className="w-full px-3 py-2 pr-9 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={() => setVer(!ver)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {ver ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Confirmar contraseña</label>
            <input
              type={ver ? "text" : "password"}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repetí la contraseña"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !nueva.trim() || !confirmar.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {loading && <Loader2 size={13} className="animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Componente principal ── */
export default function GestionUsuarios() {
  const [usuarios,    setUsuarios]    = useState([]);
  const [nuevoEmail,  setNuevoEmail]  = useState("");
  const [nuevaPass,   setNuevaPass]   = useState("");
  const [nuevoRol,    setNuevoRol]    = useState("usuario");
  const [verPass,     setVerPass]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [mensaje,     setMensaje]     = useState(null);
  const [modalUser,   setModalUser]   = useState(null); // email del usuario a cambiar pass

  const cargarUsuarios = async () => {
    setLoadingList(true);
    try {
      const data = await api.get("/api/users");
      setUsuarios(data);
    } catch { /* silencioso */ }
    setLoadingList(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const flash = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const agregarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/users", { email: nuevoEmail, password: nuevaPass, role: nuevoRol });
      flash("exito", `${nuevoEmail} agregado como ${nuevoRol === "admin" ? "Administrador" : "Usuario"}.`);
      setNuevoEmail(""); setNuevaPass(""); setNuevoRol("usuario");
      await cargarUsuarios();
    } catch (err) {
      flash("error", err.message);
    }
    setLoading(false);
  };

  const eliminarUsuario = async (email) => {
    if (!confirm(`¿Eliminar el acceso de ${email}?`)) return;
    try {
      await api.delete(`/api/users/${encodeURIComponent(email)}`);
      flash("exito", `${email} eliminado.`);
      await cargarUsuarios();
    } catch (err) {
      flash("error", err.message);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen">
      {modalUser && (
        <ModalCambioPassword
          usuario={modalUser}
          onClose={() => setModalUser(null)}
          onGuardado={() => {
            setModalUser(null);
            flash("exito", `Contraseña de ${modalUser} actualizada.`);
          }}
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
        <p className="text-sm text-slate-500 mt-1">
          Solo los administradores pueden crear cuentas. Los usuarios no pueden registrarse.
        </p>
      </div>

      {/* Formulario agregar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 text-sm">
          <UserPlus size={15} className="text-indigo-600" /> Agregar usuario
        </h3>
        <form onSubmit={agregarUsuario} className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[190px]">
            <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
            <input
              type="email"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div className="min-w-[160px]">
            <label className="text-xs font-medium text-slate-600 block mb-1">Contraseña inicial</label>
            <div className="relative">
              <input
                type={verPass ? "text" : "password"}
                value={nuevaPass}
                onChange={(e) => setNuevaPass(e.target.value)}
                placeholder="Mínimo 4 caracteres"
                required
                minLength={4}
                className="w-full px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                type="button"
                onClick={() => setVerPass(!verPass)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {verPass ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Rol</label>
            <select
              value={nuevoRol}
              onChange={(e) => setNuevoRol(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !nuevoEmail.trim() || !nuevaPass.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
            Agregar
          </button>
        </form>
      </div>

      {mensaje && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
          mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {mensaje.tipo === "exito" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {mensaje.texto}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Rol</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Agregado</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600 w-28">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400">
                <Loader2 size={20} className="animate-spin mx-auto" />
              </td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No hay usuarios registrados</p>
              </td></tr>
            ) : usuarios.map((u) => (
              <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {u.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                    {u.role === "admin" ? "Administrador" : "Usuario"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => setModalUser(u.email)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                      title="Cambiar contraseña"
                    >
                      <KeyRound size={14} />
                    </button>
                    <button
                      onClick={() => eliminarUsuario(u.email)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      title="Eliminar acceso"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-4">
        {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
