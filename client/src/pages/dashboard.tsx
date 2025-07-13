import { useState, useEffect } from "react";
import { Bell, RefreshCw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AlertModal from "@/components/alert-modal";
import ActiveAlerts from "@/components/active-alerts";
import StatusBar from "@/components/status-bar";
import SettingsModal from "@/components/settings-modal";
import { useCurrencyData } from "@/hooks/use-currency-data";
import { useNotifications } from "@/hooks/use-notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedPair, setSelectedPair] = useState<string>("USD/KRW");
  const [defaultPair, setDefaultPair] = useState<string>("");

  const { data: currencyData, isLoading } = useCurrencyData();
  const { requestPermission } = useNotifications();
  const queryClient = useQueryClient();

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/rates/refresh', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rates/USD/KRW/history'] });
    },
  });

  // Request notification permission on load
  useEffect(() => {
    if (notificationsEnabled) {
      requestPermission();
    }
  }, [notificationsEnabled, requestPermission]);

  // Sort rates to display in order: USD/KRW, JPY/KRW, USD/JPY
  const sortedRates = currencyData?.rates?.sort((a, b) => {
    const order = ['USD/KRW', 'JPY/KRW', 'USD/JPY'];
    return order.indexOf(a.currencyPair) - order.indexOf(b.currencyPair);
  }) || [];

  const handleAddAlert = (pair?: string) => {
    if (pair) {
      setDefaultPair(pair);
    }
    setShowAlertModal(true);
  };

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">₩</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">환율 모니터</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">실시간 환율 추적 및 알림</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending || isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsModal(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar />

        {/* Currency Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedRates.map((rate) => (
            <div key={rate.currencyPair} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rate.currencyPair}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAlert(rate.currencyPair)}
                >
                  <Bell className="w-4 h-4 mr-1" />
                  알림
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {rate.rate}
                  {rate.currencyPair.includes('KRW') ? '원' : ''}
                </div>
                
                <div className={`flex items-center text-sm ${
                  parseFloat(rate.change) >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  <span className="mr-1">
                    {parseFloat(rate.change) >= 0 ? '▲' : '▼'}
                  </span>
                  <span className="mr-2">
                    {Math.abs(parseFloat(rate.change)).toFixed(4)}
                  </span>
                  <span>
                    ({parseFloat(rate.changePercent) >= 0 ? '+' : ''}{parseFloat(rate.changePercent).toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active Alerts */}
        <ActiveAlerts 
          alerts={currencyData?.alerts || []} 
          onAddAlert={() => handleAddAlert()}
        />

        {/* Modals */}
        <AlertModal
          open={showAlertModal}
          onOpenChange={setShowAlertModal}
          defaultPair={defaultPair}
        />
        
        <SettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
        />
      </div>
    </div>
  );
}