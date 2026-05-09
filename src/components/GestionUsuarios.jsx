import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  UserPlus, Trash2, Shield, User,
  Loader2, AlertCircle, CheckCircle, Users
} from "lucide-react";

export default function GestionUsuarios() {
  const [usuarios, setUsuarios]       = useState([]);
  const [nuevoEmail, setNuevoEmail]   = useState("");
  const [nuevoRol, setNuevoRol]       = useState("usuario");
  const [loading, setLoading]         = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [mensaje, setMensaje]         = useState(null);

  /* ── Cargar lista ── */
  const cargarUsuarios = async () => {
    setLoadingList(true);
    const { data } = await supabase
      .from("authorized_emails")
      .select("*")
      .order("created_at", { ascending: true });
    setUsuarios(data ?? []);
    setLoadingList(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const flash = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  /* ── Agregar usuario ── */
  const agregarUsuario = async (e) => {
    e.preventDefault();
    if (!nuevoEmail.trim()) return;
    setLoading(true);

    const { error } = await supabase
      .from("authorized_emails")
      .insert({ email: nuevoEmail.toLowerCase().trim(), role: nuevoRol });

    if (error) {
      flash(
        "error",
        error.code === "23505"
          ? "Ese email ya está registrado."
          : "Error al agregar el usuario. Revisá los permisos."
      );
    } else {
      flash("exito", `${nuevoEmail} agregado como ${nuevoRol === "admin" ? "Administrador" : "Usuario"}.`);
      setNuevoEmail("");
      setNuevoRol("usuario");
      await cargarUsuarios();
    }
    setLoading(false);
  };

  /* ── Eliminar usuario ── */
  const eliminarUsuario = async (email) => {
    if (!confirm(`¿Eliminar el acceso de ${email}?`)) return;
    const { error } = await supabase
      .from("authorized_emails")
      .delete()
      .eq("email", email);
    if (!error) {
      flash("exito", `${email} eliminado del sistema.`);
      await cargarUsuarios();
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
        <p className="text-sm text-slate-500 mt-1">
          Administrá los emails autorizados para acceder al sistema
        </p>
      </div>

      {/* Formulario agregar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-4">
        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 text-sm">
          <UserPlus size={15} className="text-indigo-600" />
          Agregar usuario
        </h3>
        <form onSubmit={agregarUsuario} className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
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
            disabled={loading || !nuevoEmail.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {loading
              ? <Loader2 size={14} className="animate-spin" />
              : <UserPlus size={14} />
            }
            Agregar
          </button>
        </form>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
          mensaje.tipo === "exito"
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}>
          {mensaje.tipo === "exito"
            ? <CheckCircle size={15} />
            : <AlertCircle size={15} />}
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
              <th className="text-center px-4 py-3 font-semibold text-slate-600 w-20">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loadingList ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">
                  <Loader2 size={20} className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400">
                  <Users size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No hay usuarios registrados</p>
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.email} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {u.role === "admin"
                        ? <Shield size={10} />
                        : <User size={10} />}
                      {u.role === "admin" ? "Administrador" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => eliminarUsuario(u.email)}
                      title="Eliminar acceso"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 mt-4">
        {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
