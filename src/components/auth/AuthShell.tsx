import { BarChart3, ShieldCheck, UsersRound } from 'lucide-react';
import type { ReactNode } from 'react';

const highlights = [
  { icon: BarChart3, label: 'Excelência\noperacional' },
  { icon: ShieldCheck, label: 'Segurança e\nconfiabilidade' },
  { icon: UsersRound, label: 'Gestão inteligente\nde facilities' },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-[100svh] bg-[#edf2f7] p-0 text-slate-950 sm:p-3 lg:h-[100svh] lg:min-h-0 lg:overflow-hidden lg:p-4 xl:p-5"
      style={{ colorScheme: 'light' }}
    >
      <main className="mx-auto grid min-h-[100svh] w-full max-w-[1540px] overflow-hidden bg-white shadow-[0_30px_100px_rgba(15,31,52,0.16)] sm:min-h-[calc(100svh-24px)] sm:rounded-[26px] lg:h-[calc(100svh-32px)] lg:min-h-0 lg:grid-cols-[minmax(520px,1.03fr)_minmax(560px,0.97fr)] xl:h-[calc(100svh-40px)]">
        <section className="relative hidden h-full min-h-0 overflow-hidden bg-[#071d3c] text-white lg:flex lg:flex-col">
          <img
            src="/expo-center-norte-login-venue.jpg"
            alt="Fachada do Expo Center Norte"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,32,76,0.55)_0%,rgba(3,26,60,0.2)_38%,rgba(2,15,39,0.76)_76%,rgba(2,13,34,0.98)_100%)]" />
          <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,24,61,0.82)_0%,rgba(5,39,88,0.34)_54%,rgba(2,18,43,0.18)_100%)]" />
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(98,166,231,.2)_1px,transparent_1px),linear-gradient(90deg,rgba(98,166,231,.2)_1px,transparent_1px)] [background-size:56px_56px]" />

          <div className="relative z-10 px-10 pt-9 xl:px-14 xl:pt-11 2xl:px-16 2xl:pt-12">
            <p className="text-[1.85rem] font-semibold tracking-[-0.035em] text-white xl:text-[2rem] 2xl:text-[2.2rem]">Expo Center Norte</p>
            <h1 className="mt-2 max-w-[520px] text-[2.1rem] font-semibold leading-[1.08] tracking-[-0.045em] text-[#68a8f3] xl:text-[2.45rem] 2xl:text-[2.7rem]">
              Conectando negócios,<br />gerando experiências.
            </h1>
            <div className="mt-5 h-[3px] w-14 rounded-full bg-[#e32735] xl:mt-6" />
            <p className="mt-4 max-w-[390px] text-[0.95rem] leading-relaxed text-white/90 xl:mt-5 xl:text-base 2xl:text-lg">
              Um dos principais centros de exposições e convenções da América Latina.
            </p>
          </div>

          <div className="relative z-10 mt-auto px-8 pb-[86px] xl:px-11 xl:pb-[92px] 2xl:px-14">
            <div className="grid grid-cols-3 gap-3">
              {highlights.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center">
                  <Icon className="h-6 w-6 text-[#55a7f7] xl:h-7 xl:w-7 2xl:h-8 2xl:w-8" strokeWidth={1.8} />
                  <p className="mt-2 whitespace-pre-line text-[11px] font-medium leading-relaxed text-white/92 xl:text-xs 2xl:mt-3 2xl:text-sm">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <img
            src="/ccn-logo-white.png"
            alt="CCN Automação"
            className="absolute bottom-5 left-7 z-20 w-[118px] object-contain opacity-95 drop-shadow-[0_3px_14px_rgba(0,0,0,0.42)] xl:bottom-6 xl:left-9 xl:w-[128px] 2xl:bottom-7 2xl:left-11 2xl:w-[138px]"
          />
        </section>

        <section className="relative flex min-h-[100svh] items-center justify-center bg-white px-5 py-6 sm:min-h-[calc(100svh-24px)] sm:px-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-3 xl:px-14 xl:py-4 2xl:px-16">
          {children}
        </section>
      </main>
    </div>
  );
}
