import type { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { ExpoHeader } from '@/components/dashboard/ExpoHeader';
import { PageState } from '@/components/dashboard/PageState';
import { useExpoDashboard } from '@/hooks/useExpoDashboard';
import type { ExpoDashboard } from '@/types/expo';

export function ExpoShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: (data: ExpoDashboard) => ReactNode;
}) {
  const dashboard = useExpoDashboard();

  if (dashboard.isPending) {
    return <PageState loading title="Carregando Expo Center Norte" description="Preparando dados do período selecionado." />;
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <PageState
        title="Não foi possível carregar os dados"
        description={dashboard.error instanceof Error ? dashboard.error.message : 'Verifique a API do Expo Center Norte.'}
        onRetry={() => void dashboard.refetch()}
      />
    );
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-4 sm:px-4 lg:px-5 xl:px-6">
        <div className="mx-auto w-full max-w-[1780px] space-y-4">
          <ExpoHeader
            title={title}
            {...(description ? { description } : {})}
            data={dashboard.data}
            refreshing={dashboard.isFetching}
            onRefresh={() => void dashboard.refetch()}
          />
          {children(dashboard.data)}
        </div>
      </main>
    </div>
  );
}
