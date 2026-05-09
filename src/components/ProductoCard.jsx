import { Minus, Plus } from "lucide-react";
import ProductImage from "./ProductImage";
import { useAuth } from "../context/AuthContext";

const LIMITE_RESMA = 5;

const categoriaBg = {
  Oficina:   "bg-blue-100 text-blue-700",
  Escolar:   "bg-emerald-100 text-emerald-700",
  Artística: "bg-purple-100 text-purple-700",
  Técnico:   "bg-orange-100 text-orange-700",
};

export default function ProductoCard({ producto, cantidad, onCantidadChange }) {
  const { role } = useAuth();
  const esAdmin   = role === "admin";
  const esResma   = producto.nombre.toLowerCase().includes("resma");

  // Para usuarios comunes las resmas tienen límite de 5
  const limiteEfectivo = esResma && !esAdmin
    ? Math.min(LIMITE_RESMA, producto.stock)
    : producto.stock;

  const sinStock  = producto.stock === 0;
  const stockBajo = producto.stock > 0 && producto.stock < 20;

  const incrementar = () => {
    if (cantidad < limiteEfectivo) onCantidadChange(producto.id, cantidad + 1);
  };
  const decrementar = () => {
    if (cantidad > 0) onCantidadChange(producto.id, cantidad - 1);
  };
  const handleInput = (e) => {
    const val = parseInt(e.target.value) || 0;
    onCantidadChange(producto.id, Math.min(Math.max(0, val), limiteEfectivo));
  };

  return (
    <div
      className={`bg-white rounded-xl border overflow-hidden transition-all hover:shadow-md ${
        cantidad > 0 ? "border-indigo-300 ring-1 ring-indigo-100" : "border-slate-200"
      } ${sinStock ? "opacity-50" : ""}`}
    >
      <div className="flex gap-3 p-4">
        <ProductImage productoId={producto.id} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-800 text-sm leading-snug">{producto.nombre}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${categoriaBg[producto.categoria]}`}>
              {producto.categoria}
            </span>
          </div>

          <div className="flex items-center justify-between mt-3">

            {/* Badge de stock (solo admins) o límite de resma (usuarios) */}
            {esAdmin ? (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                sinStock  ? "bg-red-100 text-red-700" :
                stockBajo ? "bg-amber-100 text-amber-700" :
                            "bg-emerald-100 text-emerald-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  sinStock  ? "bg-red-500" :
                  stockBajo ? "bg-amber-500" :
                              "bg-emerald-500"
                }`} />
                {sinStock ? "Sin stock" : `Disponible: ${producto.stock}`}
              </span>
            ) : sinStock ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Sin stock
              </span>
            ) : esResma ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Límite: {LIMITE_RESMA} por pedido
              </span>
            ) : (
              <span /> /* espaciador */
            )}

            {/* Controles de cantidad */}
            <div className="flex items-center gap-1">
              <button
                onClick={decrementar}
                disabled={cantidad === 0 || sinStock}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus size={13} />
              </button>
              <input
                type="number"
                value={cantidad}
                onChange={handleInput}
                disabled={sinStock}
                min={0}
                max={limiteEfectivo}
                className="w-12 h-7 text-center text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-slate-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                onClick={incrementar}
                disabled={cantidad >= limiteEfectivo || sinStock}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
