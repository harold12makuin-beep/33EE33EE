import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  Home,
  TrendingUp,
  Briefcase,
  Wallet,
  ArrowLeftRight,
  ArrowDownToLine,
  ArrowUpFromLine,
  User as UserIcon,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import Logo from './Logo';
import MobileNav from './MobileNav';
import { useAuth } from '@/context/AuthContext';

interface SidebarLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
}

function SidebarLink({ to, icon, label }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { signOut, profile, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-[#1E2832] bg-[#0B0F14] fixed inset-y-0 left-0 z-30">
        <div className="h-16 flex items-center px-5 border-b border-[#1E2832]">
          <Logo size="sm" to="/dashboard" />
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <SidebarLink to="/dashboard" icon={<Home size={18} />} label="Inicio" />
          <SidebarLink to="/invest" icon={<TrendingUp size={18} />} label="Invertir" />
          <SidebarLink to="/investments" icon={<Briefcase size={18} />} label="Mis inversiones" />
          <SidebarLink to="/balance" icon={<Wallet size={18} />} label="Saldo" />
          <SidebarLink to="/transactions" icon={<ArrowLeftRight size={18} />} label="Movimientos" />

          <div className="h-px bg-[#1E2832] my-3" />

          <SidebarLink to="/deposit" icon={<ArrowDownToLine size={18} />} label="Recargar" />
          <SidebarLink to="/withdraw" icon={<ArrowUpFromLine size={18} />} label="Retirar" />

          <div className="h-px bg-[#1E2832] my-3" />

          <SidebarLink to="/profile" icon={<UserIcon size={18} />} label="Perfil" />
          <SidebarLink to="/settings" icon={<Settings size={18} />} label="Configuración" />

          {isAdmin && (
            <>
              <div className="h-px bg-[#1E2832] my-3" />
              <SidebarLink to="/admin" icon={<Shield size={18} />} label="Administración" />
            </>
          )}
        </div>

        <div className="px-3 pb-4 border-t border-[#1E2832] pt-3">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-[#5A6470] truncate">{profile?.email}</p>
            <p className="text-sm text-white font-medium truncate">{profile?.full_name}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="sidebar-link w-full text-left"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <main className="flex-1 px-5 lg:px-8 py-6 pb-24 lg:pb-8 animate-fade-in">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
