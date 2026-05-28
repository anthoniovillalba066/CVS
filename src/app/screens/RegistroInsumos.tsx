import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

import { supabase } from '../../utils/supabase';

import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card, CardContent } from '../components/Card';
import { MobileNav } from '../components/MobileNav';

export function RegistroInsumos() {

  const navigate = useNavigate();

  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    const usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    if (!usuario.id_sede || !usuario.id_usuario) {

      alert(
        'Sesión expirada. Por favor inicia sesión de nuevo.'
      );

      navigate('/');

      return;
    }

    if (!formData.nombre.trim()) {

      alert('El nombre del insumo es requerido.');

      return;
    }

    const { data: insumoData, error } = await supabase
      .from('insumos')
      .insert([
        {
          nombre: formData.nombre.trim(),
          categoria: formData.categoria,
          unidad_medida: formData.unidad_medida,
          cantidad: Number(formData.cantidad),
          stock_minimo: Number(formData.stock_minimo),
          id_sede: usuario.id_sede,
          id_usuario_responsable: usuario.id_usuario,
        },
      ])
      .select()
      .single();

    if (error) {

      console.error('Error al registrar insumo:', error);

      alert(
        'Error al registrar el insumo: ' +
        error.message
      );

      return;
    }

    // Registrar movimiento de entrada inicial si hay cantidad
    if (insumoData && Number(formData.cantidad) > 0) {
      await supabase.from('movimientosinventario').insert([{
        tipo: 'Entrada',
        id_insumo: insumoData.id_insumo,
        cantidad: Number(formData.cantidad),
        motivo: 'Registro inicial de insumo',
        id_usuario: usuario.id_usuario,
        id_sede: usuario.id_sede,
      }]);
    }

    setShowSuccess(true);

    setTimeout(() => {

      setShowSuccess(false);

      setFormData({
        nombre: '',
        categoria: 'tela',
        cantidad: '',
        unidad_medida: 'metros',
        stock_minimo: '',
      });

    }, 2000);
  };

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
              Registrar Insumos
            </h1>

            <p className="text-xs text-gray-500">
              HU1 - Control de inventario
            </p>

          </div>

        </div>

      </div>

      <div className="p-4">

        <Card>

          <CardContent className="p-6">

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <Input
                label="Nombre del insumo"
                placeholder="Ej: Tela Denim Azul"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nombre: e.target.value,
                  })
                }
                required
              />

              <Select
                label="Tipo de insumo"
                options={tiposInsumo}
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoria: e.target.value,
                  })
                }
                required
              />

              <div className="grid grid-cols-2 gap-4">

                <Input
                  label="Cantidad"
                  type="number"
                  placeholder="0"
                  value={formData.cantidad}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cantidad: e.target.value,
                    })
                  }
                  required
                  min="0"
                />

                <Select
                  label="Unidad"
                  options={unidades}
                  value={formData.unidad_medida}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unidad_medida: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <Input
                label="Stock mínimo"
                type="number"
                placeholder="0"
                value={formData.stock_minimo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_minimo: e.target.value,
                  })
                }
                required
                min="0"
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
              >
                Guardar Insumo
              </Button>

            </form>

          </CardContent>

        </Card>

      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Insumo registrado!</h3>
            <p className="text-sm text-gray-600">El insumo ha sido guardado correctamente en el inventario.</p>
          </div>
        </div>
      )}

      <MobileNav />

    </div>
  );
}