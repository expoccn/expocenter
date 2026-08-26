import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Sidebar, MobileSidebar } from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';

export function PageState({ loading = false, title, description, onRetry }: { loading?: boolean; title: string; description: string; onRetry?: () => void }) {
  return (
    <div className="flex min-h-screen min-w-0 bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        <div className="mb-4 lg:hidden"><MobileSidebar /></div>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
            {loading ? <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" /> : <AlertTriangle className="mx-auto h-8 w-8 text-warning" />}
            <h1 className="mt-4 text-lg font-semibold">{title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            {onRetry ? <Button className="mt-5" type="button" onClick={onRetry}>Tentar novamente</Button> : null}
          </div>
        </div>
      </main>
    </div>
  );
}
