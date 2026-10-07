import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, RefreshCw, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchUserInvestments, processProfitUpdates, createReinvestment, fetchCompanies, fetchCompanyPackages } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCOP, formatDate, timeUntil } from '@/lib/format';
import type { Investment, Company, InvestmentPackage } from '@/types';

export default function Investments() {
  const { refreshWallet } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reinvestTarget, setReinvestTarget] = useState<Investment | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<InvestmentPackage | null>(null);
  const [reinvesting, setReinvesting] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    await processProfitUpdates();
    const [inv, comps] = await Promise.all([
      fetchUserInvestments(),
      fetchCompanies(),
    ]);
    setInvestments(inv);
    setCompanies(comps);
    refreshWallet();
    setLoading(false);
  }, [refreshWallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectCompany = async (company: Company) => {
    setSelectedCompany(company);
    setSelectedPkg(null);
    const pkgs = await fetchCompanyPackages(company.id);
    setPackages(pkgs);
  };

  const handleReinvest = async () => {
    if (!reinvestTarget || !selectedPkg || !selectedCompany) return;
    setReinvesting(true);
    setError('');
    const { error } = await createReinvestment(reinvestTarget.id, selectedPkg.id, selectedCompany.id);
    if (error) {
      setError(error);
      setReinvesting(false);
    } else {
      await refreshWallet();
      setReinvesting(false);
      setReinvestTarget(null);
      setSelectedCompany(null);
      setSelectedPkg(null);
      loadData();
    }
  };

  const activeInvestments = investments.filter((i) => i.status === 'active');

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
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Mis inversiones</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Seguimiento de tus inversiones simuladas.</p>
        </div>

        {activeInvestments.length === 0 && investments.filter((i) => i.status !== 'active').length === 0 ? (
          <div className="surface-card p-12 text-center animate-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-[#1677FF]/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-[#1677FF]" />
            </div>
            <h2 className="text-base font-semibold text-white mb-2">Tu portafolio está esperando su primera inversión.</h2>
            <p className="text-sm text-[#9CA6B2] mb-6">Explora las empresas disponibles y elige una para empezar.</p>
            <Link to="/invest" className="btn-primary">Explorar empresas</Link>
          </div>
        ) : (
          <>
            {activeInvestments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-[#9CA6B2] uppercase tracking-wider mb-3">Activas</h2>
                <div className="space-y-3">
                  {activeInvestments.map((inv, i) => (
                    <div
                      key={inv.id}
                      className="surface-card p-4 lg:p-5 hover:border-[#2A3845] transition-all duration-200 animate-fade-up"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-xs shrink-0">
                            {inv.company?.name?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{inv.company?.name}</p>
                            <p className="text-xs text-[#9CA6B2] mt-0.5">
                              Capital: {formatCOP(inv.principal_amount)} · {formatDate(inv.started_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 lg:gap-8">
                          <div className="text-right">
                            <p className="text-xs text-[#5A6470]">Ganancia simulada</p>
                            <p className="text-sm font-semibold text-[#35C759]">+{formatCOP(inv.accumulated_simulated_profit)}</p>
                          </div>
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-[#5A6470]">Estado</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#35C759]/10 text-[#35C759]">
                              {inv.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[#5A6470]">Próxima actualización</p>
                            <p className="text-sm text-white mt-0.5">{timeUntil(inv.next_profit_update)}</p>
                          </div>
                        </div>

                        {inv.accumulated_simulated_profit > 0 && (
                          <button
                            onClick={() => setReinvestTarget(inv)}
                            className="btn-secondary shrink-0"
                          >
                            <RefreshCw size={14} />
                            Reinvertir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {investments.filter((i) => i.status !== 'active').length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#9CA6B2] uppercase tracking-wider mb-3">Historial</h2>
                <div className="space-y-3">
                  {investments.filter((i) => i.status !== 'active').map((inv) => (
                    <div key={inv.id} className="surface-card p-4 flex items-center gap-4 opacity-70">
                      <div className="w-10 h-10 rounded-lg bg-[#161F29] flex items-center justify-center text-[#9CA6B2] font-bold text-xs shrink-0">
                        {inv.company?.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{inv.company?.name}</p>
                        <p className="text-xs text-[#9CA6B2] mt-0.5">Capital: {formatCOP(inv.principal_amount)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#9CA6B2]">{inv.status}</p>
                        <p className="text-xs text-[#5A6470]">{formatDate(inv.started_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Reinvestment modal */}
        {reinvestTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={() => setReinvestTarget(null)}>
            <div className="surface-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Reinvertir ganancias</h2>
                <button onClick={() => setReinvestTarget(null)} className="text-[#9CA6B2] hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-[#0B0F14] rounded-lg p-4 border border-[#1E2832] mb-4">
                <p className="text-xs text-[#9CA6B2]">Ganancia acumulada de {reinvestTarget.company?.name}</p>
                <p className="text-xl font-bold text-[#35C759] mt-1">+{formatCOP(reinvestTarget.accumulated_simulated_profit)}</p>
              </div>

              {error && (
                <p className="text-xs text-red-400 mb-3">{error}</p>
              )}

              <label className="block text-xs font-medium text-[#9CA6B2] mb-2">Elegir empresa</label>
              <select
                value={selectedCompany?.id || ''}
                onChange={(e) => {
                  const c = companies.find((c) => c.id === e.target.value);
                  if (c) handleSelectCompany(c);
                }}
                className="input-field cursor-pointer mb-4"
              >
                <option value="">Selecciona...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.sector}</option>
                ))}
              </select>

              {packages.length > 0 && (
                <>
                  <label className="block text-xs font-medium text-[#9CA6B2] mb-2">Elegir paquete</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {packages
                      .filter((p) => p.investment_amount <= reinvestTarget.accumulated_simulated_profit)
                      .map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPkg(pkg)}
                          className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                            selectedPkg?.id === pkg.id
                              ? 'bg-[#1677FF] text-white border-[#1677FF]'
                              : 'bg-[#0B0F14] text-[#9CA6B2] border-[#1E2832] hover:border-[#2A3845]'
                          }`}
                        >
                          {formatCOP(pkg.investment_amount)}
                          <p className="text-[10px] font-normal mt-0.5">+{formatCOP(pkg.simulated_daily_profit)}/día</p>
                        </button>
                      ))}
                  </div>
                  {packages.filter((p) => p.investment_amount <= reinvestTarget.accumulated_simulated_profit).length === 0 && (
                    <p className="text-xs text-[#9CA6B2] mb-4">
                      Las ganancias acumuladas no alcanzan para ningún paquete de esta empresa.
                    </p>
                  )}
                </>
              )}

              <button
                onClick={handleReinvest}
                disabled={!selectedPkg || !selectedCompany || reinvesting}
                className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {reinvesting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Confirmar reinversión'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
