import {
  FileText, Pen, FolderOpen, Layers, Paperclip,
  Notebook, Pencil, Eraser, Scissors, Ruler,
  Palette, Clipboard, Paintbrush, Highlighter, PenLine,
  Triangle, Compass, Square, PenTool, File,
} from "lucide-react";

const iconConfig = {
  1:  { Icon: FileText,   bg: "bg-blue-100",    ring: "ring-blue-200",   text: "text-blue-500"   }, // Resma A4
  2:  { Icon: Pen,        bg: "bg-blue-100",    ring: "ring-blue-200",   text: "text-blue-500"   }, // Lapicera
  3:  { Icon: FolderOpen, bg: "bg-blue-100",    ring: "ring-blue-200",   text: "text-blue-500"   }, // Carpeta
  4:  { Icon: Layers,     bg: "bg-blue-100",    ring: "ring-blue-200",   text: "text-blue-500"   }, // Cinta adhesiva
  5:  { Icon: Paperclip,  bg: "bg-blue-100",    ring: "ring-blue-200",   text: "text-blue-500"   }, // Clips
  6:  { Icon: Notebook,   bg: "bg-emerald-100", ring: "ring-emerald-200",text: "text-emerald-600" }, // Cuaderno
  7:  { Icon: Pencil,     bg: "bg-emerald-100", ring: "ring-emerald-200",text: "text-emerald-600" }, // Lápiz
  8:  { Icon: Eraser,     bg: "bg-emerald-100", ring: "ring-emerald-200",text: "text-emerald-600" }, // Goma
  9:  { Icon: Scissors,   bg: "bg-emerald-100", ring: "ring-emerald-200",text: "text-emerald-600" }, // Sacapuntas
  10: { Icon: Ruler,      bg: "bg-emerald-100", ring: "ring-emerald-200",text: "text-emerald-600" }, // Regla
  11: { Icon: Palette,    bg: "bg-purple-100",  ring: "ring-purple-200", text: "text-purple-600"  }, // Témperas
  12: { Icon: Clipboard,  bg: "bg-purple-100",  ring: "ring-purple-200", text: "text-purple-600"  }, // Block dibujo
  13: { Icon: Paintbrush, bg: "bg-purple-100",  ring: "ring-purple-200", text: "text-purple-600"  }, // Pinceles
  14: { Icon: Highlighter,bg: "bg-purple-100",  ring: "ring-purple-200", text: "text-purple-600"  }, // Lápices colores
  15: { Icon: PenLine,    bg: "bg-purple-100",  ring: "ring-purple-200", text: "text-purple-600"  }, // Marcadores
  16: { Icon: Triangle,   bg: "bg-orange-100",  ring: "ring-orange-200", text: "text-orange-500"  }, // Escalímetro
  17: { Icon: Compass,    bg: "bg-orange-100",  ring: "ring-orange-200", text: "text-orange-500"  }, // Compás
  18: { Icon: Square,     bg: "bg-orange-100",  ring: "ring-orange-200", text: "text-orange-500"  }, // Tablero
  19: { Icon: PenTool,    bg: "bg-orange-100",  ring: "ring-orange-200", text: "text-orange-500"  }, // Estilógrafo
  20: { Icon: File,       bg: "bg-orange-100",  ring: "ring-orange-200", text: "text-orange-500"  }, // Papel vegetal
};

export default function ProductImage({ productoId, size = "md" }) {
  const config = iconConfig[productoId] ?? { Icon: FileText, bg: "bg-slate-100", ring: "ring-slate-200", text: "text-slate-400" };
  const { Icon, bg, ring, text } = config;

  const sizeClasses = {
    sm:  { wrap: "w-8 h-8 rounded-md",   icon: 14 },
    md:  { wrap: "w-20 h-20 rounded-xl", icon: 32 },
    row: { wrap: "w-10 h-10 rounded-lg", icon: 20 },
  };
  const s = sizeClasses[size] ?? sizeClasses.md;

  return (
    <div className={`${s.wrap} ${bg} ring-1 ${ring} flex items-center justify-center flex-shrink-0`}>
      <Icon size={s.icon} className={text} strokeWidth={1.5} />
    </div>
  );
}
