import {
  BarChart3,
  Database,
  Droplets,
  FileText,
  Home,
  KeyRound,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { useExpoHealth } from '@/hooks/useExpoDashboard';
import { EXPO_PREVIEW_MODE } from '@/lib/expoConfig';
import { ExpoLogo } from '@/components/dashboard/ExpoLogo';

const navItems: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Visão Geral', to: '/', icon: Home },
  { label: 'CAG', to: '/cag', icon: BarChart3 },
  { label: 'Hidrômetros', to: '/hidrometros', icon: Droplets },
  { label: 'Qualidade dos Dados', to: '/qualidade-dados', icon: Database },
  { label: 'Relatórios', to: '/relatorios', icon: FileText },
  { label: 'Análises por IA', to: '/analises-ia', icon: Sparkles },
];

const adminNavItems: { label: string; to: string; icon: LucideIcon }[] = [
  { label: 'Usuários', to: '/usuarios', icon: UsersRound },
];

function NavItem({ item, active, onNavigate }: { item: { label: string; to: string; icon: LucideIcon }; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onNavigate}
      className={cn(
        'group flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors',
        active
          ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground shadow-[inset_3px_0_0_rgba(64,163,255,0.95)]'
          : 'font-medium text-sidebar-foreground/72 hover:bg-white/[0.06] hover:text-sidebar-foreground',
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-[#55a7f7]' : 'text-sidebar-foreground/58 group-hover:text-sidebar-foreground/85')} strokeWidth={1.8} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
    </Link>
  );
}

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, logout } = useAuth();
  const healthQuery = useExpoHealth();
  const showAdmin = EXPO_PREVIEW_MODE || user?.role === 'ADMIN';

  return (
    <>
      <nav className="dashboard-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return <NavItem key={item.label} item={item} active={active} onNavigate={onNavigate} />;
          })}
        </div>

        {showAdmin ? (
          <div className="mt-6">
            <div className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/36">Administração</div>
            <div className="space-y-1">
              {adminNavItems.map((item) => (
                <NavItem key={item.label} item={item} active={pathname === item.to || pathname.startsWith(`${item.to}/`)} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        ) : null}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border/90 px-3 pb-4 pt-3">
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/[0.035] px-3 py-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] text-[#62b1ff]">
            <UserRound className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold text-sidebar-foreground">{EXPO_PREVIEW_MODE ? 'Homologação' : (user?.display_name || user?.username || 'Usuário')}</p>
            <p className="mt-0.5 truncate text-[8px] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground/40">
              {EXPO_PREVIEW_MODE ? 'Preview visual' : user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          {!EXPO_PREVIEW_MODE ? (
            <div className="flex items-center gap-0.5">
              <Link to="/alterar-senha" className="rounded-md p-1.5 text-sidebar-foreground/48 transition-colors hover:bg-white/[0.07] hover:text-sidebar-foreground" aria-label="Alterar senha">
                <KeyRound className="h-3.5 w-3.5" />
              </Link>
              <button type="button" onClick={() => void logout()} className="rounded-md p-1.5 text-sidebar-foreground/48 transition-colors hover:bg-white/[0.07] hover:text-[#ff6977]" aria-label="Sair">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3 px-2 pb-1 pt-1">
          <img src="/ccn-logo-white.png" alt="CCN Automação" className="h-auto w-[92px] object-contain opacity-[0.92]" />
          <div className="mb-1 flex items-center gap-1.5 text-[8px] text-sidebar-foreground/38">
            <span className={cn('h-1.5 w-1.5 rounded-full', healthQuery.data?.ok ? 'bg-success' : healthQuery.isPending ? 'bg-warning' : 'bg-critical')} />
            {healthQuery.data?.ok ? 'Dados online' : healthQuery.isPending ? 'Verificando' : 'Indisponível'}
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-[78px] shrink-0 items-center px-5">
        <ExpoLogo />
      </div>
      <NavContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-sm lg:hidden"
        aria-label="Abrir navegação"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" aria-label="Fechar navegação" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,300px)] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
            <div className="flex h-[74px] shrink-0 items-center justify-between px-5">
              <ExpoLogo compact />
              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <button type="button" onClick={() => setOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sidebar-foreground" aria-label="Fechar navegação">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <NavContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
