import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Shield, Calculator } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, role, login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') navigate('/admin/precios', { replace: true });
      else navigate('/admin/cotizador', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(pin);
    if (result.success) {
      const target = result.role === 'admin' ? '/admin/precios' : '/admin/cotizador';
      navigate(target, { replace: true });
    } else {
      setError('PIN incorrecto. Intentá de nuevo (Admin: 1234).');
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-moana-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/fotos/LOGOS/logo.png" alt="Moana Turismo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="font-display font-bold text-moana-blue text-2xl">Panel Interno</h1>
          <p className="text-moana-gray text-sm mt-1">Moana Turismo — Equipo de ventas</p>
        </div>

        {/* Login card */}
        <div className="card p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-moana-blue-pale rounded-2xl flex items-center justify-center">
              <Lock size={28} className="text-moana-blue" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field text-center block mb-2">Ingresá tu PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="6"
                placeholder="• • • •"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-field text-center text-2xl font-bold tracking-widest"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center bg-red-50 rounded-xl py-2 px-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              <Lock size={18} />
              Ingresar
            </button>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-moana-cream rounded-xl">
              <Shield size={20} className="text-moana-blue mx-auto mb-1" />
              <p className="text-xs text-moana-gray font-medium">Admin (Flor)</p>
              <p className="text-xs text-moana-gray">Carga precios</p>
            </div>
            <div className="text-center p-3 bg-moana-cream rounded-xl">
              <Calculator size={20} className="text-moana-orange mx-auto mb-1" />
              <p className="text-xs text-moana-gray font-medium">Vendedor</p>
              <p className="text-xs text-moana-gray">Cotizar y vender</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-moana-gray mt-4">
          PIN Admin: <strong>1234</strong> | PIN Vendedor: <strong>0000</strong>
          <br/>
          <span className="text-moana-blue">(Cambiables desde el panel Admin)</span>
        </p>
      </div>
    </div>
  );
}
