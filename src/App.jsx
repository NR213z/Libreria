import { useState } from "react";
import Sidebar from "./components/Sidebar";
import VistaPedidos from "./components/VistaPedidos";
import VistaAdmin from "./components/VistaAdmin";
import LoginAdmin from "./components/LoginAdmin";
import { productosIniciales } from "./data/productos";

export default function App() {
  const [vistaActual, setVistaActual] = useState("pedidos");
  const [productos, setProductos] = useState(productosIniciales);
  const [cantidades, setCantidades] = useState({});
  const [adminAutenticado, setAdminAutenticado] = useState(false);

  const handleCantidadChange = (id, cantidad) => {
    setCantidades((prev) => ({ ...prev, [id]: cantidad }));
  };

  const handleFinalizar = ({ solicitante, email, items }) => {
    console.log("=== INFORME DE PEDIDO ===");
    console.log(`Solicitante: ${solicitante}`);
    console.log(`Email:       ${email}`);
    console.log(`Fecha:       ${new Date().toLocaleDateString("es-AR")}`);
    console.log("Detalle:");
    items.forEach((item) => {
      console.log(`  - ${item.nombre}: ${item.cantidad} unidades`);
    });
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

  const handleNavegar = (vista) => {
    setVistaActual(vista);
  };

  return (
    <div className="flex bg-slate-100 min-h-screen">
      <Sidebar vistaActual={vistaActual} setVistaActual={handleNavegar} />

      {vistaActual === "pedidos" ? (
        <VistaPedidos
          productos={productos}
          cantidades={cantidades}
          onCantidadChange={handleCantidadChange}
          onFinalizar={handleFinalizar}
        />
      ) : adminAutenticado ? (
        <VistaAdmin
          productos={productos}
          setProductos={setProductos}
          onLogout={() => { setAdminAutenticado(false); }}
        />
      ) : (
        <LoginAdmin onLogin={() => setAdminAutenticado(true)} />
      )}
    </div>
  );
}
