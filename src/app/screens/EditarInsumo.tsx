import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card, CardContent } from '../components/Card';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

export function EditarInsumo() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmEliminar, setShowConfirmEliminar] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'tela',
    cantidad: '',
    unidad_medida: 'metros',
    stock_minimo: '',
  });

  const tiposInsumo = [
    { value: 'tela', label: 'Tela' },
    { value: 'hilo', label: 'Hilo' },
    { value: 'botón', label: 'Botón' },
    { value: 'cierre', label: 'Cierre' },
    { value: 'otro', label: 'Otro' },
  ];

  const unidades = [
    { value: 'metros', label: 'Metros' },
    { value: 'kilos', label: 'Kilos' },
    { value: 'unidades', label: 'Unidades' },
  ];

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from('insumos')
        .select('*')
        .eq('id_insumo', id)
        .single();

      if (error || !data) {
        alert('No se encontró el insumo.');
        navigate('/insumos/faltantes');
        return;
      }

      setFormData({
        nombre: data.nombre,
        categoria: data.categoria,
        cantidad: String(data.cantidad),
        unidad_medida: data.unidad_medida,
        stock_minimo: String(data.stock_minimo),
      });
      setCargando(false);
    };
    cargar();
  }, [id]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    const { error } = await supabase
      .from('insumos')
      .update({
        nombre: formData.nombre.trim(),
        categoria: formData.categoria,
        cantidad: Number(formData.cantidad),
        unidad_medida: formData.unidad_medida,
        stock_minimo: Number(formData.stock_minimo),
      })
      .eq('id_insumo', id);

    setGuardando(false);

    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/insumos/faltantes');
    }, 1800);
  };

  const handleEliminar = async () => {
    setEliminando(true);

    const { error } = await supabase
      .from('insumos')
      .delete()
      .eq('id_insumo', id);

    setEliminando(false);

    if (error) {
      alert('Error al eliminar el insumo: ' + error.message);
      return;
    }

    navigate('/insumos/faltantes');
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando insumo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate('/insumos/faltantes')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg text-gray-900">Editar Insumo</h1>
            <p className="text-xs text-gray-500">Modifica los datos del insumo</p>
          </div>
          <button
            onClick={() => setShowConfirmEliminar(true)}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleGuardar} className="space-y-4">
              <Input
                label="Nombre del insumo"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />

              <Select
                label="Tipo de insumo"
                options={tiposInsumo}
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  required
                  min="0"
                />
                <Select
                  label="Unidad"
                  options={unidades}
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                  required
                />
              </div>

              <Input
                label="Stock mínimo"
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                required
                min="0"
              />

              <Button type="submit" className="w-full" size="lg" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Modal confirmar eliminar */}
      {showConfirmEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={22} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-base text-gray-900">Eliminar insumo</h3>
                  <p className="text-xs text-gray-500">{formData.nombre}</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-red-700">Esta acción no se puede deshacer.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setShowConfirmEliminar(false)} disabled={eliminando}>
                  Cancelar
                </Button>
                <button
                  onClick={handleEliminar}
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

      {/* Modal éxito */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <Card className="max-w-sm w-full">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg text-gray-900 mb-2">¡Insumo actualizado!</h3>
              <p className="text-sm text-gray-500">{formData.nombre}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
