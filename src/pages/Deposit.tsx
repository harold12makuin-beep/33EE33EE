import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownToLine, Check, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { createDeposit } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCOP } from '@/lib/format';
import { DEPOSIT_PRESETS } from '@/types';

const methods = [
  { id: 'wompi', name: 'Wompi' },
  { id: 'pse', name: 'PSE' },
  { id: 'nequi', name: 'Nequi' },
  { id: 'daviplata', name: 'Daviplata' },
  { id: 'tarjeta', name: 'Tarjeta' },
];

export default function Deposit() {
  const navigate = useNavigate();
  const { refreshWallet } = useAuth();
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [method, setMethod] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const finalAmount = customAmount ? Number(customAmount) : amount;

  const handleDeposit = async () => {
    if (!finalAmount || !method) return;
    setError('');
    setLoading(true);

    const { error } = await createDeposit(finalAmount, method);
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
            <div className="w-16 h-16 rounded-full bg-[#1677FF]/10 flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-[#1677FF]" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Recarga en proceso</h2>
            <p className="text-sm text-[#9CA6B2]">
              Tu recarga de {formatCOP(finalAmount || 0)} está pendiente de confirmación.
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
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Recargar</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Simula una recarga en tu cuenta.</p>
        </div>

        <div className="surface-card p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <label className="block text-xs font-medium text-[#9CA6B2] mb-2">Selecciona un monto</label>
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {DEPOSIT_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => { setAmount(preset); setCustomAmount(''); }}
                className={`px-3 py-3 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                  amount === preset && !customAmount
                    ? 'bg-[#1677FF] text-white border-[#1677FF]'
                    : 'bg-[#0B0F14] text-[#9CA6B2] border-[#1E2832] hover:border-[#2A3845] hover:text-white'
                }`}
              >
                {formatCOP(preset)}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[#9CA6B2] mb-1.5">Otro valor</label>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setAmount(null); }}
              placeholder="Ingresa un monto"
              className="input-field"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-medium text-[#9CA6B2] mb-2">Método de pago</label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-200 ${
                    method === m.id
                      ? 'bg-[#1677FF]/10 text-[#1677FF] border-[#1677FF]'
                      : 'bg-[#0B0F14] text-[#9CA6B2] border-[#1E2832] hover:border-[#2A3845] hover:text-white'
                  }`}
                >
                  {m.name}
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
            onClick={handleDeposit}
            disabled={!finalAmount || !method || loading}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ArrowDownToLine size={16} />
                Recargar {finalAmount ? formatCOP(finalAmount) : ''}
              </>
            )}
          </button>

          <p className="text-xs text-[#5A6470] mt-4">
            La recarga quedará en estado pendiente hasta ser confirmada. No se acreditará saldo automáticamente.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
