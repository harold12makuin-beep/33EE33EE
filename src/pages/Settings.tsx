import { useState } from 'react';
import { User as UserIcon, Shield, KeyRound, Bell, Coins, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import type { Currency } from '@/types';

const sections = [
  { id: 'perfil', label: 'Perfil', icon: UserIcon },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'contrasena', label: 'Contraseña', icon: KeyRound },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'moneda', label: 'Moneda', icon: Coins },
] as const;

export default function Settings() {
  const { profile } = useAuth();
  const [active, setActive] = useState<typeof sections[number]['id']>('perfil');
  const [currency, setCurrency] = useState<Currency>('COP');
  const [notifications, setNotifications] = useState({
    gains: true,
    updates: true,
    news: false,
  });
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Configuración</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Administra tu cuenta y preferencias.</p>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-4">
          {/* Section nav */}
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible animate-fade-up">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  active === id
                    ? 'bg-[#161F29] text-white border border-[#1E2832]'
                    : 'text-[#9CA6B2] hover:text-white hover:bg-[#161F29]'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Section content */}
          <div className="surface-card p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            {saved && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#35C759]/10 border border-[#35C759]/20 text-[#35C759] text-xs mb-4 animate-fade-in">
                <Check size={14} />
                Cambios guardados.
              </div>
            )}

            {active === 'perfil' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Información del perfil</h2>
                <div>
                  <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Nombre</label>
                  <input type="text" defaultValue={profile?.full_name} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Correo</label>
                  <input type="email" defaultValue={profile?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
                </div>
                <button onClick={showSaved} className="btn-primary">Guardar cambios</button>
              </div>
            )}

            {active === 'seguridad' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Seguridad</h2>
                <div className="flex items-center justify-between py-3 border-b border-[#1E2832]">
                  <div>
                    <p className="text-sm text-white font-medium">Verificación en dos pasos</p>
                    <p className="text-xs text-[#9CA6B2] mt-0.5">Protege tu cuenta con un código adicional.</p>
                  </div>
                  <button onClick={showSaved} className="btn-secondary">Activar</button>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm text-white font-medium">Sesiones activas</p>
                    <p className="text-xs text-[#9CA6B2] mt-0.5">Cierra sesiones en otros dispositivos.</p>
                  </div>
                  <button onClick={showSaved} className="btn-ghost">Ver sesiones</button>
                </div>
              </div>
            )}

            {active === 'contrasena' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Cambiar contraseña</h2>
                <div>
                  <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Contraseña actual</label>
                  <input type="password" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Nueva contraseña</label>
                  <input type="password" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Confirmar contraseña</label>
                  <input type="password" className="input-field" />
                </div>
                <button onClick={showSaved} className="btn-primary">Actualizar contraseña</button>
              </div>
            )}

            {active === 'notificaciones' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Notificaciones</h2>
                {[
                  { key: 'gains' as const, label: 'Ganancias simuladas', desc: 'Recibe un aviso cuando tus inversiones generen ganancias.' },
                  { key: 'updates' as const, label: 'Actualizaciones de empresas', desc: 'Noticias sobre las empresas en las que invertiste.' },
                  { key: 'news' as const, label: 'Nuevas oportunidades', desc: 'Te avisamos cuando haya nuevas empresas disponibles.' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-[#1E2832] last:border-0">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-white font-medium">{label}</p>
                      <p className="text-xs text-[#9CA6B2] mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => {
                        setNotifications({ ...notifications, [key]: !notifications[key] });
                        showSaved();
                      }}
                      className={`w-11 h-6 rounded-full transition-all duration-200 relative ${
                        notifications[key] ? 'bg-[#1677FF]' : 'bg-[#1E2832]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${
                          notifications[key] ? 'left-5.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {active === 'moneda' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-white">Moneda</h2>
                <p className="text-sm text-[#9CA6B2]">Selecciona tu moneda principal.</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['COP', 'USD'] as Currency[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setCurrency(c);
                        showSaved();
                      }}
                      className={`px-4 py-4 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                        currency === c
                          ? 'bg-[#1677FF] text-white border-[#1677FF]'
                          : 'bg-[#0B0F14] text-[#9CA6B2] border-[#1E2832] hover:border-[#2A3845] hover:text-white'
                      }`}
                    >
                      {c === 'COP' ? 'Peso colombiano (COP)' : 'Dólar (USD)'}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[#5A6470]">
                  USD se utiliza únicamente como conversión visual. COP es la moneda principal.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
