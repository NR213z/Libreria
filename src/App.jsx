import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import VistaPedidos from "./components/VistaPedidos";
import VistaAdmin from "./components/VistaAdmin";
import GestionUsuarios from "./components/GestionUsuarios";
import LoginPage from "./components/LoginPage";
import { productosIniciales } from "./data/productos";

function AppContent() {
  const { user, role, loading, signOut } = useAuth();
  const [vistaActual, setVistaActual] = useState("pedidos");
  const [productos, setProductos]     = useState(productosIniciales);
  const [cantidades, setCantidades]   = useState({});

  /* ── Cargando sesión ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  /* ── Sin sesión → pantalla de login ── */
  if (!user) return <LoginPage />;

  /* ── Handlers ── */
  const handleCantidadChange = (id, cantidad) => {
    setCantidades((prev) => ({ ...prev, [id]: cantidad }));
  };

  const handleFinalizar = ({ solicitante, email, items }) => {
    console.log("=== INFORME DE PEDIDO ===");
    console.log(`Solicitante: ${solicitante}`);
    console.log(`Email:       ${email}`);
    console.log(`Fecha:       ${new Date().toLocaleDateString("es-AR")}`);
    console.log("Detalle:");
    items.forEach((item) =>
      console.log(`  - ${item.nombre}: ${item.cantidad} unidades`)
    );
    console.log(`TOTAL:       ${items.reduce((s, i) => s + i.cantidad, 0)} unidades`);
    console.log("========================");

    setProductos((prev) =>
      prev.map((p) => {
        const pedido = items.find((i) => i.id === p.id);
        return pedido ? { ...p, stock: p.stock - pedido.cantidad } : p;
      })
    );
    setCantidades({});
  };

  /* ── Render según vista y rol ── */
  const renderVista = () => {
    if (vistaActual === "pedidos") {
      return (
        <VistaPedidos
          productos={productos}
          cantidades={cantidades}
          onCantidadChange={handleCantidadChange}
          onFinalizar={handleFinalizar}
        />
      );
    }
    if (vistaActual === "admin" && role === "admin") {
      return (
        <VistaAdmin
          productos={productos}
          setProductos={setProductos}
          onLogout={signOut}
        />
      );
    }
    if (vistaActual === "usuarios" && role === "admin") {
      return <GestionUsuarios />;
    }
    // Fallback seguro
    return (
      <VistaPedidos
        productos={productos}
        cantidades={cantidades}
        onCantidadChange={handleCantidadChange}
        onFinalizar={handleFinalizar}
      />
    );
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar
        vistaActual={vistaActual}
        setVistaActual={setVistaActual}
        role={role}
        user={user}
        onLogout={signOut}
      />
      {renderVista()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
