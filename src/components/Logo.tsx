import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
}

export default function Logo({ size = 'md', to = '/' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', inner: 'w-3.5 h-3.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', inner: 'w-4 h-4' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', inner: 'w-5 h-5' },
  };
  const s = sizes[size];

  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <div className={`${s.icon} relative flex items-center justify-center`}>
        <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
          <path
            d="M6 28L14 16L22 24L34 8"
            stroke="#1677FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M26 8H34V16"
            stroke="#1677FF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="28" r="2.5" fill="#1677FF" />
          <circle cx="22" cy="24" r="2.5" fill="#35C759" />
        </svg>
      </div>
      <span className={`${s.text} font-extrabold tracking-tight text-white group-hover:text-white transition-colors`}>
        NEXORA
      </span>
    </Link>
  );
}
