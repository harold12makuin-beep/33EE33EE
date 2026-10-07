export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance_cop: number;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  country: string;
  country_code: string | null;
  sector: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  risk_level: 'Bajo' | 'Medio' | 'Alto';
  simulated_daily_rate: number;
  minimum_investment: number;
  maximum_investment: number;
  update_frequency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentPackage {
  id: string;
  company_id: string;
  investment_amount: number;
  simulated_daily_profit: number;
  duration_days: number;
  created_at: string;
}

export type InvestmentStatus = 'active' | 'completed' | 'reinvested';

export interface Investment {
  id: string;
  user_id: string;
  company_id: string;
  package_id: string;
  principal_amount: number;
  accumulated_simulated_profit: number;
  status: InvestmentStatus;
  started_at: string;
  last_profit_update: string;
  next_profit_update: string;
  created_at: string;
  updated_at: string;
  company?: Company;
  package?: InvestmentPackage;
}

export type TransactionType = 'deposit' | 'investment' | 'profit' | 'reinvestment' | 'withdrawal';
export type TransactionStatus = 'pending' | 'approved' | 'rejected';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  reference: string | null;
  description: string | null;
  created_at: string;
}

export interface ProfitHistory {
  id: string;
  investment_id: string;
  user_id: string;
  amount: number;
  calculated_at: string;
}

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  method: string;
  status: WithdrawalStatus;
  requested_at: string;
  processed_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const USD_EXCHANGE_RATE = 4000;

export const PACKAGE_AMOUNTS = [10000, 20000, 30000, 50000, 100000, 200000, 300000];

export const DEPOSIT_PRESETS = [10000, 20000, 50000, 100000, 200000];
