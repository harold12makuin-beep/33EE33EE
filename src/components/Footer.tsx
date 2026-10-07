import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-[#1E2832] bg-[#0B0F14]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-[#9CA6B2] leading-relaxed">
              Plataforma de inversión simulada. Explora oportunidades, construye tu
              portafolio y observa cómo evolucionan tus inversiones.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-3">
                <li><a href="/#como-funciona" className="text-sm text-[#9CA6B2] hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="/#empresas" className="text-sm text-[#9CA6B2] hover:text-white transition-colors">Empresas</a></li>
                <li><a href="/#beneficios" className="text-sm text-[#9CA6B2] hover:text-white transition-colors">Beneficios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Cuenta</h4>
              <ul className="space-y-3">
                <li><a href="/login" className="text-sm text-[#9CA6B2] hover:text-white transition-colors">Iniciar sesión</a></li>
                <li><a href="/register" className="text-sm text-[#9CA6B2] hover:text-white transition-colors">Crear cuenta</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="/#faq" className="text-sm text-[#9CA6B2] hover:text-white transition-colors">FAQ</a></li>
                <li><span className="text-sm text-[#9CA6B2]">Términos</span></li>
                <li><span className="text-sm text-[#9CA6B2]">Privacidad</span></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-[#111820] border border-[#1E2832]">
          <p className="text-xs text-[#5A6470] leading-relaxed">
            Proyecto académico. NEXORA es un prototipo de simulación financiera. Las empresas,
            inversiones, tasas de rentabilidad, ganancias y datos mostrados dentro de la plataforma
            son utilizados exclusivamente con fines educativos y no representan ofertas reales de
            inversión ni asociación con las empresas mencionadas.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[#1E2832] flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-[#5A6470]">© 2026 NEXORA. Prototipo académico de simulación de inversiones.</p>
          <p className="text-xs text-[#5A6470]">Esta plataforma es una simulación. No implica dinero real.</p>
        </div>
      </div>
    </footer>
  );
}
