import { useQuery } from "@tanstack/react-query";

export function useCurrencyData() {
  const ratesQuery = useQuery({
    queryKey: ["/api/rates"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const alertsQuery = useQuery({
    queryKey: ["/api/alerts"],
    refetchInterval: 5000, // 5초마다 새로고침으로 변경
    staleTime: 0, // 캐시를 즉시 stale로 설정
    gcTime: 0, // TanStack Query v5에서는 gcTime 사용
  });
  
  // 디버깅: 알림 데이터 로그
  console.log('Alerts query data:', alertsQuery.data);

  return {
    rates: ratesQuery.data,
    alerts: alertsQuery.data,
    isLoading: ratesQuery.isLoading || alertsQuery.isLoading,
    error: ratesQuery.error || alertsQuery.error,
  };
}
