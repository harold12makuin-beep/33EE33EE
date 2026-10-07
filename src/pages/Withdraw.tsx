import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpFromLine, Check, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { requestWithdrawal } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCOP, formatUSD, copToUSD } from '@/lib/format';

const methods = [
  { id: 'nequi', name: 'Nequi' },
  { id: 'daviplata', name: 'Daviplata' },
  { id: 'banco', name: 'Cuenta bancaria' },
];

export default function Withdraw() {
  const navigate = useNavigate();
  const { wallet, refreshWallet } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const balance = wallet?.balance_cop || 0;
  const numAmount = Number(amount);
  const valid = numAmount > 0 && numAmount <= balance && method;

  const handleWithdraw = async () => {
    if (!valid) return;
    setError('');
    setLoading(true);

    const { error } = await requestWithdrawal(numAmount, method);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      await refreshWallet();
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate('/transactions'), 2500);
    }
  };

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto pt-12">
          <div className="surface-card p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#35C759]/10 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#35C759]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Retiro solicitado</h2>
            <p className="text-sm text-[#9CA6B2]">
              Tu retiro de {formatCOP(numAmount)} está en proceso.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Retirar</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Simula un retiro de tu saldo.</p>
        </div>

        <div className="surface-card p-6 mb-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#9CA6B2] uppercase tracking-wider">Saldo disponible</p>
            <p className="text-lg font-bold text-white">{formatCOP(balance)}</p>
          </div>
          <p className="text-xs text-[#5A6470] text-right mt-0.5">≈ {formatUSD(copToUSD(balance))}</p>
        </div>

        <div className="surface-card p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="mb-5">
            <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Monto a retirar</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="input-field"
            />
            {numAmount > balance && (
              <p className="text-xs text-red-400 mt-1.5">El monto excede tu saldo disponible.</p>
            )}
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[#9CA6B2] mb-2">Método de retiro</label>
            <div className="space-y-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    method === m.id
                      ? 'bg-[#1677FF]/10 text-[#1677FF] border-[#1677FF]'
                      : 'bg-[#0B0F14] text-[#9CA6B2] border-[#1E2832] hover:border-[#2A3845] hover:text-white'
                  }`}
                >
                  {m.name}
                  <span className={`w-4 h-4 rounded-full border-2 ${method === m.id ? 'border-[#1677FF] bg-[#1677FF]' : 'border-[#2A3845]'}`} />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 animate-fade-in">
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={!valid || loading}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ArrowUpFromLine size={16} />
                Retirar {numAmount > 0 ? formatCOP(numAmount) : ''}
              </>
            )}
          </button>

          <p className="text-xs text-[#5A6470] mt-4">
            Los retiros son simulados. No se realizan transferencias reales.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
