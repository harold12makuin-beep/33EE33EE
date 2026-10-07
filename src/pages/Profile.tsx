import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Calendar, Fingerprint, Edit2, KeyRound, LogOut, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { fetchUserInvestments, processProfitUpdates } from '@/lib/api';
import { formatCOP, formatDate } from '@/lib/format';
import type { Investment } from '@/types';

export default function Profile() {
  const { profile, user, signOut, refreshProfile, refreshWallet } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    processProfitUpdates().then(() => {
      fetchUserInvestments().then(setInvestments);
      refreshWallet();
    });
  }, [refreshWallet]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', user?.id);
    if (!error) {
      await refreshProfile();
      setMessage('Perfil actualizado.');
      setEditing(false);
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const totalInvested = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.principal_amount, 0);
  const totalGains = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.accumulated_simulated_profit, 0);
  const numInvestments = investments.filter((i) => i.status === 'active').length;

  const stats = [
    { label: 'Total invertido', value: formatCOP(totalInvested), color: 'text-white' },
    { label: 'Ganancias simuladas', value: `+${formatCOP(totalGains)}`, color: 'text-[#35C759]' },
    { label: 'Núm. de inversiones', value: String(numInvestments), color: 'text-white' },
  ];

  const info = [
    { icon: UserIcon, label: 'Nombre', value: profile?.full_name || '—' },
    { icon: Mail, label: 'Correo', value: profile?.email || user?.email || '—' },
    { icon: Calendar, label: 'Fecha de registro', value: profile?.created_at ? formatDate(profile.created_at) : '—' },
    { icon: Fingerprint, label: 'ID', value: user?.id ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}` : '—' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Perfil</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Información de tu cuenta y estadísticas.</p>
        </div>

        {message && (
          <div className="surface-card p-3 mb-4 flex items-center gap-2 text-sm text-[#35C759] animate-fade-in">
            <Check size={16} />
            {message}
          </div>
        )}

        <div className="surface-card p-6 mb-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Nombre completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="btn-ghost">Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-4">
                {info.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#161F29] flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[#9CA6B2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#5A6470]">{label}</p>
                      <p className="text-sm text-white font-medium truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-[#1E2832]">
                <button onClick={() => setEditing(true)} className="btn-secondary">
                  <Edit2 size={15} />
                  Editar perfil
                </button>
                <button onClick={() => navigate('/settings')} className="btn-ghost">
                  <KeyRound size={15} />
                  Cambiar contraseña
                </button>
                <button onClick={handleSignOut} className="btn-ghost text-red-400 hover:text-red-300">
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {stats.map(({ label, value, color }) => (
            <div key={label} className="surface-card p-4">
              <p className="text-xs text-[#9CA6B2]">{label}</p>
              <p className={`text-sm lg:text-base font-bold ${color} mt-1`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
