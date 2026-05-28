import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Home, Package, ClipboardList, Settings, LogOut, X, User } from 'lucide-react';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/');
  };

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/dashboard' },
    { icon: Package, label: 'Insumos', path: '/insumos/faltantes' },
    { icon: ClipboardList, label: 'Órdenes', path: '/ordenes/consulta' },
    { icon: Settings, label: 'Producción', path: '/produccion/gestion' },
  ];

  return (
    <>
      {/* Overlay menú usuario */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowMenu(false)}>
          <div
            className="absolute inset-0 bg-black/40"
          />
          <div
            className="relative w-full bg-white rounded-t-2xl shadow-xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#1e3a8a] rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{usuario.nombre || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{usuario.rol || ''}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <button
                onClick={handleCerrarSesion}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span className="text-sm">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path.split('/').slice(0, 2).join('/'));

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? 'text-[#1e3a8a]' : 'text-gray-500'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}

          {/* Botón usuario / cerrar sesión */}
          <button
            onClick={() => setShowMenu(true)}
            className="flex flex-col items-center justify-center gap-1 px-4 py-2 text-gray-500 hover:text-[#1e3a8a] transition-colors"
          >
            <User size={20} />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </>
  );
}
