import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Alert } from "@shared/schema";
import { formatCurrency } from "@/lib/currency-utils";

interface ActiveAlertsProps {
  alerts: Alert[];
  onAddAlert: () => void;
}

export default function ActiveAlerts({ alerts, onAddAlert }: ActiveAlertsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAlertMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
      toast({
        title: "Alert Deleted",
        description: "The alert has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete alert. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleAlertMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/alerts/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    },
  });

  const getCurrencyInfo = (pair: string) => {
    switch (pair) {
      case 'USD/KRW':
        return { code: 'USD', bgColor: 'bg-blue-100', textColor: 'text-blue-600' };
      case 'JPY/KRW':
        return { code: 'JPY', bgColor: 'bg-red-100', textColor: 'text-red-600' };
      case 'USD/JPY':
        return { code: 'USD', bgColor: 'bg-green-100', textColor: 'text-green-600' };
      default:
        return { code: pair, bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    }
  };

  const getAlertStatus = (alert: Alert) => {
    if (!alert.isActive) return { label: "Paused", variant: "secondary" as const };
    return { label: "Active", variant: "default" as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Active Alerts</CardTitle>
          <Button onClick={onAddAlert} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Alert
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No alerts configured</p>
              <Button onClick={onAddAlert} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Alert
              </Button>
            </div>
          ) : (
            alerts.map((alert) => {
              const currencyInfo = getCurrencyInfo(alert.currencyPair);
              const status = getAlertStatus(alert);

              return (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-4 ${
                    alert.isActive
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-6 h-6 ${currencyInfo.bgColor} rounded-full flex items-center justify-center`}>
                        <span className={`${currencyInfo.textColor} text-xs font-bold`}>
                          {currencyInfo.code}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{alert.currencyPair}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAlertMutation.mutate(alert.id)}
                      disabled={deleteAlertMutation.isPending}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
                      title="Delete Alert"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Alert when rate goes {alert.targetType}{" "}
                    <span className="font-mono font-medium">
                      {formatCurrency(parseFloat(alert.targetRate), alert.currencyPair)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      Created: {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={status.variant}
                      className="cursor-pointer"
                      onClick={() =>
                        toggleAlertMutation.mutate({
                          id: alert.id,
                          isActive: !alert.isActive,
                        })
                      }
                    >
                      {status.label}
                    </Badge>
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
