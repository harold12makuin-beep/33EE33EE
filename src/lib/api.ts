import { supabase } from '@/lib/supabase';
import type { Company, InvestmentPackage, Investment, Transaction, Withdrawal, Notification } from '@/types';

// ---- Companies ----
export async function fetchCompanies(filters?: {
  sector?: string;
  country?: string;
  risk?: string;
  minReturn?: number;
  maxReturn?: number;
  minInvestment?: number;
  search?: string;
}): Promise<Company[]> {
  let query = supabase.from('companies').select('*').eq('is_active', true).order('name');
  if (filters?.sector) query = query.eq('sector', filters.sector);
  if (filters?.country) query = query.eq('country', filters.country);
  if (filters?.risk) query = query.eq('risk_level', filters.risk);
  if (filters?.minReturn) query = query.gte('simulated_daily_rate', filters.minReturn);
  if (filters?.maxReturn) query = query.lte('simulated_daily_rate', filters.maxReturn);
  if (filters?.minInvestment) query = query.lte('minimum_investment', filters.minInvestment);
  if (filters?.search) query = query.ilike('name', `%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data as Company[];
}

export async function fetchCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Company | null;
}

export async function fetchCompanyPackages(companyId: string): Promise<InvestmentPackage[]> {
  const { data, error } = await supabase
    .from('investment_packages')
    .select('*')
    .eq('company_id', companyId)
    .order('investment_amount');
  if (error) throw error;
  return data as InvestmentPackage[];
}

// ---- Investments ----
export async function fetchUserInvestments(): Promise<Investment[]> {
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      company:companies(*),
      package:investment_packages(*)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Investment[];
}

export async function createInvestment(packageId: string, companyId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('create_investment', {
    p_package_id: packageId,
    p_company_id: companyId,
  });
  if (error) return { error: error.message };
  return { error: null };
}

export async function createReinvestment(
  sourceInvestmentId: string,
  packageId: string,
  companyId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('create_reinvestment', {
    p_source_investment_id: sourceInvestmentId,
    p_package_id: packageId,
    p_company_id: companyId,
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ---- Profit updates ----
export async function processProfitUpdates(): Promise<number> {
  const { data, error } = await supabase.rpc('process_profit_updates');
  if (error) {
    console.error('process_profit_updates error:', error);
    return 0;
  }
  return data as number;
}

// ---- Transactions ----
export async function fetchUserTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Transaction[];
}

// ---- Deposits ----
export async function createDeposit(amount: number, method: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('create_deposit', {
    p_amount: amount,
    p_method: method,
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ---- Withdrawals ----
export async function fetchUserWithdrawals(): Promise<Withdrawal[]> {
  const { data, error } = await supabase
    .from('withdrawals')
    .select('*')
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return data as Withdrawal[];
}

export async function requestWithdrawal(amount: number, method: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('request_withdrawal', {
    p_amount: amount,
    p_method: method,
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ---- Notifications ----
export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsRead(): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('read', false);
  if (error) throw error;
}

// ---- Admin functions ----
export async function adminFetchAllProfiles(): Promise<any[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminFetchAllInvestments(): Promise<any[]> {
  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      company:companies(name),
      profile:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminFetchAllTransactions(): Promise<any[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profile:profiles(full_name, email)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminFetchAllWithdrawals(): Promise<any[]> {
  const { data, error } = await supabase
    .from('withdrawals')
    .select(`
      *,
      profile:profiles(full_name, email)
    `)
    .order('requested_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function adminFetchStats(): Promise<{
  userCount: number;
  activeInvestments: number;
  totalCapital: number;
  totalGains: number;
  companyCount: number;
}> {
  const [users, investments, companies, txProfit] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('investments').select('principal_amount, accumulated_simulated_profit, status'),
    supabase.from('companies').select('id', { count: 'exact', head: true }),
    supabase.from('transactions').select('amount').eq('type', 'profit').eq('status', 'approved'),
  ]);

  const invData = investments.data || [];
  const activeInv = invData.filter((i: any) => i.status === 'active');
  const totalCapital = activeInv.reduce((sum: number, i: any) => sum + Number(i.principal_amount), 0);
  const totalGains = invData.reduce((sum: number, i: any) => sum + Number(i.accumulated_simulated_profit), 0);

  return {
    userCount: users.count || 0,
    activeInvestments: activeInv.length,
    totalCapital,
    totalGains,
    companyCount: companies.count || 0,
  };
}

export async function adminApproveDeposit(transactionId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('approve_deposit', {
    p_transaction_id: transactionId,
  });
  if (error) return { error: error.message };
  return { error: null };
}
