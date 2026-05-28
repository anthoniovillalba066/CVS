import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, AlertTriangle, CheckCircle2, Plus, PackagePlus, Pencil } from 'lucide-react';

import { supabase } from '../../utils/supabase';

import { Button } from '../components/Button';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { MobileNav } from '../components/MobileNav';

interface Insumo {
  id_insumo: number;
  nombre: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string;
  categoria: string;
  estado: 'critical' | 'warning' | 'ok';
  reportado: boolean;
}

export function ReporteFaltantes() {

  const navigate = useNavigate();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [insumoAumentar, setInsumoAumentar] = useState<Insumo | null>(null);
  const [cantidadAgregar, setCantidadAgregar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const fetchInsumos = async () => {

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    const [{ data, error }, { data: movimientos }] = await Promise.all([
      supabase.from('insumos').select('*').eq('id_sede', usuario.id_sede),
      supabase.from('movimientosinventario').select('id_insumo')
        .eq('motivo', 'Reporte de faltante').eq('id_sede', usuario.id_sede),
    ]);

    if (error) { console.error('Error al cargar insumos:', error); return; }

    const reportadosIds = new Set((movimientos || []).map((m: any) => m.id_insumo));

    const mapped: Insumo[] = data.map((i: any) => {
      let estado: 'critical' | 'warning' | 'ok' = 'ok';
      if (i.stock_minimo > 0) {
        const porcentaje = i.cantidad / i.stock_minimo;
        if (i.cantidad <= i.stock_minimo) estado = 'critical';
        else if (porcentaje <= 1.5) estado = 'warning';
      } else if (i.cantidad === 0) {
        estado = 'critical';
      }
      return {
        id_insumo: i.id_insumo,
        nombre: i.nombre,
        cantidad: i.cantidad,
        stock_minimo: i.stock_minimo,
        unidad_medida: i.unidad_medida,
        categoria: i.categoria,
        estado,
        reportado: reportadosIds.has(i.id_insumo),
      };
    });

    setInsumos(mapped);
  };

  useEffect(() => { fetchInsumos(); }, []);

  const handleReporte = async (insumo: Insumo) => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const { error } = await supabase.from('movimientosinventario').insert([{
      tipo: 'Salida',
      id_insumo: insumo.id_insumo,
      cantidad: 0,
      motivo: 'Reporte de faltante',
      id_usuario: usuario.id_usuario,
      id_sede: usuario.id_sede,
    }]);
    if (error) { alert('Error al reportar faltante'); return; }
    setInsumos(prev => prev.map(i => i.id_insumo === insumo.id_insumo ? { ...i, reportado: true } : i));
  };

  const handleAumentarStock = async () => {
    if (!insumoAumentar || !cantidadAgregar || Number(cantidadAgregar) <= 0) {
      alert('Ingresa una cantidad válida.'); return;
    }
    setGuardando(true);
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const nuevaCantidad = insumoAumentar.cantidad + Number(cantidadAgregar);

    const { error: errorInsumo } = await supabase
      .from('insumos').update({ cantidad: nuevaCantidad }).eq('id_insumo', insumoAumentar.id_insumo);

    if (errorInsumo) { alert('Error al actualizar el stock: ' + errorInsumo.message); setGuardando(false); return; }

    await supabase.from('movimientosinventario').insert([{
      tipo: 'Entrada',
      id_insumo: insumoAumentar.id_insumo,
      cantidad: Number(cantidadAgregar),
      motivo: 'Ingreso de stock',
      id_usuario: usuario.id_usuario,
      id_sede: usuario.id_sede,
    }]);

    const nuevoEstado = (() => {
      if (insumoAumentar.stock_minimo > 0) {
        const porcentaje = nuevaCantidad / insumoAumentar.stock_minimo;
        if (nuevaCantidad <= insumoAumentar.stock_minimo) return 'critical' as const;
        if (porcentaje <= 1.5) return 'warning' as const;
        return 'ok' as const;
      }
      return nuevaCantidad === 0 ? 'critical' as const : 'ok' as const;
    })();

    setInsumos(prev => prev.map(i =>
      i.id_insumo === insumoAumentar.id_insumo ? { ...i, cantidad: nuevaCantidad, estado: nuevoEstado } : i
    ));
    setInsumoAumentar(null);
    setCantidadAgregar('');
    setGuardando(false);
  };

  const ordenados = [...insumos].sort((a, b) => {
    const prioridad = { critical: 0, warning: 1, ok: 2 };
    return prioridad[a.estado] - prioridad[b.estado];
  });

  const totalCriticos = insumos.filter(i => i.estado === 'critical').length;
  const totalReportados = insumos.filter(i => i.reportado).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg text-gray-900">Insumos</h1>
            <p className="text-xs text-gray-500">Control de stock</p>
          </div>
          <button
            onClick={() => navigate('/insumos/registro')}
            className="p-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-red-600 mb-1">{totalCriticos}</div>
              <p className="text-xs text-gray-600">Críticos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl text-green-600 mb-1">{totalReportados}</div>
              <p className="text-xs text-gray-600">Reportados</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-sm text-gray-600 mb-3">Todos los insumos ({insumos.length})</h2>

        <div className="space-y-3">
          {ordenados.map((insumo) => (
            <Card key={insumo.id_insumo}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    insumo.estado === 'critical' ? 'bg-red-100' : insumo.estado === 'warning' ? 'bg-orange-100' : 'bg-green-100'
                  }`}>
                    {insumo.estado === 'ok'
                      ? <CheckCircle2 size={20} className="text-green-600" />
                      : <AlertTriangle size={20} className={insumo.estado === 'critical' ? 'text-red-600' : 'text-orange-600'} />
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-900 mb-1">{insumo.nombre}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      Stock: {insumo.cantidad} {insumo.unidad_medida} | Mínimo: {insumo.stock_minimo} {insumo.unidad_medida}
                    </p>
                    <Badge variant={insumo.estado === 'critical' ? 'danger' : insumo.estado === 'warning' ? 'warning' : 'success'}>
                      {insumo.estado === 'critical' ? 'Crítico' : insumo.estado === 'warning' ? 'Advertencia' : 'OK'}
                    </Badge>
                  </div>
                  <button
                    onClick={() => navigate(`/insumos/editar/${insumo.id_insumo}`)}
                    className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-blue-50 hover:text-[#1e3a8a] transition-colors flex-shrink-0"
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => { setInsumoAumentar(insumo); setCantidadAgregar(''); }}
                  >
                    <PackagePlus size={15} />
                    Agregar stock
                  </Button>

                  {insumo.estado !== 'ok' && (
                    insumo.reportado ? (
                      <div className="flex-1 flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                        <CheckCircle2 size={15} />
                        <span>Reportado</span>
                      </div>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => handleReporte(insumo)}>
                        Reportar
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {ordenados.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <p className="text-gray-500">No hay insumos registrados</p>
            </div>
          )}
        </div>
      </div>

      {insumoAumentar && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg text-gray-900 mb-1">Agregar stock</h3>
              <p className="text-sm text-gray-500 mb-4">
                {insumoAumentar.nombre} — stock actual: {insumoAumentar.cantidad} {insumoAumentar.unidad_medida}
              </p>
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  Cantidad a agregar ({insumoAumentar.unidad_medida})
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent text-lg"
                  placeholder="0"
                  value={cantidadAgregar}
                  onChange={(e) => setCantidadAgregar(e.target.value)}
                  autoFocus
                />
                {cantidadAgregar && Number(cantidadAgregar) > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Nuevo stock: {insumoAumentar.cantidad + Number(cantidadAgregar)} {insumoAumentar.unidad_medida}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => { setInsumoAumentar(null); setCantidadAgregar(''); }} disabled={guardando}>
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={handleAumentarStock} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Confirmar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
