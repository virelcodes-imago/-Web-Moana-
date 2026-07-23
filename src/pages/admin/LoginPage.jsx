import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, Calculator, LogOut, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated, role, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const cleanPin = String(pin || '').trim();
    if (!cleanPin) {
      setError('Por favor ingresá un PIN.');
      return;
    }

    const result = login(cleanPin);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin/precios', { replace: true });
      } else {
        navigate('/admin/cotizador', { replace: true });
      }
    } else {
      setError('PIN incorrecto. Intentá con 1234 (Admin) o 0000 (Vendedor).');
      setPin('');
    }
  };

  const handleGoToPanel = () => {
    if (role === 'admin') navigate('/admin/precios', { replace: true });
    else if (role === 'vendedor') navigate('/admin/cotizador', { replace: true });
    else logout();
  };

  return (
    <div className="min-h-screen bg-moana-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src="/fotos/LOGOS/logo.png" alt="Moana Turismo" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="font-display font-bold text-moana-blue text-2xl">Panel Interno</h1>
          <p className="text-moana-gray text-sm mt-1">Moana Turismo — Control & Ventas</p>
        </div>

        {/* If already authenticated, show quick status & switch button */}
        {isAuthenticated && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-3 text-center">
            <p className="text-xs font-semibold text-blue-900">
              Actualmente tenés sesión iniciada como: <span className="uppercase font-bold text-moana-orange">{role}</span>
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGoToPanel}
                className="flex-1 py-2 px-3 bg-moana-blue hover:bg-moana-blue-dark text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Ir a mi Panel</span> <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                title="Cerrar sesión e ingresar PIN distinto"
              >
                <LogOut size={14} /> <span>Salir</span>
              </button>
            </div>
          </div>
        )}

        {/* Login card */}
        <div className="card p-8 shadow-xl border border-moana-teal/20">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-moana-blue-pale rounded-2xl flex items-center justify-center shadow-inner">
              <Lock size={28} className="text-moana-blue" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field text-center block mb-2 font-bold text-moana-blue">Ingresá tu PIN de Acceso</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength="6"
                placeholder="• • • •"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="input-field text-center text-3xl font-bold tracking-widest py-3 border-2 border-moana-teal/30 focus:border-moana-orange focus:ring-2 focus:ring-moana-orange"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-600 text-xs text-center bg-red-50 border border-red-200 rounded-xl py-2.5 px-3 font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-lg"
            >
              <Lock size={18} />
              Ingresar al Panel
            </button>
          </form>

          <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
            <div className="text-center p-3 bg-moana-cream rounded-xl border border-gray-200/60">
              <Shield size={20} className="text-moana-blue mx-auto mb-1" />
              <p className="text-xs text-moana-blue font-bold">Admin (Flor)</p>
              <p className="text-xs text-moana-gray mt-0.5">PIN: <strong>1234</strong></p>
            </div>
            <div className="text-center p-3 bg-moana-cream rounded-xl border border-gray-200/60">
              <Calculator size={20} className="text-moana-orange mx-auto mb-1" />
              <p className="text-xs text-moana-orange font-bold">Vendedor</p>
              <p className="text-xs text-moana-gray mt-0.5">PIN: <strong>0000</strong></p>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link to="/" className="text-xs text-moana-gray hover:text-moana-blue font-semibold underline transition-colors">
            ← Volver a la Web Pública
          </Link>
        </div>
      </div>
    </div>
  );
}
