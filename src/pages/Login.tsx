import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <Logo size="lg" />
          </div>

          <div className="surface-card p-6 lg:p-8 animate-fade-up">
            <h1 className="text-2xl font-bold text-white tracking-tight">Iniciar sesión</h1>
            <p className="text-sm text-[#9CA6B2] mt-2">
              Ingresa a tu cuenta para continuar.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-fade-in">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">
                  Correo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-[#1E2832] space-y-2">
              <p className="text-sm text-[#9CA6B2] text-center">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-[#1677FF] font-medium hover:underline">
                  Crear cuenta
                </Link>
              </p>
              <p className="text-sm text-[#9CA6B2] text-center">
                <Link to="/login" className="text-[#5A6470] hover:text-[#9CA6B2] transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#9CA6B2] hover:text-white transition-colors">
              <ArrowLeft size={15} />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
