import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowRight,
  UserPlus,
  Search,
  MousePointerClick,
  LineChart,
  RefreshCw,
  TrendingUp,
  Shield,
  Eye,
  Zap,
  ChevronDown,
  Building2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { companies } from '@/data/companies';
import { formatCOP } from '@/lib/format';

const steps = [
  { num: '01', title: 'Crear cuenta', desc: 'Regístrate en segundos y accede a la plataforma.', icon: UserPlus },
  { num: '02', title: 'Explorar empresas', desc: 'Navega oportunidades filtradas por sector y país.', icon: Search },
  { num: '03', title: 'Elegir una inversión', desc: 'Selecciona el monto que quieres simular.', icon: MousePointerClick },
  { num: '04', title: 'Observar el rendimiento', desc: 'Visualiza cómo evolucionan tus inversiones.', icon: LineChart },
  { num: '05', title: 'Reutilizar tus ganancias', desc: 'Reinvierte tus ganancias simuladas en nuevas oportunidades.', icon: RefreshCw },
];

const benefits = [
  { icon: TrendingUp, title: 'Rendimiento simulado', desc: 'Visualiza cómo crecerían tus inversiones día a día.' },
  { icon: Shield, title: 'Sin riesgo real', desc: 'Es una simulación académica. No involucra dinero real.' },
  { icon: Eye, title: 'Transparencia total', desc: 'Información clara de cada empresa y su rendimiento histórico.' },
  { icon: Zap, title: 'Rápido y simple', desc: 'Interfaz diseñada para que inviertas en pocos clics.' },
];

const faqs = [
  { q: '¿Qué es NEXORA?', a: 'NEXORA es un prototipo académico que simula una plataforma de inversión/crowdfunding. No involucra dinero real.' },
  { q: '¿Necesito dinero real?', a: 'No. Todo es una simulación. Recibes un saldo ficticio para explorar cómo funcionaría la plataforma.' },
  { q: '¿Cómo funcionan las ganancias?', a: 'Las ganancias son simuladas y se calculan según el rendimiento de cada empresa. Es solo para fines educativos.' },
  { q: '¿Puedo retirar mi saldo?', a: 'No. Al ser una simulación, el saldo no tiene valor real. La interfaz de retiro existe para mostrar cómo funcionaría.' },
  { q: '¿Están mis datos seguros?', a: 'Sí. Utilizamos autenticación segura y tus datos se almacenan cifrados.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const featured = companies.filter((c) => c.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0B0F14]">
      <Navbar />

      {/* Hero */}
      <section id="inicio" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1677FF]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#35C759]/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111820] border border-[#1E2832] mb-6">
                <span className="w-2 h-2 rounded-full bg-[#35C759] animate-pulse" />
                <span className="text-xs text-[#9CA6B2] font-medium">Plataforma de simulación</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Invierte.
                <br />
                Simula.
                <br />
                <span className="text-[#1677FF]">Crece.</span>
              </h1>

              <p className="mt-6 text-base lg:text-lg text-[#9CA6B2] leading-relaxed max-w-md">
                Explora oportunidades, construye tu portafolio y observa cómo
                evolucionan tus inversiones día a día.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register" className="btn-primary">
                  Comenzar ahora
                  <ArrowRight size={16} />
                </Link>
                <a href="#empresas" className="btn-secondary">
                  Explorar empresas
                </a>
              </div>
            </div>

            {/* Hero visual */}
            <div className="animate-fade-up hidden lg:block" style={{ animationDelay: '0.1s' }}>
              <div className="surface-card p-6 relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-[#9CA6B2]">Saldo disponible</p>
                    <p className="text-2xl font-bold text-white mt-1">$125,450 COP</p>
                    <p className="text-xs text-[#5A6470] mt-0.5">≈ $31 USD</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#1677FF]/10 flex items-center justify-center">
                    <TrendingUp size={22} className="text-[#1677FF]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-[#0B0F14] rounded-lg p-3 border border-[#1E2832]">
                    <p className="text-xs text-[#9CA6B2]">Capital invertido</p>
                    <p className="text-sm font-semibold text-white mt-1">$90,000</p>
                  </div>
                  <div className="bg-[#0B0F14] rounded-lg p-3 border border-[#1E2832]">
                    <p className="text-xs text-[#9CA6B2]">Ganancias</p>
                    <p className="text-sm font-semibold text-[#35C759] mt-1">+$12,700</p>
                  </div>
                </div>

                <div className="flex items-end gap-1.5 h-24 mb-2">
                  {[40, 55, 45, 60, 70, 65, 80, 75, 85, 90, 78, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-[#1677FF]/40 to-[#1677FF] transition-all duration-300 hover:from-[#1677FF]/60 hover:to-[#1677FF]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#5A6470]">
                  <span>Ene</span>
                  <span>Jun</span>
                  <span>Dic</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-20 lg:py-28 border-t border-[#1E2832]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider mb-3">
              Cómo funciona
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Cinco pasos para empezar
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map(({ num, title, desc, icon: Icon }, i) => (
              <div
                key={num}
                className="surface-card p-5 hover:border-[#1677FF]/30 transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-[#5A6470]">{num}</span>
                  <Icon size={18} className="text-[#1677FF]" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                <p className="text-xs text-[#9CA6B2] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured companies */}
      <section id="empresas" className="py-20 lg:py-28 border-t border-[#1E2832]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider mb-3">
                Empresas destacadas
              </p>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Oportunidades para explorar
              </h2>
            </div>
            <Link to="/register" className="btn-ghost">
              Ver todas
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((company, i) => (
              <div
                key={company.id}
                className="surface-card p-6 hover:border-[#2A3845] transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#1677FF]/10 flex items-center justify-center text-[#1677FF] font-bold text-sm shrink-0">
                    {company.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate">{company.name}</h3>
                    <p className="text-xs text-[#9CA6B2] mt-0.5">{company.country} · {company.sector}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <p className="text-xs text-[#9CA6B2]">Rendimiento</p>
                    <p className="text-sm font-semibold text-[#35C759] mt-0.5">
                      +{company.simulatedReturn}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#9CA6B2]">Desde</p>
                    <p className="text-sm font-semibold text-white mt-0.5">
                      {formatCOP(company.minInvestment)}
                    </p>
                  </div>
                </div>

                <Link to="/register" className="btn-secondary w-full">
                  Ver empresa
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20 lg:py-28 border-t border-[#1E2832]">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider mb-3">
              Beneficios
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Por qué usar NEXORA
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="surface-card p-6 flex items-start gap-4 hover:border-[#2A3845] transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-11 h-11 rounded-xl bg-[#1677FF]/10 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-[#1677FF]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-[#9CA6B2] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 border-t border-[#1E2832]">
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold text-[#1677FF] uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="surface-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-[#9CA6B2] shrink-0 transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    openFaq === i ? 'max-h-40' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 pb-4 text-sm text-[#9CA6B2] leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 border-t border-[#1E2832]">
        <div className="max-w-4xl mx-auto px-5 lg:px-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1677FF]/10 flex items-center justify-center mx-auto mb-6">
            <Building2 size={26} className="text-[#1677FF]" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Comienza a simular hoy
          </h2>
          <p className="text-base lg:text-lg text-[#9CA6B2] max-w-xl mx-auto mb-8">
            Crea tu cuenta en segundos y empieza a explorar oportunidades de inversión simuladas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary">
              Crear cuenta
              <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="btn-secondary">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
