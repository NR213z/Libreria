import { useState } from "react";
import { Search, Filter } from "lucide-react";
import ProductoCard from "./ProductoCard";
import Carrito from "./Carrito";
import { categorias } from "../data/productos";

export default function VistaPedidos({ productos, cantidades, onCantidadChange, onFinalizar }) {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const productosFiltrados = productos.filter((p) => {
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = categoriaActiva === "Todos" || p.categoria === categoriaActiva;
    return coincideBusqueda && coincideCategoria;
  });

  const items = Object.entries(cantidades).map(([id, cantidad]) => ({
    id: parseInt(id),
    cantidad,
  }));

  return (
    <div className="flex flex-1">
      <div className="flex-1 p-6 overflow-y-auto h-screen">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Selector de Artículos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Elegí los productos y las cantidades para tu pedido
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-slate-400" />
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
                  categoriaActiva === cat
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              cantidad={cantidades[producto.id] || 0}
              onCantidadChange={onCantidadChange}
            />
          ))}
        </div>

        {productosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-400">No se encontraron productos</p>
          </div>
        )}
      </div>

      <Carrito
        items={items}
        productos={productos}
        onCantidadChange={onCantidadChange}
        onFinalizar={onFinalizar}
      />
    </div>
  );
}
