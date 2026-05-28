import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Factory, User, Lock, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';

import { Button } from '../components/Button';
import { Input } from '../components/Input';

import { supabase } from '../../utils/supabase';

export function Login() {

  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recuperar contraseña
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [usuarioRecuperar, setUsuarioRecuperar] = useState('');
  const [contrasenaRecuperada, setContrasenaRecuperada] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('usuario_acceso', usuario);

    console.log('DATA:', data);
    console.log('ERROR:', error);

    if (error) {
      alert('Error conectando con la base de datos');
      return;
    }

    if (!data || data.length === 0) {
      alert('Usuario no encontrado');
      return;
    }

    const usuarioEncontrado = data[0];

    if (String(usuarioEncontrado.contrasena) !== password) {
      alert('Contraseña incorrecta');
      return;
    }

    const { contrasena: _omit, ...usuarioSeguro } = usuarioEncontrado;

    localStorage.setItem(
      'usuario',
      JSON.stringify(usuarioSeguro)
    );

    alert(`Bienvenido ${usuarioEncontrado.nombre}`);

    navigate('/dashboard');
  };

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuscando(true);
    setContrasenaRecuperada(null);

    const { data, error } = await supabase
      .from('usuarios')
      .select('contrasena, nombre')
      .eq('usuario_acceso', usuarioRecuperar.trim());

    setBuscando(false);

    if (error || !data || data.length === 0) {
      alert('No se encontró ningún usuario con ese nombre de acceso.');
      return;
    }

    setContrasenaRecuperada(data[0].contrasena);
  };

  if (modoRecuperar) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e3a8a] rounded-2xl mb-4">
              <KeyRound size={32} className="text-white" />
            </div>
            <h1 className="text-2xl text-gray-900 mb-2">Recuperar contraseña</h1>
            <p className="text-gray-600 text-sm">
              Ingresa tu usuario de acceso y te mostraremos tu contraseña
            </p>
          </div>

          {!contrasenaRecuperada ? (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-[50px] transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  label="Usuario de acceso"
                  type="text"
                  placeholder="Ingresa tu usuario"
                  value={usuarioRecuperar}
                  onChange={(e) => setUsuarioRecuperar(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={buscando}>
                {buscando ? 'Buscando...' : 'Consultar contraseña'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-600 mb-2">Tu contraseña es:</p>
                <p className="text-2xl text-gray-900 tracking-widest">{contrasenaRecuperada}</p>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  setModoRecuperar(false);
                  setContrasenaRecuperada(null);
                  setUsuarioRecuperar('');
                  setUsuario(usuarioRecuperar);
                }}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}

          {!contrasenaRecuperada && (
            <button
              type="button"
              onClick={() => { setModoRecuperar(false); setContrasenaRecuperada(null); setUsuarioRecuperar(''); }}
              className="mt-4 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 mx-auto"
            >
              <ArrowLeft size={14} /> Volver al inicio de sesión
            </button>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <div className="flex-1 flex flex-col justify-center p-6 max-w-md mx-auto w-full">

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1e3a8a] rounded-2xl mb-4">
            <Factory size={32} className="text-white" />
          </div>

          <h1 className="text-3xl text-gray-900 mb-2">
            Maintegral
          </h1>

          <p className="text-gray-600 text-sm">
            Inicia sesión para continuar
          </p>

        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <div className="relative">
            <User
              size={20}
              className="absolute left-3 top-[50px] transform -translate-y-1/2 text-gray-400"
            />
            <Input
              label="Usuario"
              type="text"
              placeholder="Ingresa tu usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="pl-10"
              required
            />
          </div>

          <div className="relative">
            <Lock
              size={20}
              className="absolute left-3 top-[50px] transform -translate-y-1/2 text-gray-400"
            />
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[50px] transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setModoRecuperar(true)}
            className="text-sm text-[#1e3a8a] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>

          <Button
            type="submit"
            className="w-full"
            size="lg"
          >
            Iniciar sesión
          </Button>

        </form>

        <p className="text-center text-xs text-gray-500 mt-8">
          Maintegral v2.0
        </p>

      </div>

    </div>
  );
}
