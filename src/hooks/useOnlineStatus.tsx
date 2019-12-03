import { useState, useEffect } from "react";

export const useOnlineStatus = () => {
  const [onlineStatus, setOnlineStatus] = useState("online");
  const [previousOnlineStatus, setPreviousOnlineStatus] = useState(null);

  useEffect(() => {
    function handleMessage(event) {
      const { type, status } = event.data || {};
      if (type === "online_status" && status && onlineStatus !== status) {
        setPreviousOnlineStatus(onlineStatus);
        setOnlineStatus(status);
      }
    }

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [onlineStatus, setOnlineStatus, setPreviousOnlineStatus]);

  return [onlineStatus, previousOnlineStatus];
};
