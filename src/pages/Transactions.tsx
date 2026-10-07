import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftRight } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { fetchUserTransactions, processProfitUpdates } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatCOP, formatDate } from '@/lib/format';
import type { Transaction, TransactionType } from '@/types';

const filters = ['Todos', 'Recargas', 'Inversiones', 'Ganancias simuladas', 'Reinversiones', 'Retiros'] as const;

const typeMap: Record<string, TransactionType> = {
  'Recargas': 'deposit',
  'Inversiones': 'investment',
  'Ganancias simuladas': 'profit',
  'Reinversiones': 'reinvestment',
  'Retiros': 'withdrawal',
};

const typeLabels: Record<TransactionType, string> = {
  deposit: 'Recarga',
  investment: 'Inversión',
  profit: 'Ganancia simulada',
  reinvestment: 'Reinversión',
  withdrawal: 'Retiro',
};

export default function Transactions() {
  const { refreshWallet } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]>('Todos');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    await processProfitUpdates();
    const tx = await fetchUserTransactions();
    setTransactions(tx);
    refreshWallet();
    setLoading(false);
  }, [refreshWallet]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = activeFilter === 'Todos'
    ? transactions
    : transactions.filter((t) => t.type === typeMap[activeFilter]);

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
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">Movimientos</h1>
          <p className="text-sm text-[#9CA6B2] mt-1">Historial de recargas, inversiones, ganancias y retiros.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all duration-200 ${
                activeFilter === f
                  ? 'bg-[#1677FF] text-white border-[#1677FF]'
                  : 'bg-[#111820] text-[#9CA6B2] border-[#1E2832] hover:text-white hover:border-[#2A3845]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="surface-card p-12 text-center animate-fade-up">
            <div className="w-14 h-14 rounded-2xl bg-[#1677FF]/10 flex items-center justify-center mx-auto mb-4">
              <ArrowLeftRight size={24} className="text-[#1677FF]" />
            </div>
            <p className="text-sm text-[#9CA6B2] mb-4">Todavía no tienes movimientos.</p>
            <Link to="/deposit" className="btn-primary">Recargar saldo</Link>
          </div>
        ) : (
          <div className="surface-card overflow-hidden animate-fade-up">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1E2832]">
                    <th className="text-left text-xs font-medium text-[#9CA6B2] px-5 py-3">Tipo</th>
                    <th className="text-left text-xs font-medium text-[#9CA6B2] px-5 py-3 hidden sm:table-cell">Descripción</th>
                    <th className="text-right text-xs font-medium text-[#9CA6B2] px-5 py-3">Monto</th>
                    <th className="text-left text-xs font-medium text-[#9CA6B2] px-5 py-3 hidden sm:table-cell">Estado</th>
                    <th className="text-right text-xs font-medium text-[#9CA6B2] px-5 py-3 hidden sm:table-cell">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => {
                    const isPositive = tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'reinvestment';
                    const statusColor = tx.status === 'approved' ? 'text-[#35C759]' : tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400';
                    const statusLabel = tx.status === 'approved' ? 'Aprobado' : tx.status === 'pending' ? 'Pendiente' : 'Rechazado';
                    return (
                      <tr key={tx.id} className="border-b border-[#1E2832] last:border-0 hover:bg-[#161F29] transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white">{typeLabels[tx.type]}</span>
                          <p className="text-xs text-[#5A6470] sm:hidden mt-0.5">{tx.description}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-[#9CA6B2] hidden sm:table-cell">{tx.description}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`text-sm font-semibold ${isPositive ? 'text-[#35C759]' : 'text-white'}`}>
                            {isPositive ? '+' : '-'}{formatCOP(tx.amount)}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className={`text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                        </td>
                        <td className="px-5 py-4 text-right text-sm text-[#9CA6B2] hidden sm:table-cell">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
