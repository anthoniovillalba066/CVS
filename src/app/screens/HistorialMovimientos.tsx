import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, ArrowDown, ArrowUp, User, Building2, Calendar, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

interface Movimiento {
  id_movimiento?: number;
  tipo: string;
  id_insumo: number;
  cantidad: number;
  motivo: string;
  id_usuario: number;
  id_sede: number;
  created_at?: string;
  nombre_insumo?: string;
  unidad_medida?: string;
  nombre_usuario?: string;
  nombre_sede?: string;
}

export function HistorialMovimientos() {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [cargando, setCargando] = useState(true);

  const cargarMovimientos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from('movimientosinventario')
      .select('*, insumos(nombre, unidad_medida), usuarios(nombre)')
      .order('fecha', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error al cargar historial:', error);
      setCargando(false);
      return;
    }

    const flat = (data || []).map((m: any) => ({
      ...m,
      nombre_insumo: m.insumos?.nombre ?? 'Insumo desconocido',
      unidad_medida: m.insumos?.unidad_medida ?? '',
      nombre_usuario: m.usuarios?.nombre ?? 'Usuario',
      fecha: m.fecha,
    }));

    setMovimientos(flat);
    setCargando(false);
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  const movimientosFiltrados = movimientos.filter(m => {
    const matchBusqueda =
      (m.nombre_insumo ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.motivo ?? '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.nombre_usuario ?? '').toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo =
      filtroTipo === 'todos' ||
      m.tipo.toLowerCase() === filtroTipo.toLowerCase();
    return matchBusqueda && matchTipo;
  });

  // Agrupar por fecha
  const agrupadosPorFecha = movimientosFiltrados.reduce((acc, mov) => {
    const fecha = mov.fecha ? new Date(mov.fecha).toDateString() : 'Sin fecha';
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(mov);
    return acc;
  }, {} as Record<string, Movimiento[]>);

  const fechasOrdenadas = Object.keys(agrupadosPorFecha);

  const formatFechaHeader = (fechaStr: string) => {
    if (fechaStr === 'Sin fecha') return fechaStr;
    const d = new Date(fechaStr);
    const hoy = new Date();
    const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
    if (d.toDateString() === hoy.toDateString()) return 'Hoy';
    if (d.toDateString() === ayer.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const formatHora = (fecha?: string) => {
    if (!fecha) return '';
    return new Date(fecha ?? '').toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  const totalEntradas = movimientos.filter(m => m.tipo === 'Entrada').length;
  const totalSalidas = movimientos.filter(m => m.tipo === 'Salida').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/insumos/faltantes')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl">Historial de Movimientos</h1>
            <p className="text-blue-100 text-xs">Trazabilidad de inventario</p>
          </div>
          <button
            onClick={() => navigate('/insumos/inventario')}
            className="flex items-center gap-2 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
          >
            <Plus size={16} /> Registrar
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1">{movimientos.length}</div>
            <div className="text-xs text-blue-100">Total</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1 text-green-300">{totalEntradas}</div>
            <div className="text-xs text-blue-100">Entradas</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1 text-red-300">{totalSalidas}</div>
            <div className="text-xs text-blue-100">Salidas</div>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4">
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar insumo, motivo o usuario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'entrada', label: 'Entradas' },
            { value: 'salida', label: 'Salidas' },
          ].map(op => (
            <button
              key={op.value}
              onClick={() => setFiltroTipo(op.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtroTipo === op.value ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {cargando && <div className="text-center py-8 text-gray-500 text-sm">Cargando historial...</div>}

        {!cargando && fechasOrdenadas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No se encontraron movimientos</p>
          </div>
        )}

        {!cargando && fechasOrdenadas.map(fecha => (
          <div key={fecha} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-[#1e3a8a]" />
              <h2 className="text-sm text-gray-700 capitalize">{formatFechaHeader(fecha)}</h2>
              <span className="text-xs text-gray-400">· {agrupadosPorFecha[fecha].length} movimiento(s)</span>
            </div>
            <div className="space-y-2">
              {agrupadosPorFecha[fecha].map((mov, idx) => (
                <Card key={mov.id_movimiento ?? idx}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${mov.tipo.toLowerCase() === 'entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {mov.tipo.toLowerCase() === 'entrada'
                          ? <ArrowDown size={16} className="text-green-600" />
                          : <ArrowUp size={16} className="text-red-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm text-gray-900">{mov.nombre_insumo}</span>
                          <Badge variant={mov.tipo.toLowerCase() === 'entrada' ? 'success' : 'danger'}>
                            {mov.tipo}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{mov.motivo}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <User size={11} className="text-gray-400" />
                            <span>{mov.nombre_usuario}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2 size={11} className="text-gray-400" />
                            <span>Sede {mov.id_sede}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={`text-sm ${mov.tipo.toLowerCase() === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                          {mov.tipo.toLowerCase() === 'entrada' ? '+' : '-'}{mov.cantidad}
                        </div>
                        <div className="text-xs text-gray-400">{mov.unidad_medida}</div>
                        <div className="text-xs text-gray-400 mt-1">{formatHora(mov.fecha)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <MobileNav />
    </div>
  );
}