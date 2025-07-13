import { useCallback, useEffect, useState } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  }, [permission]);

  const showNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "currency-alert",
        requireInteraction: true,
        silent: false,
        ...options,
      });
      
      // 알림 클릭 시 창 포커스
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      // 10초 후 자동 닫기
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  }, []);

  return {
    permission,
    requestPermission,
    showNotification,
    isSupported: "Notification" in window,
  };
}
