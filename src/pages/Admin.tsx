import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users,
  Building2,
  TrendingUp,
  Wallet,
  Check,
  X,
  Clock,
  ArrowLeftRight,
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  adminFetchStats,
  adminFetchAllProfiles,
  adminFetchAllInvestments,
  adminFetchAllTransactions,
  adminFetchAllWithdrawals,
  adminApproveDeposit,
} from '@/lib/api';
import { formatCOP, formatDate } from '@/lib/format';

type Tab = 'overview' | 'users' | 'companies' | 'investments' | 'transactions' | 'withdrawals';

const tabs = [
  { id: 'overview' as Tab, label: 'Resumen', icon: TrendingUp },
  { id: 'users' as Tab, label: 'Usuarios', icon: Users },
  { id: 'companies' as Tab, label: 'Empresas', icon: Building2 },
  { id: 'investments' as Tab, label: 'Inversiones', icon: ArrowLeftRight },
  { id: 'transactions' as Tab, label: 'Movimientos', icon: Wallet },
  { id: 'withdrawals' as Tab, label: 'Retiros', icon: Clock },
];

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const loadTabData = useCallback(async (t: Tab) => {
    setDataLoading(true);
    try {
      if (t === 'overview') {
        const s = await adminFetchStats();
        setStats(s);
      } else if (t === 'users') {
        const p = await adminFetchAllProfiles();
        setProfiles(p);
      } else if (t === 'investments') {
        const i = await adminFetchAllInvestments();
        setInvestments(i);
      } else if (t === 'transactions') {
        const tx = await adminFetchAllTransactions();
        setTransactions(tx);
      } else if (t === 'withdrawals') {
        const w = await adminFetchAllWithdrawals();
        setWithdrawals(w);
      }
    } catch (e) {
      console.error(e);
    }
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadTabData(tab);
  }, [tab, isAdmin, loadTabData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1E2832] border-t-[#1677FF] rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleApprove = async (txId: string) => {
    const { error } = await adminApproveDeposit(txId);
    if (!error) {
      loadTabData('transactions');
    }
  };

  const statCards = stats ? [
    { label: 'Usuarios registrados', value: stats.userCount, icon: Users, color: 'text-white' },
    { label: 'Inversiones activas', value: stats.activeInvestments, icon: TrendingUp, color: 'text-white' },
    { label: 'Capital simulado', value: formatCOP(stats.totalCapital), icon: Wallet, color: 'text-white' },
    { label: 'Ganancias simuladas', value: `+${formatCOP(stats.totalGains)}`, icon: TrendingUp, color: 'text-[#35C759]' },
    { label: 'Empresas', value: stats.companyCount, icon: Building2, color: 'text-white' },
  ] : [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Administración</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Panel de gestión de NEXORA.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto animate-fade-up">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border whitespace-nowrap transition-all duration-200 ${
                tab === id
                  ? 'bg-[#1677FF] text-white border-[#1677FF]'
                  : 'bg-[#111820] text-[#9CA6B2] border-[#1E2832] hover:text-white hover:border-[#2A3845]'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1E2832] border-t-[#1677FF] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Overview */}
            {tab === 'overview' && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-up">
                {statCards.map(({ label, value, icon: Icon, color }, i) => (
                  <div key={label} className="surface-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-[#9CA6B2]">{label}</p>
                      <Icon size={16} className="text-[#5A6470]" />
                    </div>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Users */}
            {tab === 'users' && (
              <div className="surface-card overflow-hidden animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2832]">
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Nombre</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Correo</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Rol</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p) => (
                        <tr key={p.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
                          <td className="px-4 py-3 text-sm text-white font-medium">{p.full_name}</td>
                          <td className="px-4 py-3 text-sm text-[#9CA6B2]">{p.email}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className={`text-xs font-medium ${p.role === 'admin' ? 'text-[#1677FF]' : 'text-[#9CA6B2]'}`}>
                              {p.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-[#9CA6B2] hidden sm:table-cell">
                            {formatDate(p.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Companies */}
            {tab === 'companies' && (
              <div className="surface-card overflow-hidden animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2832]">
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Empresa</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Sector</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3">Rendimiento</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Riesgo</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden md:table-cell">Mín.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <CompaniesRows />
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Investments */}
            {tab === 'investments' && (
              <div className="surface-card overflow-hidden animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2832]">
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Usuario</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Empresa</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3">Capital</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3">Ganancia</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investments.map((inv) => (
                        <tr key={inv.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
                          <td className="px-4 py-3 text-sm text-white">{inv.profile?.full_name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#9CA6B2] hidden sm:table-cell">{inv.company?.name || '—'}</td>
                          <td className="px-4 py-3 text-right text-sm text-white">{formatCOP(inv.principal_amount)}</td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-[#35C759]">+{formatCOP(inv.accumulated_simulated_profit)}</td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs text-[#9CA6B2]">{inv.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Transactions */}
            {tab === 'transactions' && (
              <div className="surface-card overflow-hidden animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2832]">
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Usuario</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Tipo</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3">Monto</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Estado</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Fecha</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
                          <td className="px-4 py-3 text-sm text-white">{tx.profile?.full_name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-[#9CA6B2]">{tx.type}</td>
                          <td className="px-4 py-3 text-right text-sm text-white">{formatCOP(tx.amount)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${
                              tx.status === 'approved' ? 'text-[#35C759]' :
                              tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>{tx.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-[#9CA6B2] hidden sm:table-cell">{formatDate(tx.created_at)}</td>
                          <td className="px-4 py-3 text-right">
                            {tx.type === 'deposit' && tx.status === 'pending' && (
                              <button
                                onClick={() => handleApprove(tx.id)}
                                className="inline-flex items-center gap-1 text-xs text-[#35C759] hover:underline"
                              >
                                <Check size={14} />
                                Aprobar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Withdrawals */}
            {tab === 'withdrawals' && (
              <div className="surface-card overflow-hidden animate-fade-up">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1E2832]">
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Usuario</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3">Monto</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Método</th>
                        <th className="text-left text-xs font-medium text-[#9CA6B2] px-4 py-3">Estado</th>
                        <th className="text-right text-xs font-medium text-[#9CA6B2] px-4 py-3 hidden sm:table-cell">Solicitado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
                          <td className="px-4 py-3 text-sm text-white">{w.profile?.full_name || '—'}</td>
                          <td className="px-4 py-3 text-right text-sm text-white">{formatCOP(w.amount)}</td>
                          <td className="px-4 py-3 text-sm text-[#9CA6B2]">{w.method}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${
                              w.status === 'completed' ? 'text-[#35C759]' :
                              w.status === 'pending' ? 'text-yellow-400' :
                              w.status === 'processing' ? 'text-[#1677FF]' : 'text-red-400'
                            }`}>{w.status}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-[#9CA6B2] hidden sm:table-cell">{formatDate(w.requested_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

// Inline component to load companies for admin
import { fetchCompanies } from '@/lib/api';
import { useEffect, useState } from 'react';
import type { Company } from '@/types';

function CompaniesRows() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies().then((data) => {
      setCompanies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <tbody>
      <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-[#9CA6B2]">Cargando...</td></tr>
    </tbody>
  );

  return (
    <>
      {companies.map((c) => (
        <tr key={c.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
          <td className="px-4 py-3 text-sm text-white font-medium">{c.name}</td>
          <td className="px-4 py-3 text-sm text-[#9CA6B2] hidden sm:table-cell">{c.sector}</td>
          <td className="px-4 py-3 text-right text-sm font-semibold text-[#35C759]">+{c.simulated_daily_rate}%/día</td>
          <td className="px-4 py-3 text-sm text-[#9CA6B2] hidden sm:table-cell">{c.risk_level}</td>
          <td className="px-4 py-3 text-right text-sm text-[#9CA6B2] hidden md:table-cell">{formatCOP(c.minimum_investment)}</td>
        </tr>
      ))}
    </>
  );
}
