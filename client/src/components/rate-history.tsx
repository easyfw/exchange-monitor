import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/currency-utils";

interface RateHistoryProps {
  selectedPair: string;
  onPairChange: (pair: string) => void;
}

const CURRENCY_PAIRS = [
  { value: "USD/KRW", label: "USD/KRW" },
  { value: "JPY/KRW", label: "JPY/KRW" },
  { value: "USD/JPY", label: "USD/JPY" },
];

export default function RateHistory({ selectedPair, onPairChange }: RateHistoryProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["/api/rates", selectedPair, "history"],
    queryFn: async () => {
      const response = await fetch(`/api/rates/${encodeURIComponent(selectedPair)}/history?limit=10`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
    refetchInterval: 30000,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Rate History</CardTitle>
          <Select value={selectedPair} onValueChange={onPairChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_PAIRS.map((pair) => (
                <SelectItem key={pair.value} value={pair.value}>
                  {pair.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart placeholder */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <BarChart3 className="text-gray-400 w-12 h-12 mx-auto mb-2" />
            <p className="text-gray-500">Rate history chart</p>
            <p className="text-sm text-gray-400">Real-time visualization coming soon</p>
          </div>
        </div>

        {/* History entries */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-gray-500">Loading history...</p>
            </div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No history data available</p>
            </div>
          ) : (
            history.map((entry: any, index: number) => {
              const change = parseFloat(entry.change);
              const changePercent = parseFloat(entry.changePercent);
              const isPositive = change >= 0;
              const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-500">{time}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(parseFloat(entry.rate), selectedPair)}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span className="text-xs">
                      {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
