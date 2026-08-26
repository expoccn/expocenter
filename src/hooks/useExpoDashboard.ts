import { useQuery } from '@tanstack/react-query';
import { fetchExpoDashboard, fetchExpoHealth } from '@/services/expo';
import { usePeriod } from '@/context/PeriodContext';

export function useExpoDashboard() {
  const { period } = usePeriod();
  return useQuery({
    queryKey: ['expo-dashboard-v2', period],
    queryFn: () => fetchExpoDashboard(period),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useExpoHealth() {
  return useQuery({
    queryKey: ['expo-health-v2'],
    queryFn: fetchExpoHealth,
    staleTime: 60_000,
    retry: 1,
  });
}
