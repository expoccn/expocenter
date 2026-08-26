import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/login')({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [help, setHelp] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setHelp('');
    if (!username.trim() || !password) {
      setError('Informe usuário e senha.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await login(username, password, remember);
      await navigate({ to: response.user.must_change_password ? '/alterar-senha' : '/', replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o acesso.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="w-full max-w-[570px] py-4 sm:py-8 lg:py-10">
        <div className="mx-auto flex max-w-[330px] justify-center">
          <img
            src="/expo-center-norte-login-logo.png"
            alt="Expo Center Norte — Centro de Exposições e Convenções"
            className="h-auto w-full object-contain"
          />
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-[#0a1b36] sm:text-[2.15rem]">Bem-vindo(a)</h2>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Acesse o portal de gestão operacional</p>
        </div>

        <form className="mt-9 space-y-5 sm:mt-10" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <Label htmlFor="username" className="text-sm font-semibold text-slate-900">Usuário</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1a5590]" strokeWidth={1.8} />
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-14 rounded-xl border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#174a82] focus-visible:ring-2 focus-visible:ring-[#174a82]/15"
                placeholder="Digite seu usuário"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-900">Senha</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1a5590]" strokeWidth={1.8} />
              <Input
                id="password"
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-14 rounded-xl border-slate-300 bg-white px-12 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:border-[#174a82] focus-visible:ring-2 focus-visible:ring-[#174a82]/15"
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#123f70]"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="inline-flex cursor-pointer items-center gap-2.5 text-slate-700">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-[#123f70]"
              />
              <span>Lembrar-me</span>
            </label>
            <button
              type="button"
              className="font-medium text-[#075fbd] transition-colors hover:text-[#084d92] hover:underline"
              onClick={() => {
                setError('');
                setHelp('Para redefinir sua senha, solicite o reset a um administrador do sistema.');
              }}
            >
              Esqueci minha senha
            </button>
          </div>

          {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</div> : null}
          {help ? <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-[#174a82]" role="status">{help}</div> : null}

          <button
            className="flex h-14 w-full items-center justify-center rounded-xl bg-[#0a3974] px-5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(10,57,116,0.2)] transition-colors hover:bg-[#082f61] disabled:cursor-not-allowed disabled:opacity-65"
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Verificando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-500 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">
          Segurança
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/90 px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0f5ea6]">
            <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Acesso restrito a usuários autorizados</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">As atividades de acesso e operação são registradas para segurança do ambiente.</p>
          </div>
        </div>

        <div className="mt-9 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row">
          <span>© 2026 Expo Center Norte</span>
          <span>Portal de Gestão Operacional</span>
        </div>

        <div className="mt-7 flex justify-center lg:hidden">
          <div className="rounded-xl bg-[#071b35] px-5 py-3">
            <img src="/ccn-logo-white.png" alt="CCN Automação" className="w-[118px] object-contain" />
          </div>
        </div>
      </div>
    </AuthShell>
  );
}
