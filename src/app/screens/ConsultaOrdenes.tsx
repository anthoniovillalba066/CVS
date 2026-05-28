import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Search, Calendar, Package, ListOrdered, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

interface Orden {
  id_orden: number;
  prenda: string;
  cliente: string;
  cantidad: number;
  fecha_entrega: string;
  prioridad: string;
  estado: string;
  id_sede: number;
}

export function ConsultaOrdenes() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');

  const cargarOrdenes = async () => {
    setCargando(true);
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const { data, error } = await supabase
      .from('ordenesproduccion')
      .select('*')
      .order('fecha_entrega', { ascending: true });

    if (error) {
      console.error('Error cargando órdenes:', error);
    } else {
      setOrdenes(data || []);
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: 'warning' | 'info' | 'success' | 'danger' | 'default'; label: string }> = {
      Pendiente: { variant: 'warning', label: 'Pendiente' },
      'En proceso': { variant: 'info', label: 'En Proceso' },
      Terminada: { variant: 'success', label: 'Terminada' },
    };
    return badges[estado] ?? { variant: 'default' as const, label: estado };
  };

  const getPrioridadBadge = (prioridad: string) => {
    const badges: Record<string, { variant: 'default' | 'info' | 'warning' | 'danger'; label: string }> = {
      Normal: { variant: 'info', label: 'Normal' },
      Urgente: { variant: 'danger', label: 'Urgente' },
    };
    return badges[prioridad] ?? { variant: 'default' as const, label: prioridad };
  };

  const prioridadOrden: Record<string, number> = { Urgente: 0, Normal: 1 };

  const ordenesFiltradas = ordenes
    .filter(orden => {
      const matchBusqueda =
        String(orden.id_orden).includes(busqueda) ||
        orden.prenda.toLowerCase().includes(busqueda.toLowerCase()) ||
        orden.cliente.toLowerCase().includes(busqueda.toLowerCase());
      const matchEstado = filtroEstado === 'todos' || orden.estado === filtroEstado;
      const matchPrioridad = filtroPrioridad === 'todas' || orden.prioridad === filtroPrioridad;
      return matchBusqueda && matchEstado && matchPrioridad;
    })
    .sort((a, b) => (prioridadOrden[a.prioridad] ?? 99) - (prioridadOrden[b.prioridad] ?? 99));

  const estadisticas = {
    total: ordenes.length,
    pendientes: ordenes.filter(o => o.estado === 'Pendiente').length,
    enProceso: ordenes.filter(o => o.estado === 'En proceso').length,
    terminadas: ordenes.filter(o => o.estado === 'Terminada').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl mb-1">Órdenes de Producción</h1>
            <p className="text-blue-100 text-sm">Gestión de producción</p>
          </div>
          <button
            onClick={() => navigate('/ordenes/registro')}
            className="p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total', value: estadisticas.total },
            { label: 'Pendientes', value: estadisticas.pendientes },
            { label: 'En Proceso', value: estadisticas.enProceso },
            { label: 'Terminadas', value: estadisticas.terminadas },
          ].map(item => (
            <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-xl mb-1">{item.value}</div>
              <div className="text-xs text-blue-100">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 -mt-4">
        {/* Acciones de gestión */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => navigate('/ordenes/priorizacion')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
          >
            <ListOrdered size={16} className="text-[#1e3a8a]" />
            Priorizar
          </button>
          <button
            onClick={() => navigate('/ordenes/eliminacion')}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <Trash2 size={16} className="text-red-500" />
            Eliminar
          </button>
        </div>

        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por orden, producto o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'Pendiente', label: 'Pendientes' },
            { value: 'En proceso', label: 'En Proceso' },
            { value: 'Terminada', label: 'Terminadas' },
          ].map(op => (
            <button
              key={op.value}
              onClick={() => setFiltroEstado(op.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtroEstado === op.value
                  ? 'bg-[#1e3a8a] text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { value: 'todas', label: 'Todas las prioridades' },
            { value: 'Urgente', label: 'Urgente' },
            { value: 'Normal', label: 'Normal' },
          ].map(op => (
            <button
              key={op.value}
              onClick={() => setFiltroPrioridad(op.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtroPrioridad === op.value
                  ? 'bg-gray-700 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {cargando && (
          <div className="text-center py-12 text-gray-500 text-sm">Cargando órdenes...</div>
        )}

        {!cargando && (
          <div className="space-y-3">
            {ordenesFiltradas.map((orden) => {
              const estadoBadge = getEstadoBadge(orden.estado);
              const prioridadBadge = getPrioridadBadge(orden.prioridad);
              const numeroOrden = 'ORD-' + String(orden.id_orden).padStart(6, '0');

              return (
                <Card
                  key={orden.id_orden}
                  className={orden.prioridad === 'Urgente' ? 'border-red-200' : ''}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-sm text-gray-900">{numeroOrden}</h3>
                          <Badge variant={prioridadBadge.variant}>{prioridadBadge.label}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{orden.cliente}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                        <button
                          onClick={() => navigate(`/ordenes/editar/${orden.id_orden}`)}
                          className="p-1.5 bg-gray-50 text-gray-400 rounded-lg hover:bg-blue-50 hover:text-[#1e3a8a] transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Package size={16} className="text-gray-400" />
                        <span>{orden.prenda}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span>Entrega: {new Date(orden.fecha_entrega).toLocaleDateString('es-CO')}</span>
                        </div>
                        <span>{orden.cantidad} unidades</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!cargando && ordenesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">No se encontraron órdenes</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
