import { createFileRoute } from '@tanstack/react-router';
import { Check, Copy, KeyRound, LoaderCircle, Plus, RefreshCw, ShieldCheck, UserCheck, UsersRound } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { ExpoShell } from '@/components/dashboard/ExpoShell';
import { Panel } from '@/components/dashboard/Panel';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageState } from '@/components/dashboard/PageState';
import { useAuth } from '@/context/AuthContext';
import { useAdminUsers, useCreateAdminUser, useResetAdminUserPassword, useUpdateAdminUser } from '@/hooks/useDataService';
import type { AccessRole, AdminAccessUser } from '@/types/auth';
import { EXPO_PREVIEW_MODE } from '@/lib/expoConfig';

export const Route = createFileRoute('/usuarios')({ component: UsersPage });

type TemporaryCredential = { username: string; password: string };

function PreviewUsers() {
  return (
    <ExpoShell title="Usuários" description="Administração de acessos preparada para o backend de autenticação do Expo V2.">
      {() => (
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Panel title="Modo de homologação" icon={ShieldCheck}>
            <p className="text-sm leading-relaxed text-muted-foreground">A autenticação está temporariamente bypassada porque <code className="rounded bg-surface px-1.5 py-0.5">VITE_EXPO_PREVIEW_MODE=true</code>. Ao mudar para <strong>false</strong>, login, troca de senha e administração voltam a exigir os endpoints de autenticação.</p>
          </Panel>
          <Panel title="Perfis previstos" icon={UsersRound}>
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-surface p-4"><p className="font-semibold">Administrador</p><p className="mt-1 text-xs text-muted-foreground">Gerencia usuários, redefinição de senha e configurações administrativas.</p></div><div className="rounded-xl bg-surface p-4"><p className="font-semibold">Usuário</p><p className="mt-1 text-xs text-muted-foreground">Acesso às telas operacionais, relatórios e análises permitidas.</p></div></div>
          </Panel>
        </div>
      )}
    </ExpoShell>
  );
}

