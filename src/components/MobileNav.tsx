import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Briefcase, Wallet } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Inicio', icon: Home },
  { to: '/invest', label: 'Invertir', icon: TrendingUp },
  { to: '/investments', label: 'Inversiones', icon: Briefcase },
  { to: '/balance', label: 'Saldo', icon: Wallet },
];

export default function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111820] border-t border-[#1E2832]">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isActive ? 'text-[#1677FF]' : 'text-[#5A6470]'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
