import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Trash2, AlertTriangle, CheckCircle2, Package, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
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

export function EliminacionOrdenes() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenAEliminar, setOrdenAEliminar] = useState<Orden | null>(null);
  const [motivo, setMotivo] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const cargarOrdenes = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const { data, error } = await supabase
      .from('ordenesproduccion')
      .select('*')
      .order('fecha_entrega', { ascending: false });

    if (error) {
      console.error('Error al cargar órdenes:', error);
      alert('Error al cargar órdenes: ' + error.message);
      return;
    }
    setOrdenes(data || []);
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const getPrioridadBadge = (prioridad: string) => {
    const map: Record<string, { variant: 'default' | 'info' | 'warning' | 'danger'; label: string }> = {
      Baja: { variant: 'default', label: 'Baja' },
      Normal: { variant: 'info', label: 'Normal' },
      Alta: { variant: 'warning', label: 'Alta' },
      Urgente: { variant: 'danger', label: 'Urgente' },
    };
    return map[prioridad] ?? { variant: 'default' as const, label: prioridad };
  };

  const getEstadoBadge = (estado: string) => {
    const estadoNorm = estado.toLowerCase();
    const map: Record<string, { variant: 'warning' | 'info' | 'success'; label: string }> = {
      pendiente: { variant: 'warning', label: 'Pendiente' },
      'en proceso': { variant: 'info', label: 'En Proceso' },
      terminada: { variant: 'success', label: 'Terminada' },
    };
    return map[estadoNorm] ?? { variant: 'warning' as const, label: estado };
  };

  const ordenesFiltradas = ordenes.filter(o => {
    const matchBusqueda =
      String(o.id_orden).includes(busqueda) ||
      o.prenda.toLowerCase().includes(busqueda.toLowerCase()) ||
      o.cliente.toLowerCase().includes(busqueda.toLowerCase());
    const estadoNorm = o.estado.toLowerCase();
    const matchEstado =
      filtroEstado === 'todos' ||
      estadoNorm === filtroEstado.replace('_', ' ');
    return matchBusqueda && matchEstado;
  });

  const confirmarEliminar = async () => {
    if (!ordenAEliminar) return;
    setEliminando(true);

    // Primero eliminar registros relacionados en consumoinsumos
    const { error: errorConsumos } = await supabase
      .from('consumoinsumos')
      .delete()
      .eq('id_orden', ordenAEliminar.id_orden);

    if (errorConsumos) {
      console.error('Error al eliminar consumos:', errorConsumos);
      // Si la tabla no existe o no hay registros, continuamos igual
    }

    // Luego eliminar la orden
    const { error } = await supabase
      .from('ordenesproduccion')
      .delete()
      .eq('id_orden', ordenAEliminar.id_orden);

    if (error) {
      alert('Error al eliminar la orden: ' + error.message);
      setEliminando(false);
      return;
    }

    setOrdenes(prev => prev.filter(o => o.id_orden !== ordenAEliminar.id_orden));
    setOrdenAEliminar(null);
    setMotivo('');
    setEliminando(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate('/ordenes/consulta')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg text-gray-900">Eliminar Órdenes</h1>

          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-xs text-red-700">
            Esta acción es permanente. Usa los filtros para identificar órdenes descartadas o finalizadas.
          </p>
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

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'terminada', label: 'Terminadas' },
            { value: 'pendiente', label: 'Pendientes' },
            { value: 'en_proceso', label: 'En Proceso' },
          ].map(op => (
            <button
              key={op.value}
              onClick={() => setFiltroEstado(op.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtroEstado === op.value ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {op.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-500 mb-3">{ordenesFiltradas.length} orden(es) encontradas</p>

        <div className="space-y-3">
          {ordenesFiltradas.map(orden => {
            const prioridadBadge = getPrioridadBadge(orden.prioridad);
            const estadoBadge = getEstadoBadge(orden.estado);
            return (
              <Card key={orden.id_orden}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm text-gray-900">ORD-{String(orden.id_orden).padStart(6, '0')}</span>
                        <Badge variant={prioridadBadge.variant}>{prioridadBadge.label}</Badge>
                        <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500">{orden.cliente}</p>
                    </div>
                    <button
                      onClick={() => setOrdenAEliminar(orden)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Package size={14} className="text-gray-400" />
                      <span>{orden.prenda}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span>Entrega: {new Date(orden.fecha_entrega).toLocaleDateString('es-CO')}</span>
                      </div>
                      <span>{orden.cantidad} unidades</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {ordenesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No se encontraron órdenes</p>
            </div>
          )}
        </div>
      </div>

      {ordenAEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">Eliminar Orden</h3>
                  <p className="text-xs text-gray-500">ORD-{String(ordenAEliminar.id_orden).padStart(6, '0')}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-900 mb-1">{ordenAEliminar.prenda}</p>
                <p className="text-xs text-gray-500">{ordenAEliminar.cliente} · {ordenAEliminar.cantidad} unidades</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">Motivo (opcional)</label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] text-sm resize-none"
                  rows={3}
                  placeholder="Ej: Pedido cancelado por el cliente, proyecto descartado..."
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                />
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-700">Esta acción no se puede deshacer. La orden será eliminada permanentemente.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => { setOrdenAEliminar(null); setMotivo(''); }} disabled={eliminando}>
                  Cancelar
                </Button>
                <button
                  onClick={confirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {eliminando ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="max-w-sm w-full">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">Orden eliminada</h3>
              <p className="text-sm text-gray-600">La orden ha sido eliminada del sistema exitosamente</p>
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}