function UserActions({ item, currentUserId, onCredential }: { item: AdminAccessUser; currentUserId: string; onCredential: (value: TemporaryCredential) => void }) {
  const update = useUpdateAdminUser();
  const reset = useResetAdminUserPassword();
  const isSelf = item.id === currentUserId;
  const [error, setError] = useState('');

  const toggle = async () => {
    setError('');
    try { await update.mutateAsync({ user_id: item.id, display_name: item.display_name, role: item.role, active: !item.active }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível alterar o usuário.'); }
  };
  const resetPassword = async () => {
    setError('');
    try { const result = await reset.mutateAsync(item.id); onCredential({ username: result.username, password: result.temporary_password }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.'); }
  };

  return <div className="min-w-[220px]"><div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" type="button" disabled={isSelf || update.isPending} onClick={() => void toggle()}><UserCheck className="mr-1.5 h-3.5 w-3.5" />{item.active ? 'Desativar' : 'Ativar'}</Button><Button size="sm" variant="outline" type="button" disabled={isSelf || !item.active || reset.isPending} onClick={() => void resetPassword()}><KeyRound className="mr-1.5 h-3.5 w-3.5" />Resetar senha</Button></div>{error ? <p className="mt-2 text-xs text-critical">{error}</p> : null}</div>;
}

function UsersPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<AccessRole>('VIEWER');
  const [error, setError] = useState('');
  const [credential, setCredential] = useState<TemporaryCredential | null>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const usersQuery = useAdminUsers(!EXPO_PREVIEW_MODE && isAdmin);
  const create = useCreateAdminUser();

  const stats = useMemo(() => {
    const users = usersQuery.data?.users ?? [];
    return { total: users.length, active: users.filter((item) => item.active).length, admins: users.filter((item) => item.active && item.role === 'ADMIN').length };
  }, [usersQuery.data?.users]);

  if (EXPO_PREVIEW_MODE) return <PreviewUsers />;
  if (!isAdmin) return <PageState title="Acesso restrito" description="A administração de usuários é exclusiva para administradores." />;
  if (usersQuery.isPending) return <PageState loading title="Carregando usuários" description="Consultando os acessos cadastrados." />;
  if (usersQuery.isError || !usersQuery.data) return <PageState title="Não foi possível carregar os usuários" description={usersQuery.error instanceof Error ? usersQuery.error.message : 'Tente novamente.'} onRetry={() => void usersQuery.refetch()} />;

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setCredential(null);
    if (!displayName.trim() || !username.trim()) { setError('Informe nome e usuário.'); return; }
    try {
      const result = await create.mutateAsync({ display_name: displayName.trim(), username: username.trim().toLowerCase(), role });
      setCredential({ username: result.user.username, password: result.temporary_password });
      setDisplayName(''); setUsername(''); setRole('VIEWER');
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível criar o usuário.'); }
  };

  const copyPassword = async () => {
    if (!credential) return;
    try { await navigator.clipboard.writeText(credential.password); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };

  return (
    <ExpoShell title="Usuários" description="Cadastre acessos, altere perfis, ative ou desative contas e gere senhas provisórias.">
      {() => (
        <>
          <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Total</p><p className="mt-2 text-2xl font-semibold">{stats.total}</p></div><div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Ativos</p><p className="mt-2 text-2xl font-semibold text-success">{stats.active}</p></div><div className="rounded-2xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Administradores</p><p className="mt-2 text-2xl font-semibold">{stats.admins}</p></div></section>
          {credential ? <section className="flex flex-col gap-3 rounded-2xl border border-success/25 bg-success/8 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold text-success">Senha provisória gerada</p><p className="mt-2 font-mono text-sm">{credential.username} · <strong>{credential.password}</strong></p></div><Button variant="outline" onClick={() => void copyPassword()}>{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? 'Copiada' : 'Copiar senha'}</Button></section> : null}
          <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
            <Panel title="Novo usuário" icon={Plus}><form className="space-y-4" onSubmit={handleCreate}><div className="space-y-2"><Label htmlFor="new-name">Nome</Label><Input id="new-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="new-user">Usuário</Label><Input id="new-user" value={username} onChange={(event) => setUsername(event.target.value)} /></div><div className="space-y-2"><Label htmlFor="new-role">Perfil</Label><select id="new-role" value={role} onChange={(event) => setRole(event.target.value as AccessRole)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="VIEWER">Usuário</option><option value="ADMIN">Administrador</option></select></div>{error ? <p className="text-sm text-critical">{error}</p> : null}<Button className="w-full" disabled={create.isPending}>{create.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}Criar usuário</Button></form></Panel>
            <Panel title="Acessos cadastrados" icon={UsersRound} action={<Button variant="outline" size="sm" onClick={() => void usersQuery.refetch()}><RefreshCw className="mr-2 h-3.5 w-3.5" />Atualizar</Button>}><div className="dashboard-scrollbar overflow-x-auto"><table className="w-full min-w-[880px] text-sm"><thead><tr className="border-b border-border bg-surface/60 text-left text-xs text-muted-foreground"><th className="px-3 py-2.5">Usuário</th><th className="px-3 py-2.5">Perfil</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Último acesso</th><th className="px-3 py-2.5">Ações</th></tr></thead><tbody>{usersQuery.data.users.map((item) => <tr key={item.id} className="border-b border-border/60 last:border-0"><td className="px-3 py-3"><p className="font-semibold">{item.display_name}</p><p className="text-xs text-muted-foreground">@{item.username}</p></td><td className="px-3 py-3">{item.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</td><td className="px-3 py-3"><StatusBadge label={item.active ? 'Ativo' : 'Inativo'} tone={item.active ? 'ok' : 'pending'} /></td><td className="px-3 py-3 text-xs text-muted-foreground">{item.last_login_at ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.last_login_at)) : 'N/D'}</td><td className="px-3 py-3"><UserActions item={item} currentUserId={user?.id || ''} onCredential={setCredential} /></td></tr>)}</tbody></table></div></Panel>
          </div>
        </>
      )}
    </ExpoShell>
  );
}
