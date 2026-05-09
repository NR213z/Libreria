import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Filter, AlertCircle, CheckCircle, Edit3, Save, X, LogOut } from "lucide-react";
import * as XLSX from "xlsx";
import { categorias } from "../data/productos";
import ProductImage from "./ProductImage";

export default function VistaAdmin({ productos, setProductos, onLogout }) {
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todos");
  const [dragOver, setDragOver] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const fileRef = useRef(null);

  const productosFiltrados = productos.filter(
    (p) => categoriaFiltro === "Todos" || p.categoria === categoriaFiltro
  );

  const procesarExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) { setMensaje({ tipo: "error", texto: "El archivo está vacío." }); return; }

        let actualizados = 0, nuevos = 0;
        const copia = [...productos];

        data.forEach((row) => {
          const nombre    = row.nombre    || row.Nombre;
          const categoria = row.categoria || row.Categoria || "Oficina";
          const stock     = parseInt(row.stock || row.Stock) || 0;
          if (!nombre) return;

          const idx = copia.findIndex((p) => p.nombre.toLowerCase() === nombre.toLowerCase());
          if (idx >= 0) {
            copia[idx] = { ...copia[idx], stock, categoria };
            actualizados++;
          } else {
            copia.push({ id: Math.max(...copia.map((p) => p.id)) + 1, nombre, categoria, stock });
            nuevos++;
          }
        });

        setProductos(copia);
        setMensaje({ tipo: "exito", texto: `Procesados ${data.length} registros: ${actualizados} actualizados, ${nuevos} nuevos.` });
        setTimeout(() => setMensaje(null), 5000);
      } catch {
        setMensaje({ tipo: "error", texto: "Error al procesar el archivo. Verificá el formato." });
        setTimeout(() => setMensaje(null), 5000);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const iniciarEdicion = (p) => {
    setEditandoId(p.id);
    setEditValues({ stock: p.stock, nombre: p.nombre, categoria: p.categoria });
  };

  const guardarEdicion = (id) => {
    setProductos(productos.map((p) => p.id === id ? { ...p, ...editValues } : p));
    setEditandoId(null);
  };

  const stockBadgeClass = (stock) =>
    stock === 0  ? "bg-red-100 text-red-700" :
    stock < 20   ? "bg-amber-100 text-amber-700" :
                   "bg-emerald-100 text-emerald-700";

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Administración de Inventario</h2>
          <p className="text-sm text-slate-500 mt-1">Cargá y gestioná los productos del catálogo</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>

      {/* Drag & Drop Excel */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) procesarExcel(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors cursor-pointer ${
          dragOver ? "border-indigo-400 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
        }`}
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={(e) => { if (e.target.files[0]) procesarExcel(e.target.files[0]); }} className="hidden" />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-3 rounded-full ${dragOver ? "bg-indigo-100" : "bg-slate-100"}`}>
            {dragOver ? <Upload size={28} className="text-indigo-500" /> : <FileSpreadsheet size={28} className="text-slate-400" />}
          </div>
          <div>
            <p className="font-medium text-slate-700">
              {dragOver ? "Soltá el archivo acá" : "Arrastrá un Excel o hacé clic para seleccionar"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Columnas: nombre, categoria, stock (.xlsx, .xls, .csv)</p>
          </div>
        </div>
      </div>

      {mensaje && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${
          mensaje.tipo === "exito" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {mensaje.tipo === "exito" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {mensaje.texto}
        </div>
      )}

      {/* Filtros por sector */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Filter size={16} className="text-slate-400" />
        <span className="text-sm text-slate-500">Sector:</span>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaFiltro(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors cursor-pointer ${
              categoriaFiltro === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tabla de inventario */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-600 w-14"></th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-600">Sector</th>
              <th className="text-right px-4 py-3 font-semibold text-slate-600">Stock</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map((producto) => (
              <tr key={producto.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <ProductImage productoId={producto.id} size="row" />
                </td>
                <td className="px-4 py-3">
                  {editandoId === producto.id ? (
                    <input
                      type="text"
                      value={editValues.nombre}
                      onChange={(e) => setEditValues({ ...editValues, nombre: e.target.value })}
                      className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  ) : (
                    <span className="font-medium text-slate-700">{producto.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editandoId === producto.id ? (
                    <select
                      value={editValues.categoria}
                      onChange={(e) => setEditValues({ ...editValues, categoria: e.target.value })}
                      className="px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      {categorias.filter((c) => c !== "Todos").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{producto.categoria}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {editandoId === producto.id ? (
                    <input
                      type="number"
                      value={editValues.stock}
                      onChange={(e) => setEditValues({ ...editValues, stock: parseInt(e.target.value) || 0 })}
                      className="w-20 text-right px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  ) : (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${stockBadgeClass(producto.stock)}`}>
                      {producto.stock}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {editandoId === producto.id ? (
                    <div className="flex justify-center gap-1">
                      <button onClick={() => guardarEdicion(producto.id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"><Save size={16} /></button>
                      <button onClick={() => setEditandoId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded cursor-pointer"><X size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => iniciarEdicion(producto)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"><Edit3 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between text-xs text-slate-400">
        <span>{productosFiltrados.length} productos</span>
        <span>Stock total: {productosFiltrados.reduce((s, p) => s + p.stock, 0)} unidades</span>
      </div>
    </div>
  );
}
