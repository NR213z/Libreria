import { BookOpen, ShoppingCart, Settings, Users, LogOut, Shield } from "lucide-react";

const ALL_NAV = [
  { id: "pedidos",   label: "Pedidos",         icon: ShoppingCart, roles: ["admin", "usuario"] },
  { id: "admin",     label: "Inventario",       icon: Settings,     roles: ["admin"] },
  { id: "usuarios",  label: "Usuarios",         icon: Users,        roles: ["admin"] },
];

export default function Sidebar({ vistaActual, setVistaActual, role, user, onLogout }) {
  const navItems = ALL_NAV.filter((item) => item.roles.includes(role));
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen sticky top-0 h-screen">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">LibraPedidos</h1>
            <p className="text-xs text-slate-400">Gestión de Pedidos</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const activo = vistaActual === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setVistaActual(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activo
                  ? "bg-indigo-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-slate-700 space-y-1">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="text-sm min-w-0 flex-1">
            <p className="font-medium truncate leading-snug">{user?.email}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              {role === "admin" && <Shield size={10} />}
              {role === "admin" ? "Administrador" : "Usuario"}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
