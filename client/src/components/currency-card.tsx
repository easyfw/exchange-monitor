import { Settings, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExchangeRate, Alert } from "@shared/schema";
import { formatCurrency } from "@/lib/currency-utils";

interface CurrencyCardProps {
  rate: ExchangeRate;
  alerts: Alert[];
  onAddAlert: () => void;
  isLoading?: boolean;
}

export default function CurrencyCard({ rate, alerts, onAddAlert, isLoading }: CurrencyCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="w-24 h-4" />
                <Skeleton className="w-32 h-3" />
              </div>
            </div>
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
          <Skeleton className="w-32 h-8" />
          <div className="space-y-2">
            <Skeleton className="w-full h-16 rounded-lg" />
          </div>
        </div>
      </Card>
    );
  }

  const change = parseFloat(rate.change);
  const changePercent = parseFloat(rate.changePercent);
  const isPositive = change >= 0;

  const getCurrencyInfo = (pair: string) => {
    switch (pair) {
      case 'USD/KRW':
        return {
          code: 'USD',
          name: 'USD to KRW',
          description: 'US Dollar to Korean Won',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
        };
      case 'JPY/KRW':
        return {
          code: 'JPY',
          name: 'JPY to KRW',
          description: 'Japanese Yen to Korean Won',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
        };
      case 'USD/JPY':
        return {
          code: 'USD/JPY',
          name: 'USD to JPY',
          description: 'US Dollar to Japanese Yen',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
        };
      default:
        return {
          code: pair,
          name: pair,
          description: pair,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
        };
    }
  };

  const currencyInfo = getCurrencyInfo(rate.currencyPair);
  const activeAlerts = alerts
    .filter(alert => alert.isActive && alert.currencyPair === rate.currencyPair)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // 최신순 정렬

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${currencyInfo.bgColor} rounded-lg flex items-center justify-center`}>
              <span className={`${currencyInfo.textColor} font-bold text-sm`}>
                {currencyInfo.code}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currencyInfo.name}</h3>
              <p className="text-sm text-gray-500">{currencyInfo.description}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            isPositive 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {isPositive ? (
              <TrendingUp className="text-green-600 w-3 h-3" />
            ) : (
              <TrendingDown className="text-red-600 w-3 h-3" />
            )}
            <span className={`text-xs font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatCurrency(parseFloat(rate.rate), rate.currencyPair)}
          </div>
          <div className="text-sm text-gray-500">
            Change: <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}{formatCurrency(Math.abs(change), rate.currencyPair)}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Target Alert</span>
            <Button variant="ghost" size="sm" onClick={onAddAlert}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          {activeAlerts.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {activeAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{alert.targetType}</span>
                  <span className="text-sm font-mono text-gray-900">
                    {formatCurrency(parseFloat(alert.targetRate), rate.currencyPair)}
                  </span>
                </div>
              ))}
              {activeAlerts.length > 2 && (
                <div className="text-xs text-gray-500 text-center">
                  +{activeAlerts.length - 2} more alerts
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">No active alerts</p>
              <Button variant="link" size="sm" onClick={onAddAlert} className="p-0 h-auto">
                Add your first alert
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
