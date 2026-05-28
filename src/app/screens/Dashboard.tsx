import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Package, AlertTriangle, ClipboardList, TrendingUp, ArrowRight,
  Building2, ListOrdered, Trash2, RefreshCw, History, TrendingDown,
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

export function Dashboard() {
  const navigate = useNavigate();
  const [ordenesActivas, setOrdenesActivas] = useState(0);
  const [alertasCriticas, setAlertasCriticas] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentMovimientos, setRecentMovimientos] = useState<any[]>([]);
  const [ordenesUrgentes, setOrdenesUrgentes] = useState<any[]>([]);

  const cargarDashboard = async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const [{ data: ordenes }, { data: alertas }, { data: urgentes }, { data: movimientos }] = await Promise.all([
      supabase.from('ordenesproduccion').select('*').neq('estado', 'Terminada'),
      supabase.from('vw_alertasstock').select('*').eq('id_sede', usuario.id_sede),
      supabase.from('ordenesproduccion').select('*')
        .in('prioridad', ['Urgente'])
        .neq('estado', 'Terminada')
        .order('fecha_entrega', { ascending: true })
        .limit(3),
      supabase.from('movimientosinventario')
        .select('*, insumos(nombre, unidad_medida), usuarios(nombre)')
        .order('fecha', { ascending: false })
        .limit(4),
    ]);

    setOrdenesActivas(ordenes?.length || 0);
    setAlertasCriticas(alertas?.length || 0);
    setRecentAlerts(alertas || []);
    setRecentMovimientos((movimientos || []).map((m: any) => ({
      ...m,
      nombre_insumo: m.insumos?.nombre ?? 'Insumo',
      unidad_medida: m.insumos?.unidad_medida ?? '',
      nombre_usuario: m.usuarios?.nombre ?? 'Usuario',
    })));
    setOrdenesUrgentes((urgentes || []).map(o => ({
      numeroOrden: 'ORD-' + String(o.id_orden).padStart(6, '0'),
      producto: o.prenda,
      diasRestantes: Math.ceil((new Date(o.fecha_entrega).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      sede: 'Sede ' + o.id_sede,
    })));
  };

  useEffect(() => {
    cargarDashboard();
  }, []);

  const quickActions = [
    {
      icon: Package,
      title: 'Registrar Insumos',
      description: 'Añadir materiales',
      path: '/insumos/registro',
      color: 'bg-blue-500',
    },
    {
      icon: ClipboardList,
      title: 'Registrar Órdenes',
      description: 'Nueva orden de producción',
      path: '/ordenes/registro',
      color: 'bg-green-500',
    },
    {
      icon: TrendingUp,
      title: 'Consultar Producción',
      description: 'Órdenes activas',
      path: '/ordenes/consulta',
      color: 'bg-purple-500',
    },
    {
      icon: AlertTriangle,
      title: 'Alertas de Faltantes',
      description: 'Stock bajo',
      path: '/insumos/faltantes',
      color: 'bg-orange-500',
    },
  ];

  const sprint2Actions = [
    {
      icon: ListOrdered,
      title: 'Priorizar Órdenes',
      description: 'Ordenar por urgencia',
      path: '/ordenes/priorizacion',
      color: 'bg-red-500',
    },
    {
      icon: Building2,
      title: 'Producción Sedes',
      description: 'Ver ambas sedes',
      path: '/produccion/sedes',
      color: 'bg-indigo-500',
    },
    {
      icon: Trash2,
      title: 'Eliminar Órdenes',
      description: 'Descartar órdenes',
      path: '/ordenes/eliminacion',
      color: 'bg-gray-600',
    },
    {
      icon: RefreshCw,
      title: 'Movimientos',
      description: 'Sincronización automática',
      path: '/insumos/inventario',
      color: 'bg-teal-500',
    },
  ];

  const sedesResumen = [
    {
      nombre: 'Sede Principal',
      ciudad: 'Medellín',
      ordenesActivas: 3,
      enRetraso: 1,
      enRiesgo: 1,
    },
    {
      nombre: 'Sede 2',
      ciudad: 'Bogotá',
      ordenesActivas: 2,
      enRetraso: 0,
      enRiesgo: 0,
    },
  ];

  

  

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl">Panel Principal</h1>

        </div>
        <p className="text-blue-100 text-sm mb-4">Bienvenido a Maintegral</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xl mb-1">{ordenesActivas}</div>
            <div className="text-xs text-blue-100">Órdenes activas</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-xl mb-1 text-red-300">{alertasCriticas}</div>
            <div className="text-xs text-blue-100">Alertas críticas</div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Sedes */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm text-gray-900">Resumen por Sede</h2>
              <button
                onClick={() => navigate('/produccion/sedes')}
                className="text-xs text-[#1e3a8a] flex items-center gap-1"
              >
                Ver detalle <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sedesResumen.map(sede => (
                <div
                  key={sede.nombre}
                  className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => navigate('/produccion/sedes')}
                >
                  <div className="flex items-center gap-1 mb-2">
                    <Building2 size={14} className="text-[#1e3a8a]" />
                    <span className="text-xs text-gray-700">{sede.nombre}</span>
                  </div>
                  <div className="text-xl text-gray-900 mb-1">{sede.ordenesActivas}</div>
                  <div className="text-xs text-gray-500 mb-2">órdenes activas</div>
                  <div className="flex gap-1 flex-wrap">
                    {sede.enRetraso > 0 && (
                      <Badge variant="danger">{sede.enRetraso} retraso</Badge>
                    )}
                    {sede.enRiesgo > 0 && (
                      <Badge variant="warning">{sede.enRiesgo} riesgo</Badge>
                    )}
                    {sede.enRetraso === 0 && sede.enRiesgo === 0 && (
                      <Badge variant="success">En tiempo</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Órdenes urgentes */}
        {ordenesUrgentes.length > 0 && (
          <Card className="mb-4 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown size={16} className="text-red-600" />
                <h2 className="text-sm text-red-700">Órdenes Urgentes</h2>
                <button
                  onClick={() => navigate('/ordenes/priorizacion')}
                  className="ml-auto text-xs text-[#1e3a8a] flex items-center gap-1"
                >
                  Gestionar <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {ordenesUrgentes.map(ord => (
                  <div key={ord.numeroOrden} className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                    <div>
                      <p className="text-xs text-gray-900">{ord.numeroOrden}</p>
                      <p className="text-xs text-gray-500">{ord.producto}</p>
                    </div>
                    <Badge variant="danger">
                      {ord.diasRestantes === 1 ? '¡Mañana!' : `${ord.diasRestantes} días`}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accesos rápidos */}
        <h2 className="text-sm text-gray-700 mb-3">Accesos Rápidos</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.path}
                className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-xs text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Funciones adicionales */}
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm text-gray-700">Gestión de Órdenes</h2>
          <Badge variant="info">Nuevo</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {sprint2Actions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.path}
                className="cursor-pointer hover:shadow-md transition-all active:scale-95"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center mb-3`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="text-xs text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-xs text-gray-500">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Historial rápido */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={16} className="text-gray-500" />
            <h2 className="text-sm text-gray-700">Movimientos Recientes</h2>
          </div>
          <button
            onClick={() => navigate('/insumos/historial')}
            className="text-xs text-[#1e3a8a] flex items-center gap-1"
          >
            Ver todo <ArrowRight size={14} />
          </button>
        </div>
        <div className="space-y-2 mb-5">
          {recentMovimientos.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No hay movimientos registrados aún</p>
          )}
          {recentMovimientos.map((mov: any, index: number) => (
            <Card key={mov.id_movimiento ?? index}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${mov.tipo === 'Entrada' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {mov.tipo === 'Entrada'
                    ? <TrendingDown size={16} className="text-green-600" />
                    : <TrendingUp size={16} className="text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{mov.nombre_insumo}</p>
                  <p className="text-xs text-gray-500 truncate">{mov.motivo}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-medium ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.tipo === 'Entrada' ? '+' : '-'}{mov.cantidad} {mov.unidad_medida}
                  </p>
                  <p className="text-xs text-gray-400">
                    {mov.fecha ? new Date(mov.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <MobileNav />
    </div>
  );
}