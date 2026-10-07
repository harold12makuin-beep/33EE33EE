import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, Shield, Globe, AlertCircle, Check } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchCompanyById, fetchCompanyPackages, createInvestment } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCOP } from '@/lib/format';
import type { Company, InvestmentPackage } from '@/types';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [selectedPkg, setSelectedPkg] = useState<InvestmentPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchCompanyById(id), fetchCompanyPackages(id)])
      .then(([comp, pkgs]) => {
        setCompany(comp);
        setPackages(pkgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const balance = wallet?.balance_cop || 0;

  const handleInvest = async () => {
    if (!selectedPkg || !company) return;
    setError('');
    setInvesting(true);

    const { error } = await createInvestment(selectedPkg.id, company.id);
    if (error) {
      setError(error);
      setInvesting(false);
    } else {
      await refreshWallet();
      setSuccess(true);
      setInvesting(false);
      setTimeout(() => navigate('/investments'), 2000);
    }
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

  if (!company) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="surface-card p-12 text-center">
            <p className="text-sm text-[#9CA6B2]">Empresa no encontrada.</p>
            <Link to="/invest" className="btn-primary mt-4">Volver a explorar</Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto pt-12">
          <div className="surface-card p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#35C759]/10 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#35C759]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Inversión creada</h2>
            <p className="text-sm text-[#9CA6B2]">Redirigiendo a tus inversiones...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-[#9CA6B2] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Volver
        </button>

        {/* Company header */}
        <div className="surface-card p-6 lg:p-8 mb-6 animate-fade-up">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-xl shrink-0">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA6B2]">
                  <Globe size={13} />
                  {company.country}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA6B2]">
                  <TrendingUp size={13} />
                  {company.sector}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA6B2]">
                  <Shield size={13} />
                  Riesgo {company.risk_level}
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-[#9CA6B2] leading-relaxed">{company.description}</p>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#1E2832]">
            <div>
              <p className="text-xs text-[#5A6470]">Rendimiento SIMULADO</p>
              <p className="text-lg font-bold text-[#35C759] mt-1">+{company.simulated_daily_rate}%/día</p>
            </div>
            <div>
              <p className="text-xs text-[#5A6470]">Riesgo simulado</p>
              <p className="text-lg font-bold text-white mt-1">{company.risk_level}</p>
            </div>
            <div>
              <p className="text-xs text-[#5A6470]">Inversión mínima</p>
              <p className="text-lg font-bold text-white mt-1">{formatCOP(company.minimum_investment)}</p>
            </div>
          </div>
        </div>

        {/* Investment packages */}
        <div className="surface-card p-6 lg:p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-lg font-bold text-white mb-1">Elige cuánto quieres simular</h2>
          <p className="text-sm text-[#9CA6B2] mb-4">
            Saldo disponible: <span className="text-white font-medium">{formatCOP(balance)}</span>
          </p>

          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2.5 mb-6">
            {packages.map((pkg) => {
              const canAfford = balance >= pkg.investment_amount;
              const isSelected = selectedPkg?.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => canAfford ? setSelectedPkg(pkg) : null}
                  disabled={!canAfford}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#1677FF] text-white border-[#1677FF]'
                      : canAfford
                        ? 'bg-[#0B0F14] text-[#9CA6B2] border-[#1E2832] hover:border-[#2A3845] hover:text-white'
                        : 'bg-[#0B0F14] text-[#3A4452] border-[#1E2832] cursor-not-allowed opacity-50'
                  }`}
                >
                  {formatCOP(pkg.investment_amount)}
                  <p className="text-[10px] mt-1 font-normal">+{formatCOP(pkg.simulated_daily_profit)}/día</p>
                </button>
              );
            })}
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {selectedPkg && (
            <div className="bg-[#0B0F14] rounded-xl p-5 border border-[#1E2832] animate-fade-in">
              <div className="grid sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <p className="text-xs text-[#9CA6B2]">Tu inversión</p>
                  <p className="text-xl font-bold text-white mt-1">{formatCOP(selectedPkg.investment_amount)} COP</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA6B2]">Ganancia diaria simulada</p>
                  <p className="text-xl font-bold text-[#35C759] mt-1">+{formatCOP(selectedPkg.simulated_daily_profit)} COP</p>
                </div>
                <div>
                  <p className="text-xs text-[#9CA6B2]">Después de 24 horas</p>
                  <p className="text-xl font-bold text-white mt-1">
                    {formatCOP(selectedPkg.investment_amount + selectedPkg.simulated_daily_profit)} COP
                  </p>
                </div>
              </div>
              <button
                onClick={handleInvest}
                disabled={investing}
                className="btn-primary w-full"
              >
                {investing ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Simular inversión
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-[#5A6470] mt-4">
          Rendimiento SIMULADO con fines educativos. Esta empresa es una referencia académica y no representa una oferta real de inversión.
        </p>
      </div>
    </DashboardLayout>
  );
}
