import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatusBar() {
  const [nextUpdate, setNextUpdate] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [updateInterval, setUpdateInterval] = useState(30);

  // Fetch current update interval setting
  useEffect(() => {
    const fetchUpdateInterval = async () => {
      try {
        const response = await fetch('/api/settings/updateInterval');
        if (response.ok) {
          const setting = await response.json();
          const intervalSeconds = parseInt(setting.value);
          setUpdateInterval(intervalSeconds);
          setNextUpdate(intervalSeconds);
        }
      } catch (error) {
        console.error('Failed to fetch update interval:', error);
      }
    };

    fetchUpdateInterval();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const secondsSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      const remaining = updateInterval - (secondsSinceUpdate % updateInterval);
      
      setNextUpdate(remaining);
      
      // Reset timer when we reach the update interval
      if (remaining === updateInterval) {
        setLastUpdated(now);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated, updateInterval]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Listen for changes to update interval (e.g., when settings change)
  useEffect(() => {
    const handleStorageChange = () => {
      fetchUpdateInterval();
    };

    const fetchUpdateInterval = async () => {
      try {
        const response = await fetch('/api/settings/updateInterval');
        if (response.ok) {
          const setting = await response.json();
          const intervalSeconds = parseInt(setting.value);
          setUpdateInterval(intervalSeconds);
          setNextUpdate(intervalSeconds);
          setLastUpdated(new Date()); // Reset timer
        }
      } catch (error) {
        console.error('Failed to fetch update interval:', error);
      }
    };

    // Refresh interval every 10 seconds to catch setting changes
    const refreshInterval = setInterval(fetchUpdateInterval, 10000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Data</span>
              <span className="text-xs text-gray-400">({updateInterval}초 간격)</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: <span>{lastUpdated.toLocaleString()}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Next update in: <span className="font-mono">{formatTime(nextUpdate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
