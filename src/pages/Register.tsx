import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Check } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (fullName.trim().length < 2) return 'Ingresa tu nombre completo.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingresa un correo válido.';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
    if (password !== confirmPassword) return 'Las contraseñas no coinciden.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName.trim());
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const requirements = [
    { label: 'Al menos 6 caracteres', met: password.length >= 6 },
    { label: 'Las contraseñas coinciden', met: password.length > 0 && password === confirmPassword },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center">
            <Logo size="lg" />
          </div>

          <div className="surface-card p-6 lg:p-8 animate-fade-up">
            <h1 className="text-2xl font-bold text-white tracking-tight">Crear cuenta</h1>
            <p className="text-sm text-[#9CA6B2] mt-2">
              Regístrate y empieza a simular inversiones.
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
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="input-field"
                  required
                />
              </div>

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

              <div>
                <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                />
              </div>

              {password.length > 0 && (
                <div className="space-y-1.5 px-1">
                  {requirements.map(({ label, met }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <Check
                        size={13}
                        className={met ? 'text-[#35C759]' : 'text-[#3A4452]'}
                      />
                      <span className={met ? 'text-[#9CA6B2]' : 'text-[#5A6470]'}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            <div className="mt-5 pt-5 border-t border-[#1E2832]">
              <p className="text-sm text-[#9CA6B2] text-center">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-[#1677FF] font-medium hover:underline">
                  Iniciar sesión
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
