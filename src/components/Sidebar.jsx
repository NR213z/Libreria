import { BookOpen, ShoppingCart, Settings, Package } from "lucide-react";

const navItems = [
  { id: "pedidos", label: "Pedidos", icon: ShoppingCart },
  { id: "admin", label: "Administración", icon: Settings },
];

export default function Sidebar({ vistaActual, setVistaActual }) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
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

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-bold">
            U
          </div>
          <div className="text-sm">
            <p className="font-medium">Usuario</p>
            <p className="text-xs text-slate-400">Solicitante</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
