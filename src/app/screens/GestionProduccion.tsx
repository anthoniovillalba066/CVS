import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, CheckCircle2, AlertTriangle, Building2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router';
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
  producidas: number;
  fecha_entrega: string;
  prioridad: string;
  estado: string;
  id_sede: number;
  nombre_sede?: string;
}

export function GestionProduccion() {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [cargando, setCargando] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [missingColumn, setMissingColumn] = useState(false);
  const [filtroSede, setFiltroSede] = useState<string>('todas');
  const [sedes, setSedes] = useState<{ id_sede: number; nombre: string }[]>([]);

  const cargarDatos = async () => {
    setCargando(true);
    const [{ data: sedesData }, { data: ordenesData, error }] = await Promise.all([
      supabase.from('sedes').select('id_sede, nombre').order('id_sede'),
      supabase
        .from('ordenesproduccion')
        .select('*')
        .neq('estado', 'Terminada')
        .order('fecha_entrega', { ascending: true }),
    ]);

    if (error) console.error('Error cargando órdenes:', error);
    if (sedesData) setSedes(sedesData);
    setOrdenes(ordenesData || []);
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const getEstadoTiempo = (fecha_entrega: string, estado: string) => {
    if (estado.toLowerCase() === 'terminada') return 'en_tiempo';
    const dias = Math.ceil(
      (new Date(fecha_entrega).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    if (dias < 0) return 'retraso';
    if (dias <= 3) return 'riesgo';
    return 'en_tiempo';
  };

  const getTiempoConfig = (et: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
      en_tiempo: { variant: 'success', label: 'En Tiempo' },
      riesgo: { variant: 'warning', label: 'Riesgo' },
      retraso: { variant: 'danger', label: 'Retraso' },
    };
    return map[et] ?? { variant: 'warning' as const, label: et };
  };

  const getPrioridadBadge = (p: string) => {
    const map: Record<string, { variant: 'default' | 'info' | 'warning' | 'danger'; label: string }> = {
      Normal: { variant: 'info', label: 'Normal' },
      Urgente: { variant: 'danger', label: 'Urgente' },
    };
    return map[p] ?? { variant: 'default' as const, label: p };
  };

  const getEstadoBadge = (e: string) => {
    const map: Record<string, { variant: 'warning' | 'info' | 'success' | 'default'; label: string }> = {
      Pendiente: { variant: 'warning', label: 'Pendiente' },
      'En proceso': { variant: 'info', label: 'En Proceso' },
      Terminada: { variant: 'success', label: 'Terminada' },
    };
    return map[e] ?? { variant: 'default' as const, label: e };
  };

  const getProgreso = (producidas: number, cantidad: number) =>
    cantidad > 0 ? Math.round((producidas / cantidad) * 100) : 0;

  const handleActualizar = async () => {
    if (!selectedOrden) return;
    setGuardando(true);

    // Intentar actualizar incluyendo producidas
    const { error } = await supabase
      .from('ordenesproduccion')
      .update({
        producidas: selectedOrden.producidas,
        estado: selectedOrden.estado,
        prioridad: selectedOrden.prioridad,
      })
      .eq('id_orden', selectedOrden.id_orden);

    // Si falla por la columna producidas (schema cache), actualizar solo estado y prioridad
    if (error && error.message.includes('producidas')) {
      const { error: error2 } = await supabase
        .from('ordenesproduccion')
        .update({
          estado: selectedOrden.estado,
          prioridad: selectedOrden.prioridad,
        })
        .eq('id_orden', selectedOrden.id_orden);

      setGuardando(false);

      if (error2) {
        alert('Error al actualizar: ' + error2.message);
        return;
      }

      // Guardar progreso localmente aunque no haya columna en BD
      setOrdenes(ordenes.map(o =>
        o.id_orden === selectedOrden.id_orden ? selectedOrden : o
      ));
      setMissingColumn(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setMissingColumn(false);
        setSelectedOrden(null);
      }, 3500);
      return;
    }

    setGuardando(false);

    if (error) {
      alert('Error al actualizar: ' + error.message);
      return;
    }

    setOrdenes(ordenes.map(o =>
      o.id_orden === selectedOrden.id_orden ? selectedOrden : o
    ));
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSelectedOrden(null);
    }, 2000);
  };

  const estadosOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En proceso', label: 'En Proceso' },
    { value: 'Terminada', label: 'Terminada' },
  ];

  const prioridadesOptions = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Urgente', label: 'Urgente' },
  ];

  const ordenesFiltradas = ordenes.filter(o =>
    filtroSede === 'todas' || String(o.id_sede) === filtroSede
  );

  const retrasos = ordenes.filter(o => getEstadoTiempo(o.fecha_entrega, o.estado) === 'retraso').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg text-gray-900">Gestión de Producción</h1>
          </div>
          <button
            onClick={() => navigate('/produccion/sedes')}
            className="p-2 bg-blue-50 text-[#1e3a8a] rounded-lg hover:bg-blue-100 transition-colors"
            title="Ver por sedes"
          >
            <Building2 size={20} />
          </button>
        </div>
      </div>

      {!selectedOrden ? (
        <div className="p-4">
          {retrasos > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
              <p className="text-xs text-red-700">
                {retrasos} orden(es) en retraso. Revisa las fechas de entrega.
              </p>
            </div>
          )}

          {/* Filtro de sede */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            <button
              onClick={() => setFiltroSede('todas')}
              className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                filtroSede === 'todas' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              Todas las Sedes
            </button>
            {sedes.map(s => (
              <button
                key={s.id_sede}
                onClick={() => setFiltroSede(String(s.id_sede))}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  filtroSede === String(s.id_sede) ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                <Building2 size={14} />
                {s.nombre}
              </button>
            ))}
          </div>

          <h2 className="text-sm text-gray-600 mb-3">
            Órdenes activas {filtroSede !== 'todas' ? `· ${sedes.find(s => String(s.id_sede) === filtroSede)?.nombre ?? ''}` : ''}
          </h2>

          {cargando && (
            <div className="text-center py-12 text-gray-500 text-sm">Cargando producción...</div>
          )}

          {!cargando && (
            <div className="space-y-3">
              {ordenesFiltradas.map(orden => {
                const estadoTiempo = getEstadoTiempo(orden.fecha_entrega, orden.estado);
                const progreso = getProgreso(orden.producidas || 0, orden.cantidad);
                const prioridadBadge = getPrioridadBadge(orden.prioridad);
                const estadoBadge = getEstadoBadge(orden.estado);
                const tiempoBadge = getTiempoConfig(estadoTiempo);
                const nombreSede = sedes.find(s => s.id_sede === orden.id_sede)?.nombre ?? `Sede ${orden.id_sede}`;

                return (
                  <Card
                    key={orden.id_orden}
                    onClick={() => setSelectedOrden({ ...orden, producidas: orden.producidas || 0 })}
                    className={`cursor-pointer transition-all ${estadoTiempo === 'retraso' ? 'border-red-200' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm text-gray-900">
                              ORD-{String(orden.id_orden).padStart(6, '0')}
                            </h3>
                            <Badge variant={prioridadBadge.variant}>{prioridadBadge.label}</Badge>
                            <Badge variant={tiempoBadge.variant}>{tiempoBadge.label}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mb-1">{orden.prenda}</p>
                          <div className="flex items-center gap-1">
                            <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                            <span className="text-xs text-gray-400 flex items-center gap-1 ml-1">
                              <Building2 size={11} />
                              {nombreSede}
                            </span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progreso</span>
                          <span>{orden.producidas || 0} / {orden.cantidad}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              estadoTiempo === 'retraso' ? 'bg-red-500' :
                              estadoTiempo === 'riesgo' ? 'bg-orange-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${progreso}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{progreso}% completado</p>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock size={12} className="text-gray-400" />
                        <span>Entrega: {new Date(orden.fecha_entrega).toLocaleDateString('es-CO')}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {ordenesFiltradas.length === 0 && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No hay órdenes activas en esta sede</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg text-gray-900">
                  ORD-{String(selectedOrden.id_orden).padStart(6, '0')}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Building2 size={14} />
                  {sedes.find(s => s.id_sede === selectedOrden.id_sede)?.nombre ?? `Sede ${selectedOrden.id_sede}`}
                </div>
              </div>

              {getEstadoTiempo(selectedOrden.fecha_entrega, selectedOrden.estado) === 'retraso' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-600" />
                  <span className="text-xs text-red-700">Esta orden está en retraso.</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Producto</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrden.prenda}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Cliente</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrden.cliente}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Cantidad total</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrden.cantidad}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Unidades producidas</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                      value={selectedOrden.producidas}
                      onChange={(e) =>
                        setSelectedOrden({
                          ...selectedOrden,
                          producidas: Math.min(Math.max(0, Number(e.target.value)), selectedOrden.cantidad),
                        })
                      }
                      min="0"
                      max={selectedOrden.cantidad}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progreso de producción</span>
                    <span>{getProgreso(selectedOrden.producidas, selectedOrden.cantidad)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${getProgreso(selectedOrden.producidas, selectedOrden.cantidad)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedOrden.producidas} de {selectedOrden.cantidad} unidades listas
                  </p>
                </div>



                <Select
                  label="Estado"
                  options={estadosOptions}
                  value={selectedOrden.estado}
                  onChange={(e) => setSelectedOrden({ ...selectedOrden, estado: e.target.value })}
                />

                <Select
                  label="Prioridad"
                  options={prioridadesOptions}
                  value={selectedOrden.prioridad}
                  onChange={(e) => setSelectedOrden({ ...selectedOrden, prioridad: e.target.value })}
                />

                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setSelectedOrden(null)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={handleActualizar} disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Actualizar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="max-w-sm w-full">
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${missingColumn ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <CheckCircle2 size={32} className={missingColumn ? 'text-yellow-600' : 'text-green-600'} />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">
                {missingColumn ? 'Estado actualizado' : '¡Actualizado!'}
              </h3>
              {missingColumn ? (
                <>
                  <p className="text-sm text-gray-600 mb-3">Estado y prioridad guardados correctamente.</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                    <p className="text-xs text-yellow-800 font-medium mb-1">Para guardar el progreso de producción:</p>
                    <p className="text-xs text-yellow-700">Ejecuta en Supabase → SQL Editor:</p>
                    <code className="text-xs bg-yellow-100 rounded px-2 py-1 block mt-1 font-mono break-all">
                      ALTER TABLE ordenesproduccion ADD COLUMN IF NOT EXISTS producidas INT NOT NULL DEFAULT 0;
                    </code>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-600">La orden se ha actualizado correctamente</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}