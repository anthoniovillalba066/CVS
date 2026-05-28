import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, ArrowDown, ArrowUp, AlertTriangle, CheckCircle2, Package, History } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

interface Insumo {
  id_insumo: number;
  nombre: string;
  cantidad: number;
  stock_minimo: number;
  unidad_medida: string;
  id_sede: number;
}

export function InventarioAutomatico() {
  const navigate = useNavigate();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [tabActivo, setTabActivo] = useState<'registrar' | 'stock'>('registrar');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    tipo: 'Entrada',
    id_insumo: '',
    cantidad: '',
    motivo: '',
  });

  const cargarDatos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from('insumos')
      .select('*')
      .order('nombre');

    if (error) console.error('Error insumos:', error);
    setInsumos(data || []);
    setCargando(false);
  };

  useEffect(() => { cargarDatos(); }, []);

  const opcionesInsumos = [
    { value: '', label: 'Seleccionar insumo' },
    ...insumos.map(i => ({ value: String(i.id_insumo), label: `${i.nombre} (${i.cantidad} ${i.unidad_medida})` })),
  ];

  const tiposMovimiento = [
    { value: 'Entrada', label: 'Entrada — agrega stock' },
    { value: 'Salida', label: 'Salida — reduce stock' },
  ];

  const motivosEntrada = [
    { value: 'Compra de insumos', label: 'Compra de insumos' },
    { value: 'Devolución de proveedor', label: 'Devolución de proveedor' },
    { value: 'Ajuste de inventario', label: 'Ajuste de inventario' },
    { value: 'Otro', label: 'Otro' },
  ];

  const motivosSalida = [
    { value: 'Uso en producción', label: 'Uso en producción' },
    { value: 'Merma', label: 'Merma' },
    { value: 'Devolución a proveedor', label: 'Devolución a proveedor' },
    { value: 'Ajuste de inventario', label: 'Ajuste de inventario' },
    { value: 'Otro', label: 'Otro' },
  ];

  const insumoSeleccionado = insumos.find(i => String(i.id_insumo) === formData.id_insumo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuario.id_usuario || !usuario.id_sede) {
      alert('Sesión expirada. Inicia sesión de nuevo.');
      navigate('/');
      return;
    }

    if (!formData.id_insumo || !formData.cantidad || !formData.motivo) {
      alert('Completa todos los campos.');
      return;
    }

    const cantidadNum = Number(formData.cantidad);
    if (cantidadNum <= 0) {
      alert('La cantidad debe ser mayor a 0.');
      return;
    }

    // Validar que no haya más salidas que stock disponible
    if (formData.tipo === 'Salida' && insumoSeleccionado) {
      if (cantidadNum > insumoSeleccionado.cantidad) {
        alert(`Stock insuficiente. Solo hay ${insumoSeleccionado.cantidad} ${insumoSeleccionado.unidad_medida} disponibles.`);
        return;
      }
    }

    setGuardando(true);

    // 1. Registrar el movimiento
    const { error: errMov } = await supabase
      .from('movimientosinventario')
      .insert([{
        tipo: formData.tipo,
        id_insumo: Number(formData.id_insumo),
        cantidad: cantidadNum,
        motivo: formData.motivo,
        id_usuario: usuario.id_usuario,
        id_sede: insumoSeleccionado?.id_sede ?? usuario.id_sede,
      }]);

    if (errMov) {
      alert('Error al registrar movimiento: ' + errMov.message);
      setGuardando(false);
      return;
    }

    // 2. Actualizar el stock del insumo
    const nuevaCantidad = formData.tipo === 'Entrada'
      ? (insumoSeleccionado?.cantidad ?? 0) + cantidadNum
      : (insumoSeleccionado?.cantidad ?? 0) - cantidadNum;

    await supabase
      .from('insumos')
      .update({ cantidad: nuevaCantidad })
      .eq('id_insumo', Number(formData.id_insumo));

    setGuardando(false);
    setShowSuccess(true);
    setFormData({ tipo: 'Entrada', id_insumo: '', cantidad: '', motivo: '' });
    await cargarDatos();
    setTimeout(() => setShowSuccess(false), 2500);
  };

  const getEstadoStock = (insumo: Insumo) => {
    if (insumo.cantidad <= 0) return 'critico';
    if (insumo.stock_minimo > 0 && insumo.cantidad <= insumo.stock_minimo) return 'critico';
    if (insumo.stock_minimo > 0 && insumo.cantidad <= insumo.stock_minimo * 1.5) return 'advertencia';
    return 'ok';
  };

  const getEstadoBadge = (estado: string) => {
    const map: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
      ok: { variant: 'success', label: 'OK' },
      advertencia: { variant: 'warning', label: 'Bajo' },
      critico: { variant: 'danger', label: 'Crítico' },
    };
    return map[estado] ?? { variant: 'warning' as const, label: estado };
  };

  const totalCriticos = insumos.filter(i => getEstadoStock(i) === 'critico').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white p-6 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl">Movimientos de Inventario</h1>
            <p className="text-blue-100 text-xs">Registra entradas y salidas de insumos</p>
          </div>
          <button
            onClick={() => navigate('/insumos/historial')}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Ver historial"
          >
            <History size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1">{insumos.length}</div>
            <div className="text-xs text-blue-100">Insumos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1 text-red-300">{totalCriticos}</div>
            <div className="text-xs text-blue-100">Críticos</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-lg mb-1 text-green-300">
              {insumos.filter(i => getEstadoStock(i) === 'ok').length}
            </div>
            <div className="text-xs text-blue-100">En stock</div>
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4">
        <div className="flex gap-1 mb-4 bg-white rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => setTabActivo('registrar')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${tabActivo === 'registrar' ? 'bg-[#1e3a8a] text-white' : 'text-gray-600'}`}
          >
            <Plus size={15} /> Registrar
          </button>
          <button
            onClick={() => setTabActivo('stock')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${tabActivo === 'stock' ? 'bg-[#1e3a8a] text-white' : 'text-gray-600'}`}
          >
            <Package size={15} /> Stock Actual
          </button>
        </div>

        {cargando && <div className="text-center py-8 text-gray-500 text-sm">Cargando insumos...</div>}

        {/* TAB: REGISTRAR MOVIMIENTO */}
        {!cargando && tabActivo === 'registrar' && (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'Entrada', motivo: '' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-colors ${
                      formData.tipo === 'Entrada'
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <ArrowDown size={16} /> Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'Salida', motivo: '' })}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm transition-colors ${
                      formData.tipo === 'Salida'
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    <ArrowUp size={16} /> Salida
                  </button>
                </div>

                <Select
                  label="Insumo"
                  options={opcionesInsumos}
                  value={formData.id_insumo}
                  onChange={(e) => setFormData({ ...formData, id_insumo: e.target.value })}
                  required
                />

                {insumoSeleccionado && (
                  <div className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
                    getEstadoStock(insumoSeleccionado) === 'critico'
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-blue-50 border border-blue-200 text-blue-700'
                  }`}>
                    {getEstadoStock(insumoSeleccionado) === 'critico' && <AlertTriangle size={13} />}
                    Stock actual: <strong>{insumoSeleccionado.cantidad} {insumoSeleccionado.unidad_medida}</strong>
                    {insumoSeleccionado.stock_minimo > 0 && ` · Mínimo: ${insumoSeleccionado.stock_minimo}`}
                  </div>
                )}

                <Input
                  label="Cantidad"
                  type="number"
                  placeholder="0"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  required
                  min="1"
                />

                <Select
                  label="Motivo"
                  options={[
                    { value: '', label: 'Seleccionar motivo' },
                    ...(formData.tipo === 'Entrada' ? motivosEntrada : motivosSalida),
                  ]}
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  required
                />

                <div className={`rounded-xl p-4 border text-xs ${
                  formData.tipo === 'Entrada'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {formData.tipo === 'Entrada'
                    ? 'Esta entrada sumará unidades al stock del insumo seleccionado.'
                    : 'Esta salida restará unidades del stock del insumo seleccionado.'
                  }
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={guardando}>
                  {guardando ? 'Registrando...' : `Registrar ${formData.tipo}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* TAB: STOCK ACTUAL */}
        {!cargando && tabActivo === 'stock' && (
          <div className="space-y-3">
            {insumos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No hay insumos registrados</p>
              </div>
            )}
            {insumos.map(insumo => {
              const estado = getEstadoStock(insumo);
              const estadoBadge = getEstadoBadge(estado);
              const pct = insumo.stock_minimo > 0
                ? Math.min(Math.round((insumo.cantidad / (insumo.stock_minimo * 2)) * 100), 100)
                : insumo.cantidad > 0 ? 100 : 0;

              return (
                <Card key={insumo.id_insumo}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-sm text-gray-900 mb-1">{insumo.nombre}</h3>
                        {estado === 'critico' && (
                          <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
                            <AlertTriangle size={12} />
                            <span>Por debajo del mínimo</span>
                          </div>
                        )}
                      </div>
                      <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Stock: <strong>{insumo.cantidad} {insumo.unidad_medida}</strong></span>
                        <span>Mín: {insumo.stock_minimo}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            estado === 'critico' ? 'bg-red-500' :
                            estado === 'advertencia' ? 'bg-orange-400' : 'bg-green-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="max-w-sm w-full">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">¡Movimiento registrado!</h3>
              <p className="text-sm text-gray-600">El stock del insumo ha sido actualizado</p>
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
