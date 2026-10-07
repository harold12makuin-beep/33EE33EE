import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchCompanies } from '@/lib/api';
import { formatCOP } from '@/lib/format';
import type { Company } from '@/types';

export default function Invest() {
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('');
  const [country, setCountry] = useState('');
  const [risk, setRisk] = useState('');
  const [returnRange, setReturnRange] = useState('');
  const [minInv, setMinInv] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies().then((data) => {
      setCompanies(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const sectors = useMemo(() => [...new Set(companies.map((c) => c.sector))].sort(), [companies]);
  const countries = useMemo(() => [...new Set(companies.map((c) => c.country))].sort(), [companies]);
  const risks = ['Bajo', 'Medio', 'Alto'];
  const returnRanges = ['0-12%', '12-15%', '15-20%'];
  const minInvestments = [10000, 20000, 50000];

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (sector && c.sector !== sector) return false;
      if (country && c.country !== country) return false;
      if (risk && c.risk_level !== risk) return false;
      if (returnRange) {
        const [min, max] = returnRange.replace('%', '').split('-').map(Number);
        if (c.simulated_daily_rate < min || c.simulated_daily_rate > max) return false;
      }
      if (minInv && c.minimum_investment > Number(minInv)) return false;
      return true;
    });
  }, [companies, search, sector, country, risk, returnRange, minInv]);

  const hasFilters = sector || country || risk || returnRange || minInv;

  const clearFilters = () => {
    setSector('');
    setCountry('');
    setRisk('');
    setReturnRange('');
    setMinInv('');
  };

  const FilterSelect = ({
    label, value, onChange, options,
  }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field cursor-pointer">
        <option value="">Todos</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Explorar oportunidades</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Filtra por sector, país, rendimiento y más.</p>
        </div>

        <div className="flex gap-3 mb-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A6470]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar empresa..."
              className="input-field pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters || hasFilters ? 'border-[#1677FF] text-[#1677FF]' : ''}`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>

        {showFilters && (
          <div className="surface-card p-5 mb-4 animate-slide-in">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <FilterSelect label="Sector" value={sector} onChange={setSector} options={sectors} />
              <FilterSelect label="País" value={country} onChange={setCountry} options={countries} />
              <FilterSelect label="Riesgo" value={risk} onChange={setRisk} options={risks} />
              <FilterSelect label="Rendimiento" value={returnRange} onChange={setReturnRange} options={returnRanges} />
              <FilterSelect label="Inversión mín." value={minInv} onChange={setMinInv} options={minInvestments.map(String)} />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#9CA6B2] hover:text-white transition-colors">
                <X size={14} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        <p className="text-sm text-[#9CA6B2] mb-4">
          {loading ? 'Cargando...' : `${filtered.length} ${filtered.length === 1 ? 'empresa' : 'empresas'}`}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1E2832] border-t-[#1677FF] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-card p-12 text-center animate-fade-in">
            <p className="text-sm text-[#9CA6B2]">No se encontraron empresas con esos filtros.</p>
            <button onClick={clearFilters} className="btn-secondary mt-4">Limpiar filtros</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company, i) => (
              <div
                key={company.id}
                className="surface-card p-5 hover:border-[#2A3845] transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-sm shrink-0">
                    {company.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{company.name}</h3>
                    <p className="text-xs text-[#9CA6B2] mt-0.5">{company.country} · {company.sector}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-[#5A6470]">Rendimiento</p>
                    <p className="text-sm font-semibold text-[#35C759] mt-0.5">+{company.simulated_daily_rate}%/día</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6470]">Riesgo</p>
                    <p className="text-sm font-medium text-white mt-0.5">{company.risk_level}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#5A6470]">Desde</p>
                    <p className="text-sm font-medium text-white mt-0.5">{formatCOP(company.minimum_investment)}</p>
                  </div>
                </div>
                <Link to={`/company/${company.id}`} className="btn-secondary w-full">Ver empresa</Link>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[#5A6470] mt-4">
          Rendimiento SIMULADO. Las empresas listadas son referencias académicas y no representan ofertas reales de inversión.
        </p>
      </div>
    </DashboardLayout>
  );
}
