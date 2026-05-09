import { ShoppingBag, Trash2, Send, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import ProductImage from "./ProductImage";

export default function Carrito({ items, productos, onCantidadChange, onFinalizar }) {
  const [solicitante, setSolicitante] = useState("");
  const [email, setEmail] = useState("");
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);

  const itemsEnCarrito = items
    .map((item) => ({ ...productos.find((p) => p.id === item.id), cantidad: item.cantidad }))
    .filter((item) => item.cantidad > 0);

  const totalUnidades = itemsEnCarrito.reduce((sum, item) => sum + item.cantidad, 0);

  const handleFinalizar = () => {
    if (!solicitante.trim() || !email.trim()) return;
    setMostrarConfirmacion(true);
  };

  const confirmarPedido = () => {
    setMostrarConfirmacion(false);
    setPedidoEnviado(true);
    onFinalizar({ solicitante, email, items: itemsEnCarrito });
    setSolicitante("");
    setEmail("");
    setTimeout(() => setPedidoEnviado(false), 4000);
  };

  return (
    <div className="w-72 bg-white border-l border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-indigo-600" />
          <h2 className="font-bold text-slate-800">Mi Pedido</h2>
        </div>
        {totalUnidades > 0 && (
          <span className="text-xs text-slate-500 mt-1 block">
            {totalUnidades} unidad{totalUnidades !== 1 ? "es" : ""} seleccionada{totalUnidades !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {itemsEnCarrito.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm text-slate-400">El pedido está vacío</p>
            <p className="text-xs text-slate-300 mt-1">Seleccioná artículos para agregar</p>
          </div>
        ) : (
          itemsEnCarrito.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <ProductImage productoId={item.id} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{item.nombre}</p>
                <p className="text-xs text-slate-400">{item.cantidad} unid.</p>
              </div>
              <button
                onClick={() => onCantidadChange(item.id, 0)}
                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))
        )}
      </div>

      {itemsEnCarrito.length > 0 && (
        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="text-xs text-slate-500 text-center">
            {itemsEnCarrito.length} producto{itemsEnCarrito.length !== 1 ? "s" : ""} · {totalUnidades} unidades en total
          </div>
          <input
            type="text"
            placeholder="Nombre del solicitante *"
            value={solicitante}
            onChange={(e) => setSolicitante(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="email"
            placeholder="Email del solicitante *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleFinalizar}
            disabled={!solicitante.trim() || !email.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Send size={15} />
            Finalizar Pedido
          </button>
        </div>
      )}

      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-800">Confirmar Pedido</h3>
              <button onClick={() => setMostrarConfirmacion(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              <div className="text-sm">
                <p className="text-slate-500 text-xs uppercase font-semibold mb-1">Solicitante</p>
                <p className="text-slate-800 font-medium">{solicitante}</p>
                <p className="text-slate-500 text-xs">{email}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase font-semibold mb-2">Detalle</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {itemsEnCarrito.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <ProductImage productoId={item.id} size="sm" />
                      <span className="text-slate-700 flex-1 truncate">{item.nombre}</span>
                      <span className="text-slate-500 font-medium">{item.cantidad} u.</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-2 text-sm font-semibold text-slate-700">
                Total: {totalUnidades} unidades
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Se enviará un informe por email con el detalle completo del pedido.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setMostrarConfirmacion(false)} className="flex-1 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                Cancelar
              </button>
              <button onClick={confirmarPedido} className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                Confirmar y Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {pedidoEnviado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 shadow-xl text-center">
            <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="font-bold text-lg text-slate-800 mb-2">¡Pedido Enviado!</h3>
            <p className="text-sm text-slate-500">
              Se envió el informe a <strong>{email}</strong> con el detalle de las {totalUnidades} unidades solicitadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
