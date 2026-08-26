import type { ReactNode } from 'react';
import { ExpoLogo } from '@/components/dashboard/ExpoLogo';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#08141f] text-white" style={{ colorScheme: 'dark' }}>
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(26,146,199,0.22),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(43,183,192,0.13),transparent_25%),linear-gradient(135deg,#06111b_0%,#0a1d2d_48%,#06111b_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto grid min-h-[100svh] w-full max-w-[1580px] gap-8 px-5 py-7 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(420px,540px)] md:items-center md:gap-12 md:px-12 lg:gap-20 lg:px-16 xl:px-20">
        <section className="flex min-h-[280px] flex-col justify-center md:min-h-0 md:pb-20">
          <div className="inline-flex w-fit rounded-2xl border border-white/10 bg-white/95 px-4 py-3 shadow-2xl"><ExpoLogo onLight /></div>
          <div className="mt-8 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300/90">Centro de Inteligência Operacional</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.65rem]">CAG &amp; Gestão Hídrica</h1>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">Monitoramento operacional, qualidade dos dados, relatórios e análises governadas do Expo Center Norte.</p>
            <div className="mt-6 h-[2px] w-14 bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
          </div>
        </section>

        <section className="flex items-center justify-center pb-24 pt-2 md:justify-end md:pb-8 md:pt-8">{children}</section>

        <div className="flex items-center pb-2 md:hidden"><img src="/ccn-logo-white.png" alt="CCN Automação" className="w-[118px] object-contain opacity-90" /></div>
      </div>

      <img src="/ccn-logo-white.png" alt="CCN Automação" className="absolute bottom-9 left-9 z-20 hidden w-[128px] object-contain opacity-90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] md:block lg:bottom-11 lg:left-14 lg:w-[140px] xl:left-16 xl:w-[148px]" />
    </div>
  );
}
