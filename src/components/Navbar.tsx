import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

const navLinks = [
  { label: 'Inicio', href: '/#inicio' },
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Empresas', href: '/#empresas' },
  { label: 'Beneficios', href: '/#beneficios' },
  { label: 'FAQ', href: '/#faq' },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#0B0F14]/90 backdrop-blur-md border-b border-[#1E2832]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-ghost">
                <UserIcon size={16} />
                Mi cuenta
              </Link>
              <button onClick={handleSignOut} className="btn-ghost">
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Iniciar sesión
              </Link>
              <Link to="/register" className="btn-primary">
                Crear cuenta
              </Link>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden bg-[#0B0F14] border-b border-[#1E2832] animate-slide-in">
          <div className="px-5 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-[#9CA6B2] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="h-px bg-[#1E2832] my-2" />
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full mt-2"
                >
                  Mi cuenta
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="btn-ghost w-full mt-2"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full mt-2"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full mt-2"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
