import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card, CardContent } from '../components/Card';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

interface Sede { id_sede: number; nombre: string; }

export function EditarOrden() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmEliminar, setShowConfirmEliminar] = useState(false);
  const [sedes, setSedes] = useState<Sede[]>([]);

  const [formData, setFormData] = useState({
    prenda: '',
    cliente: '',
    cantidad: '',
    fecha_entrega: '',
    prioridad: 'Normal',
    estado: 'Pendiente',
    id_sede: '',
  });

  const productos = [
    { value: '', label: 'Seleccionar producto' },
    { value: 'Jean Clásico Slim Fit', label: 'Jean Clásico Slim Fit' },
    { value: 'Jean Americanino Clásico', label: 'Jean Americanino Clásico' },
    { value: 'Jean Skinny Oscuro', label: 'Jean Skinny Oscuro' },
    { value: 'Jean Baggy Oversize', label: 'Jean Baggy Oversize' },
    { value: 'Jean Straight Leg', label: 'Jean Straight Leg' },
    { value: 'Jean Boyfriend Lavado', label: 'Jean Boyfriend Lavado' },
    { value: 'Jean Flare Acampanado', label: 'Jean Flare Acampanado' },
    { value: 'Jean Cargo con Bolsillos', label: 'Jean Cargo con Bolsillos' },
    { value: 'Jean Tiro Alto', label: 'Jean Tiro Alto' },
    { value: 'Jean Mom Fit', label: 'Jean Mom Fit' },
    { value: 'Camisa J Balvin Edición Especial', label: 'Camisa J Balvin Edición Especial' },
    { value: 'Camisa Ejecutiva Lino', label: 'Camisa Ejecutiva Lino' },
    { value: 'Camisa Oxford Manga Larga', label: 'Camisa Oxford Manga Larga' },
    { value: 'Camisa Casual Cuadros', label: 'Camisa Casual Cuadros' },
    { value: 'Camisa Hawaiana Floral', label: 'Camisa Hawaiana Floral' },
    { value: 'Camisa Denim Chambray', label: 'Camisa Denim Chambray' },
    { value: 'Camisa Franela Manga Corta', label: 'Camisa Franela Manga Corta' },
    { value: 'Camisa Seda Satinada', label: 'Camisa Seda Satinada' },
    { value: 'Camisa Lino Verano', label: 'Camisa Lino Verano' },
    { value: 'Camisa Oversize Algodón', label: 'Camisa Oversize Algodón' },
    { value: 'Camiseta Básica Algodón', label: 'Camiseta Básica Algodón' },
    { value: 'Camiseta Polo Colores', label: 'Camiseta Polo Colores' },
    { value: 'Camiseta Crop Top', label: 'Camiseta Crop Top' },
    { value: 'Camiseta Manga Larga Deportiva', label: 'Camiseta Manga Larga Deportiva' },
    { value: 'Camiseta Estampada Gráfica', label: 'Camiseta Estampada Gráfica' },
    { value: 'Camiseta Oversize Tie-Dye', label: 'Camiseta Oversize Tie-Dye' },
    { value: 'Camiseta Raglán Bicolor', label: 'Camiseta Raglán Bicolor' },
    { value: 'Camiseta Cuello V Premium', label: 'Camiseta Cuello V Premium' },
    { value: 'Camiseta Henley Botones', label: 'Camiseta Henley Botones' },
    { value: 'Camiseta Térmica Interior', label: 'Camiseta Térmica Interior' },
    { value: 'Pantalón Cargo', label: 'Pantalón Cargo' },
    { value: 'Pantalón Chino Slim', label: 'Pantalón Chino Slim' },
    { value: 'Pantalón Palazzo Lino', label: 'Pantalón Palazzo Lino' },
    { value: 'Pantalón Jogger Algodón', label: 'Pantalón Jogger Algodón' },
    { value: 'Pantalón Sastre Formal', label: 'Pantalón Sastre Formal' },
    { value: 'Pantalón Cuero Sintético', label: 'Pantalón Cuero Sintético' },
    { value: 'Pantalón Harem Estampado', label: 'Pantalón Harem Estampado' },
    { value: 'Pantalón Pescador Capri', label: 'Pantalón Pescador Capri' },
    { value: 'Pantalón Drill Beige', label: 'Pantalón Drill Beige' },
    { value: 'Pantalón Wide Leg Lino', label: 'Pantalón Wide Leg Lino' },
    { value: 'Chaqueta Denim', label: 'Chaqueta Denim' },
    { value: 'Chaqueta Bomber Nylon', label: 'Chaqueta Bomber Nylon' },
    { value: 'Chaqueta Cuero Sintético', label: 'Chaqueta Cuero Sintético' },
    { value: 'Chaqueta Cortaviento', label: 'Chaqueta Cortaviento' },
    { value: 'Abrigo Lana Oversize', label: 'Abrigo Lana Oversize' },
    { value: 'Blazer Structured Formal', label: 'Blazer Structured Formal' },
    { value: 'Blazer Lino Verano', label: 'Blazer Lino Verano' },
    { value: 'Cardigan Tejido Grueso', label: 'Cardigan Tejido Grueso' },
    { value: 'Vestido Cóctel Algodón', label: 'Vestido Cóctel Algodón' },
    { value: 'Vestido Casual Lino', label: 'Vestido Casual Lino' },
    { value: 'Vestido Lino Playa', label: 'Vestido Lino Playa' },
    { value: 'Vestido Noche Seda', label: 'Vestido Noche Seda' },
    { value: 'Blusa Manga Larga Denim', label: 'Blusa Manga Larga Denim' },
    { value: 'Blusa Seda Manga Corta', label: 'Blusa Seda Manga Corta' },
    { value: 'Blusa Off-Shoulder', label: 'Blusa Off-Shoulder' },
    { value: 'Blusa Transparente Chiffon', label: 'Blusa Transparente Chiffon' },
    { value: 'Sudadera Básica', label: 'Sudadera Básica' },
    { value: 'Hoodie Canguro Algodón', label: 'Hoodie Canguro Algodón' },
    { value: 'Sudadera Crop Fleece', label: 'Sudadera Crop Fleece' },
    { value: 'Hoodie Oversize Tie-Dye', label: 'Hoodie Oversize Tie-Dye' },
    { value: 'Sudadera Estampada Universitaria', label: 'Sudadera Estampada Universitaria' },
    { value: 'Falda Mini Denim', label: 'Falda Mini Denim' },
    { value: 'Falda Midi Plisada', label: 'Falda Midi Plisada' },
    { value: 'Falda Maxi Lino', label: 'Falda Maxi Lino' },
    { value: 'Falda Lápiz Formal', label: 'Falda Lápiz Formal' },
    { value: 'Traje Noche Seda', label: 'Traje Noche Seda' },
    { value: 'Conjunto Deportivo Two-Piece', label: 'Conjunto Deportivo Two-Piece' },
    { value: 'Conjunto Lino Verano', label: 'Conjunto Lino Verano' },
    { value: 'Mono Casual Algodón', label: 'Mono Casual Algodón' },
    { value: 'Mono Formal Sastre', label: 'Mono Formal Sastre' },
  ];

  const prioridades = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Urgente', label: 'Urgente' },
  ];

  const estados = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En proceso', label: 'En Proceso' },
    { value: 'Terminada', label: 'Terminada' },
  ];

  useEffect(() => {
    const cargar = async () => {
      const [{ data: orden, error }, { data: sedesData }] = await Promise.all([
        supabase.from('ordenesproduccion').select('*').eq('id_orden', id).single(),
        supabase.from('sedes').select('id_sede, nombre').order('id_sede'),
      ]);

      if (error || !orden) {
        alert('No se encontró la orden.');
        navigate('/ordenes/consulta');
        return;
      }

      if (sedesData) setSedes(sedesData);

      setFormData({
        prenda: orden.prenda,
        cliente: orden.cliente,
        cantidad: String(orden.cantidad),
        fecha_entrega: orden.fecha_entrega?.split('T')[0] ?? orden.fecha_entrega,
        prioridad: orden.prioridad,
        estado: orden.estado,
        id_sede: String(orden.id_sede),
      });
      setCargando(false);
    };
    cargar();
  }, [id]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    const { error } = await supabase
      .from('ordenesproduccion')
      .update({
        prenda: formData.prenda,
        cliente: formData.cliente.trim(),
        cantidad: Number(formData.cantidad),
        fecha_entrega: formData.fecha_entrega,
        prioridad: formData.prioridad,
        estado: formData.estado,
        id_sede: Number(formData.id_sede),
      })
      .eq('id_orden', id);

    setGuardando(false);

    if (error) {
      alert('Error al guardar: ' + error.message);
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/ordenes/consulta');
    }, 1800);
  };

  const handleEliminar = async () => {
    setEliminando(true);

    await supabase.from('consumoinsumos').delete().eq('id_orden', id);

    const { error } = await supabase
      .from('ordenesproduccion')
      .delete()
      .eq('id_orden', id);

    setEliminando(false);

    if (error) {
      alert('Error al eliminar: ' + error.message);
      return;
    }

    navigate('/ordenes/consulta');
  };

  const opcionesSedes = [
    { value: '', label: 'Seleccionar sede' },
    ...sedes.map(s => ({ value: String(s.id_sede), label: s.nombre })),
  ];

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando orden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => navigate('/ordenes/consulta')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg text-gray-900">Editar Orden</h1>
            <p className="text-xs text-gray-500">ORD-{String(id).padStart(6, '0')}</p>
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

              <Select
                label="Sede"
                options={opcionesSedes}
                value={formData.id_sede}
                onChange={(e) => setFormData({ ...formData, id_sede: e.target.value })}
                required
              />

              <Input
                label="Cliente"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                required
              />

              <Select
                label="Producto"
                options={productos}
                value={formData.prenda}
                onChange={(e) => setFormData({ ...formData, prenda: e.target.value })}
                required
              />

              <Input
                label="Cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
                min="1"
              />

              <Input
                label="Fecha límite de entrega"
                type="date"
                value={formData.fecha_entrega}
                onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                required
              />

              <Select
                label="Prioridad"
                options={prioridades}
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                required
              />

              <Select
                label="Estado"
                options={estados}
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                required
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
                  <h3 className="text-base text-gray-900">Eliminar orden</h3>
                  <p className="text-xs text-gray-500">ORD-{String(id).padStart(6, '0')} · {formData.prenda}</p>
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
              <h3 className="text-lg text-gray-900 mb-2">¡Orden actualizada!</h3>
              <p className="text-sm text-gray-500">{formData.prenda}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
