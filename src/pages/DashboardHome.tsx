import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownToLine,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Trophy,
  Bell,
  X,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchCompanies, fetchUserInvestments, processProfitUpdates, fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api';
import { formatCOP, formatUSD, copToUSD, formatDate, timeUntil } from '@/lib/format';
import type { Company, Investment, Notification } from '@/types';

export default function DashboardHome() {
  const { profile, wallet, refreshWallet } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [topCompanies, setTopCompanies] = useState<Company[]>([]);
  const [opportunities, setOpportunities] = useState<Company[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    await processProfitUpdates();
    const [inv, comps, notifs] = await Promise.all([
      fetchUserInvestments(),
      fetchCompanies(),
      fetchNotifications(),
    ]);
    setInvestments(inv);
    setTopCompanies([...comps].sort((a, b) => b.simulated_daily_rate - a.simulated_daily_rate).slice(0, 10));
    setOpportunities(comps.slice(0, 3));
    setNotifications(notifs);
    refreshWallet();
    setLoading(false);
  }, [refreshWallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const balance = wallet?.balance_cop || 0;
  const capitalInvested = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.principal_amount, 0);
  const simulatedGains = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.accumulated_simulated_profit, 0);
  const totalValue = balance + capitalInvested;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1E2832] border-t-[#1677FF] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Hola, {firstName}
            </h1>
            <p className="text-sm text-[#9CA6B2] mt-1">Este es el resumen de tu actividad.</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative w-10 h-10 rounded-lg bg-[#111820] border border-[#1E2832] flex items-center justify-center hover:border-[#2A3845] transition-all"
            >
              <Bell size={18} className="text-[#9CA6B2]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#1677FF] text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto surface-card z-50 animate-slide-in">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2832]">
                  <span className="text-sm font-semibold text-white">Notificaciones</span>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-[#1677FF] hover:underline">
                      Marcar todas
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-[#9CA6B2] text-center">No tienes notificaciones.</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-[#1E2832] last:border-0 cursor-pointer hover:bg-[#161F29] transition-colors ${!n.read ? 'bg-[#1677FF]/5' : ''}`}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{n.title}</p>
                          <p className="text-xs text-[#9CA6B2] mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-[#5A6470] mt-1">{formatDate(n.created_at)}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#1677FF] shrink-0 mt-1.5" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main balance card */}
        <div className="surface-card p-6 lg:p-8 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-medium text-[#9CA6B2] uppercase tracking-wider">Saldo disponible</p>
              <p className="text-3xl lg:text-4xl font-extrabold text-white mt-2 tracking-tight">{formatCOP(balance)}</p>
              <p className="text-sm text-[#5A6470] mt-1">≈ {formatUSD(copToUSD(balance))}</p>
            </div>
            <div className="flex gap-3">
              <Link to="/deposit" className="btn-secondary">
                <ArrowDownToLine size={16} />
                Recargar
              </Link>
              <Link to="/invest" className="btn-primary">
                <TrendingUp size={16} />
                Invertir
              </Link>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="surface-card p-5 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#9CA6B2]">Capital invertido</p>
              <Briefcase size={16} className="text-[#5A6470]" />
            </div>
            <p className="text-xl font-bold text-white">{formatCOP(capitalInvested)}</p>
          </div>
          <div className="surface-card p-5 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#9CA6B2]">Ganancias simuladas</p>
              <TrendingUp size={16} className="text-[#35C759]" />
            </div>
            <p className="text-xl font-bold text-[#35C759]">+{formatCOP(simulatedGains)}</p>
          </div>
          <div className="surface-card p-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#9CA6B2]">Valor total</p>
            </div>
            <p className="text-xl font-bold text-white">{formatCOP(totalValue)}</p>
          </div>
        </div>

        {/* My investments */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Mis inversiones</h2>
            <Link to="/investments" className="text-sm text-[#1677FF] font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          {investments.filter((i) => i.status === 'active').length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-sm text-[#9CA6B2] mb-4">Tu portafolio está esperando su primera inversión.</p>
              <Link to="/invest" className="btn-primary">Explorar empresas</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {investments.filter((i) => i.status === 'active').slice(0, 3).map((inv, i) => (
                <div
                  key={inv.id}
                  className="surface-card p-4 flex items-center gap-4 hover:border-[#2A3845] transition-all duration-200 animate-fade-up"
                  style={{ animationDelay: `${0.25 + i * 0.05}s` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-xs shrink-0">
                    {inv.company?.name?.slice(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{inv.company?.name}</p>
                    <p className="text-xs text-[#9CA6B2] mt-0.5">Capital: {formatCOP(inv.principal_amount)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[#35C759]">+{formatCOP(inv.accumulated_simulated_profit)}</p>
                    <p className="text-xs text-[#5A6470] mt-0.5">{timeUntil(inv.next_profit_update)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Opportunities */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Oportunidades destacadas</h2>
            <Link to="/invest" className="text-sm text-[#1677FF] font-medium hover:underline">Ver todas</Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {opportunities.map((company, i) => (
              <div
                key={company.id}
                className="surface-card p-5 hover:border-[#2A3845] transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${0.35 + i * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-xs shrink-0">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{company.name}</p>
                    <p className="text-xs text-[#9CA6B2]">{company.country} · {company.sector}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-[#35C759]">+{company.simulated_daily_rate}%/día</span>
                  <span className="text-xs text-[#5A6470]">{company.risk_level}</span>
                </div>
                <Link to={`/company/${company.id}`} className="btn-secondary w-full">Ver empresa</Link>
              </div>
            ))}
          </div>
        </div>

        {/* Top 10 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-[#1677FF]" />
            <h2 className="text-lg font-bold text-white">Top 10 del simulador</h2>
          </div>
          <div className="surface-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E2832]">
                    <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">#</th>
                    <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Empresa</th>
                    <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3">Rendimiento</th>
                    <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Riesgo</th>
                    <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden md:table-cell">Desde</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {topCompanies.map((company, i) => (
                    <tr key={company.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
                      <td className="px-4 py-3 text-sm font-bold text-[#5A6470]">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-[10px] shrink-0">
                            {company.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{company.name}</p>
                            <p className="text-xs text-[#5A6470]">{company.sector}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-semibold text-[#35C759]">+{company.simulated_daily_rate}%/día</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <span className="text-sm text-[#9CA6B2]">{company.risk_level}</span>
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className="text-sm text-[#9CA6B2]">{formatCOP(company.minimum_investment)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link to={`/company/${company.id}`} className="inline-flex items-center text-[#1677FF] hover:text-[#0E63D6] transition-colors">
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-[#5A6470] mt-3">
            Rendimiento SIMULADO. No representa una recomendación financiera real.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
