import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Building2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
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

interface Sede {
  id_sede: number;
  nombre: string;
  ordenes: Orden[];
}

export function ProduccionSedes() {
  const navigate = useNavigate();
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('ambas');
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);

    // Cargar todas las sedes y órdenes activas
    const [{ data: sedesData }, { data: ordenesData, error }] = await Promise.all([
      supabase.from('sedes').select('*'),
      supabase
        .from('ordenesproduccion')
        .select('*')
        .neq('estado', 'Terminada'),
    ]);

    if (error) {
      console.error('Error al cargar producción:', error);
      // Si no hay tabla sedes, construir con las órdenes disponibles
    }

    const ordenes: Orden[] = ordenesData || [];

    // Si hay tabla sedes la usamos, si no agrupamos por id_sede
    if (sedesData && sedesData.length > 0) {
      const sedesConOrdenes: Sede[] = sedesData.map((s: any) => ({
        id_sede: s.id_sede,
        nombre: s.nombre,
        ordenes: ordenes.filter(o => o.id_sede === s.id_sede),
      }));
      setSedes(sedesConOrdenes);
    } else {
      // Agrupar por id_sede único
      const sedesUnicas = [...new Set(ordenes.map(o => o.id_sede))];
      const sedesConOrdenes: Sede[] = sedesUnicas.map(id => ({
        id_sede: id,
        nombre: `Sede ${id}`,
        ordenes: ordenes.filter(o => o.id_sede === id),
      }));
      setSedes(sedesConOrdenes);
    }

    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const getEstadoTiempo = (fecha_entrega: string, estado: string) => {
    if (estado.toLowerCase() === 'terminada') return 'en_tiempo';
    const dias = Math.ceil((new Date(fecha_entrega).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (dias < 0) return 'retraso';
    if (dias <= 3) return 'riesgo';
    return 'en_tiempo';
  };

  const getTiempoConfig = (estadoTiempo: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
      en_tiempo: { variant: 'success', label: 'En Tiempo' },
      riesgo: { variant: 'warning', label: 'Riesgo' },
      retraso: { variant: 'danger', label: 'Retraso' },
    };
    return map[estadoTiempo] ?? { variant: 'warning' as const, label: estadoTiempo };
  };

  const getPrioridadBadge = (prioridad: string) => {
    const map: Record<string, { variant: 'default' | 'info' | 'warning' | 'danger'; label: string }> = {
      Baja: { variant: 'default', label: 'Baja' },
      Normal: { variant: 'info', label: 'Normal' },
      Alta: { variant: 'warning', label: 'Alta' },
      Urgente: { variant: 'danger', label: 'Urgente' },
    };
    return map[prioridad] ?? { variant: 'default' as const, label: prioridad };
  };

  const getProgreso = (producidas: number, cantidad: number) => {
    if (!cantidad || cantidad === 0) return 0;
    return Math.round((producidas / cantidad) * 100);
  };

  const sedesFiltradas = sedes.filter(s =>
    sedeSeleccionada === 'ambas' || String(s.id_sede) === sedeSeleccionada
  );

  const getResumen = (sede: Sede) => {
    const retrasos = sede.ordenes.filter(o => getEstadoTiempo(o.fecha_entrega, o.estado) === 'retraso').length;
    const riesgos = sede.ordenes.filter(o => getEstadoTiempo(o.fecha_entrega, o.estado) === 'riesgo').length;
    return { total: sede.ordenes.length, retrasos, riesgos };
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl">Producción por Sedes</h1>

          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {sedes.map(sede => {
            const resumen = getResumen(sede);
            return (
              <div key={sede.id_sede} className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 size={16} />
                  <span className="text-sm">{sede.nombre}</span>
                </div>
                <div className="text-2xl mb-1">{resumen.total}</div>
                <div className="text-xs text-blue-100">órdenes activas</div>
                {resumen.retrasos > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-red-300" />
                    <span className="text-xs text-red-200">{resumen.retrasos} en retraso</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 -mt-4">
        {/* Filtro sedes */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setSedeSeleccionada('ambas')}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${sedeSeleccionada === 'ambas' ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
          >
            Todas las Sedes
          </button>
          {sedes.map(s => (
            <button
              key={s.id_sede}
              onClick={() => setSedeSeleccionada(String(s.id_sede))}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${sedeSeleccionada === String(s.id_sede) ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        {/* Filtro estado tiempo */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'retraso', label: 'Retraso' },
            { value: 'riesgo', label: 'Riesgo' },
            { value: 'en_tiempo', label: 'En Tiempo' },
          ].map(op => (
            <button
              key={op.value}
              onClick={() => setFiltroEstado(op.value)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${filtroEstado === op.value ? 'bg-[#1e3a8a] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              {op.label}
            </button>
          ))}
        </div>

        {cargando && (
          <div className="text-center py-8 text-gray-500 text-sm">Cargando producción...</div>
        )}

        {!cargando && sedesFiltradas.map(sede => {
          const ordenesFiltradas = sede.ordenes.filter(o => {
            const estadoTiempo = getEstadoTiempo(o.fecha_entrega, o.estado);
            return filtroEstado === 'todos' || estadoTiempo === filtroEstado;
          });

          if (ordenesFiltradas.length === 0) return null;
          const resumen = getResumen(sede);

          return (
            <div key={sede.id_sede} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-[#1e3a8a]" />
                <h2 className="text-sm text-gray-900">{sede.nombre}</h2>
                <div className="ml-auto flex gap-2">
                  {resumen.retrasos > 0 && <Badge variant="danger">{resumen.retrasos} retraso</Badge>}
                  {resumen.riesgos > 0 && <Badge variant="warning">{resumen.riesgos} riesgo</Badge>}
                </div>
              </div>

              <div className="space-y-3">
                {ordenesFiltradas.map(orden => {
                  const estadoTiempo = getEstadoTiempo(orden.fecha_entrega, orden.estado);
                  const tiempoConfig = getTiempoConfig(estadoTiempo);
                  const prioridadBadge = getPrioridadBadge(orden.prioridad);
                  const progreso = getProgreso(orden.producidas || 0, orden.cantidad);

                  return (
                    <Card key={orden.id_orden} className={estadoTiempo === 'retraso' ? 'border-red-200' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm text-gray-900">ORD-{String(orden.id_orden).padStart(6, '0')}</span>
                              <Badge variant={prioridadBadge.variant}>{prioridadBadge.label}</Badge>
                            </div>
                            <p className="text-xs text-gray-600">{orden.prenda}</p>
                            <p className="text-xs text-gray-400">{orden.cliente}</p>
                          </div>
                          <Badge variant={tiempoConfig.variant}>{tiempoConfig.label}</Badge>
                        </div>

                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progreso</span>
                            <span>{orden.producidas || 0} / {orden.cantidad} uds</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${estadoTiempo === 'retraso' ? 'bg-red-500' : estadoTiempo === 'riesgo' ? 'bg-orange-500' : 'bg-blue-600'}`}
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{progreso}% completado</p>
                        </div>

                        <div className="flex items-center gap-1 text-xs">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-gray-500">
                            Entrega: {new Date(orden.fecha_entrega).toLocaleDateString('es-CO')}
                          </span>
                          {estadoTiempo === 'retraso' && (
                            <span className="ml-auto flex items-center gap-1 text-red-600">
                              <AlertTriangle size={12} />
                              Retrasada
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}

        {!cargando && sedesFiltradas.every(s =>
          s.ordenes.filter(o => filtroEstado === 'todos' || getEstadoTiempo(o.fecha_entrega, o.estado) === filtroEstado).length === 0
        ) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">No hay órdenes en este estado</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}