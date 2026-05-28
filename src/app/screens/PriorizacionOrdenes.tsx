import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
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

const prioridadOrden: Record<string, number> = { Urgente: 0, Normal: 1 };

export function PriorizacionOrdenes() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [modalOrden, setModalOrden] = useState<Orden | null>(null);
  const [nuevaPrioridad, setNuevaPrioridad] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const prioridadesOptions = [
    { value: 'Urgente', label: 'Urgente' },
    { value: 'Normal', label: 'Normal' },
  ];

  const cargarOrdenes = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const { data, error } = await supabase
      .from('ordenesproduccion')
      .select('*')
      .neq('estado', 'Terminada')
      .order('fecha_entrega', { ascending: true });

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

  const ordenesOrdenadas = [...ordenes].sort(
    (a, b) => (prioridadOrden[a.prioridad] ?? 99) - (prioridadOrden[b.prioridad] ?? 99)
  );

  const getPrioridadBadge = (prioridad: string) => {
    const map: Record<string, { variant: 'danger' | 'info' | 'default'; label: string }> = {
      Normal: { variant: 'info', label: 'Normal' },
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

  const getDiasRestantes = (fecha: string) => {
    const hoy = new Date();
    const limite = new Date(fecha);
    return Math.ceil((limite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  const abrirModal = (orden: Orden) => {
    setModalOrden(orden);
    setNuevaPrioridad(orden.prioridad);
  };

  const confirmarCambio = async () => {
    if (!modalOrden || !nuevaPrioridad) return;
    setGuardando(true);

    const { error } = await supabase
      .from('ordenesproduccion')
      .update({ prioridad: nuevaPrioridad })
      .eq('id_orden', modalOrden.id_orden);

    if (error) {
      alert('Error al actualizar prioridad: ' + error.message);
      setGuardando(false);
      return;
    }

    setOrdenes(prev =>
      prev.map(o => o.id_orden === modalOrden.id_orden ? { ...o, prioridad: nuevaPrioridad } : o)
    );
    setModalOrden(null);
    setGuardando(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const cambiarPrioridadRapido = async (orden: Orden, direccion: 'arriba' | 'abajo') => {
    const claves = ['Urgente', 'Normal'];
    const idx = claves.indexOf(orden.prioridad);
    const nuevoIdx = direccion === 'arriba' ? idx - 1 : idx + 1;
    if (nuevoIdx < 0 || nuevoIdx >= claves.length) return;

    const nuevaPrio = claves[nuevoIdx];
    const { error } = await supabase
      .from('ordenesproduccion')
      .update({ prioridad: nuevaPrio })
      .eq('id_orden', orden.id_orden);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }
    setOrdenes(prev =>
      prev.map(o => o.id_orden === orden.id_orden ? { ...o, prioridad: nuevaPrio } : o)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl">Priorización de Órdenes</h1>

          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1">{ordenes.filter(o => o.prioridad === 'Urgente').length}</div>
            <div className="text-xs text-blue-100">Urgentes</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1">{ordenes.filter(o => o.prioridad === 'Normal').length}</div>
            <div className="text-xs text-blue-100">Normal</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1">{ordenes.length}</div>
            <div className="text-xs text-blue-100">Total</div>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-orange-600 flex-shrink-0" />
          <p className="text-xs text-orange-700">
            Toca una orden para cambiar su prioridad o usa las flechas para ajustar rápidamente.
          </p>
        </div>

        {ordenes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No hay órdenes activas</p>
          </div>
        )}

        <div className="space-y-3">
          {ordenesOrdenadas.map((orden, index) => {
            const prioridadBadge = getPrioridadBadge(orden.prioridad);
            const estadoBadge = getEstadoBadge(orden.estado);
            const dias = getDiasRestantes(orden.fecha_entrega);
            const esUrgente = dias <= 3;
            const esRiesgo = dias > 3 && dias <= 7;

            return (
              <Card key={orden.id_orden} className={orden.prioridad === 'Urgente' ? 'border-red-300 shadow-red-100 shadow-md' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => cambiarPrioridadRapido(orden, 'arriba')} disabled={index === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
                        <ChevronUp size={16} className="text-gray-500" />
                      </button>
                      <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-500">{index + 1}</span>
                      </div>
                      <button onClick={() => cambiarPrioridadRapido(orden, 'abajo')} disabled={index === ordenesOrdenadas.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
                        <ChevronDown size={16} className="text-gray-500" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0" onClick={() => abrirModal(orden)}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm text-gray-900">ORD-{String(orden.id_orden).padStart(6, '0')}</span>
                        <Badge variant={prioridadBadge.variant}>{prioridadBadge.label}</Badge>
                        <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-700 mb-1">{orden.prenda}</p>
                      <p className="text-xs text-gray-500 mb-2">{orden.cliente} · {orden.cantidad} uds</p>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className={esUrgente ? 'text-red-500' : esRiesgo ? 'text-orange-500' : 'text-gray-400'} />
                        <span className={`text-xs ${esUrgente ? 'text-red-600' : esRiesgo ? 'text-orange-600' : 'text-gray-500'}`}>
                          {dias <= 0 ? 'Vencida' : `${dias} días restantes`}
                        </span>
                        {esUrgente && dias > 0 && <Badge variant="danger">¡Urgente!</Badge>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {modalOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg text-gray-900 mb-1">Cambiar Prioridad</h3>
              <p className="text-sm text-gray-500 mb-4">ORD-{String(modalOrden.id_orden).padStart(6, '0')} · {modalOrden.prenda}</p>
              <Select label="Nueva Prioridad" options={prioridadesOptions} value={nuevaPrioridad} onChange={(e) => setNuevaPrioridad(e.target.value)} />
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  Cliente: {modalOrden.cliente} · Entrega: {new Date(modalOrden.fecha_entrega).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1" onClick={() => setModalOrden(null)} disabled={guardando}>Cancelar</Button>
                <Button variant="primary" className="flex-1" onClick={confirmarCambio} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Confirmar'}
                </Button>
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
              <h3 className="text-lg text-gray-900 mb-2">¡Prioridad actualizada!</h3>
              <p className="text-sm text-gray-600">La orden ha sido reordenada exitosamente</p>
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}