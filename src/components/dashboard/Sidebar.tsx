import {
  BarChart3,
  Building2,
  ChevronRight,
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

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, logout } = useAuth();
  const healthQuery = useExpoHealth();
  const showAdmin = EXPO_PREVIEW_MODE || user?.role === 'ADMIN';

  return (
    <>
      <nav className="dashboard-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.to === '/' ? pathname === '/' : pathname === item.to || pathname.startsWith(`${item.to}/`);
          return (
            <Link
              key={item.label}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                'flex min-h-11 w-full items-center gap-3 rounded-xl border-l-2 px-3 py-2 text-sm transition-all',
                active
                  ? 'border-primary bg-primary/10 font-semibold text-primary shadow-sm'
                  : 'border-transparent font-medium text-sidebar-foreground/72 hover:bg-accent hover:text-sidebar-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}

        {showAdmin ? (
          <>
            <div className="px-3 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/65">Administração</div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={onNavigate}
                  className={cn(
                    'flex min-h-11 w-full items-center gap-3 rounded-xl border-l-2 px-3 py-2 text-sm transition-all',
                    active
                      ? 'border-primary bg-primary/10 font-semibold text-primary shadow-sm'
                      : 'border-transparent font-medium text-sidebar-foreground/72 hover:bg-accent hover:text-sidebar-foreground',
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </>
        ) : null}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border bg-sidebar px-3 pb-3 pt-3">
        <div className="mb-3 flex h-12 items-center justify-center overflow-hidden" aria-label="CCN Automação">
          <img
            src="/ccn-logo-white.png"
            alt="CCN Automação"
            className="h-auto w-[112px] max-w-full object-contain opacity-90 brightness-0 transition-opacity dark:brightness-100"
          />
        </div>

        <div className="mb-2 flex items-center gap-3 rounded-xl border border-sidebar-border bg-card px-3 py-3">
          <UserRound className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{EXPO_PREVIEW_MODE ? 'Homologação' : (user?.display_name || user?.username || 'Usuário')}</p>
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
              {EXPO_PREVIEW_MODE ? 'Preview visual' : user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
          {!EXPO_PREVIEW_MODE ? (
            <div className="flex items-center gap-1">
              <Link to="/alterar-senha" className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-primary" aria-label="Alterar senha">
                <KeyRound className="h-4 w-4" />
              </Link>
              <button type="button" onClick={() => void logout()} className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-critical" aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-card px-3 py-3">
          <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Expo Center Norte</p>
            <p className="truncate text-xs text-muted-foreground">CAG &amp; Gestão Hídrica</p>
            <p className="mt-1 flex items-center gap-1.5 truncate text-[10px] text-muted-foreground">
              <span className={cn('h-1.5 w-1.5 rounded-full', healthQuery.data?.ok ? 'bg-success' : healthQuery.isPending ? 'bg-warning' : 'bg-critical')} />
              {healthQuery.data?.ok ? (EXPO_PREVIEW_MODE ? 'Modo homologação' : 'Dados disponíveis') : healthQuery.isPending ? 'Verificando dados' : 'Dados indisponíveis'}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-[92px] shrink-0 items-center justify-between px-5">
        <ExpoLogo />
        <ThemeToggle compact />
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm lg:hidden"
        aria-label="Abrir navegação"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button type="button" aria-label="Fechar navegação" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
            <div className="flex h-[82px] shrink-0 items-center justify-between px-5">
              <ExpoLogo />
              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <button type="button" onClick={() => setOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card" aria-label="Fechar navegação">
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
