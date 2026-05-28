import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card, CardContent } from '../components/Card';
import { MobileNav } from '../components/MobileNav';
import { supabase } from '../../utils/supabase';

interface Sede {
  id_sede: number;
  nombre: string;
}

export function RegistroOrdenes() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [sedes, setSedes] = useState<Sede[]>([]);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const [formData, setFormData] = useState({
    producto: '',
    cantidad: '',
    fechaLimite: '',
    prioridad: 'Normal',
    cliente: '',
    id_sede: String(usuario.id_sede || ''),
  });

  useEffect(() => {
    const cargarSedes = async () => {
      const { data } = await supabase.from('sedes').select('id_sede, nombre').order('id_sede');
      if (data) setSedes(data);
    };
    cargarSedes();
  }, []);

  const opcionesSedes = [
    { value: '', label: 'Seleccionar sede' },
    ...sedes.map(s => ({ value: String(s.id_sede), label: s.nombre })),
  ];

  const prioridades = [
    { value: 'Normal', label: 'Normal' },
    { value: 'Urgente', label: 'Urgente' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.id_usuario) {
      alert('Sesión expirada. Por favor inicia sesión de nuevo.');
      navigate('/');
      return;
    }

    if (!formData.id_sede) {
      alert('Por favor selecciona una sede.');
      return;
    }

    const { error } = await supabase
      .from('ordenesproduccion')
      .insert([
        {
          prenda: formData.producto,
          cliente: formData.cliente.trim(),
          cantidad: Number(formData.cantidad),
          fecha_entrega: formData.fechaLimite,
          prioridad: formData.prioridad,
          estado: 'Pendiente',
          id_sede: Number(formData.id_sede),
          id_usuario_responsable: usuario.id_usuario,
        },
      ]);

    if (error) {
      console.error('Error al registrar orden:', error);
      alert('Error al registrar la orden: ' + error.message);
      return;
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/ordenes/consulta');
    }, 2000);
  };

  const nombreSede = sedes.find(s => String(s.id_sede) === formData.id_sede)?.nombre || '';

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
          <div>
            <h1 className="text-lg text-gray-900">
              Registrar Orden de Producción
            </h1>
            <p className="text-xs text-gray-500">Planificación de producción</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">

              <Select
                label="Sede"
                options={opcionesSedes}
                value={formData.id_sede}
                onChange={(e) => setFormData({ ...formData, id_sede: e.target.value })}
                required
              />

              <Input
                label="Cliente"
                placeholder="Ej: Americanino"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                required
              />

              <Input
                label="Producto"
                placeholder="Ej: Jean Slim Fit Azul, Blusa Seda Manga Corta..."
                value={formData.producto}
                onChange={(e) => setFormData({ ...formData, producto: e.target.value })}
                required
              />

              <Input
                label="Cantidad"
                type="number"
                placeholder="0"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
                min="1"
              />

              <Input
                label="Fecha límite de entrega"
                type="date"
                value={formData.fechaLimite}
                onChange={(e) => setFormData({ ...formData, fechaLimite: e.target.value })}
                required
                min={new Date().toISOString().split('T')[0]}
              />

              <Select
                label="Prioridad"
                options={prioridades}
                value={formData.prioridad}
                onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Estado inicial:</strong> Pendiente
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  La orden se creará en estado "Pendiente" y podrá actualizarse desde Gestión de Producción
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Registrar Orden
              </Button>
            </form>
          </CardContent>
        </Card>

        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <Card className="max-w-sm w-full animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-lg text-gray-900 mb-2">
                  ¡Orden registrada!
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Producto: {formData.producto}
                </p>
                {nombreSede && (
                  <p className="text-xs text-gray-500">
                    Sede: {nombreSede}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Se ha creado exitosamente
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
