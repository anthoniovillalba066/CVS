import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Factory } from 'lucide-react';

export function SplashScreen() {

  const navigate = useNavigate();

  useEffect(() => {

    const timer = setTimeout(() => {

      navigate('/login');

    }, 2500);

    return () => clearTimeout(timer);

  }, [navigate]);

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex flex-col items-center justify-center p-6">

      <div className="animate-fade-in">

        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-3xl mb-6 flex items-center justify-center">

          <Factory
            size={80}
            className="text-white"
            strokeWidth={1.5}
          />

        </div>

        <h1 className="text-4xl text-white text-center mb-2 tracking-tight">
          Maintegral
        </h1>

        <p className="text-blue-100 text-center text-sm">
          Sistema de Gestión Industrial
        </p>

      </div>

      <div className="absolute bottom-8">

        <div className="flex gap-2">

          <div
            className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
            style={{ animationDelay: '0s' }}
          ></div>

          <div
            className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
            style={{ animationDelay: '0.2s' }}
          ></div>

          <div
            className="w-2 h-2 bg-white/50 rounded-full animate-pulse"
            style={{ animationDelay: '0.4s' }}
          ></div>

        </div>

      </div>

    </div>
  );
}