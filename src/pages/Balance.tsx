import { useEffect, useState, useCallback } from 'react';
import { Wallet, ArrowDownToLine, TrendingUp, Briefcase } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { fetchUserInvestments, processProfitUpdates } from '@/lib/api';
import { formatCOP, formatUSD, copToUSD } from '@/lib/format';
import type { Investment } from '@/types';

export default function Balance() {
  const { profile, wallet, refreshWallet } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    await processProfitUpdates();
    const inv = await fetchUserInvestments();
    setInvestments(inv);
    refreshWallet();
    setLoading(false);
  }, [refreshWallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const balance = wallet?.balance_cop || 0;
  const capitalInvested = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.principal_amount, 0);
  const simulatedGains = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => sum + i.accumulated_simulated_profit, 0);
  const totalValue = balance + capitalInvested;

  const stats = [
    { label: 'Saldo disponible', value: balance, icon: Wallet, color: 'text-white' },
    { label: 'Capital invertido', value: capitalInvested, icon: Briefcase, color: 'text-white' },
    { label: 'Ganancias simuladas', value: simulatedGains, icon: TrendingUp, color: 'text-[#35C759]', prefix: '+' },
    { label: 'Valor total', value: totalValue, icon: ArrowDownToLine, color: 'text-white' },
  ];

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Saldo</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Resumen financiero de tu cuenta, {firstName}.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color, prefix }, i) => (
            <div key={label} className="surface-card p-6 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-[#9CA6B2] uppercase tracking-wider">{label}</p>
                <Icon size={18} className="text-[#5A6470]" />
              </div>
              <p className={`text-2xl font-extrabold ${color} tracking-tight`}>
                {prefix || ''}{formatCOP(value)}
              </p>
              <p className="text-sm text-[#5A6470] mt-1">≈ {formatUSD(copToUSD(value))}</p>
            </div>
          ))}
        </div>

        <div className="surface-card p-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9CA6B2]">Moneda principal</span>
            <span className="text-white font-medium">COP</span>
          </div>
          <div className="h-px bg-[#1E2832] my-3" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#9CA6B2]">Conversión visual</span>
            <span className="text-white font-medium">USD (≈ 1 USD = 4,000 COP)</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
