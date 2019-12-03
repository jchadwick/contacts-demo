import React, { useState, useEffect } from "react";
import { AlertPanel } from "./AlertPanel";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

export const OfflineNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [onlineStatus, previousOnlineStatus] = useOnlineStatus();

  useEffect(() => {
    // ignore the initial online state -
    // only show when offline or switching between online <-> offline
    if (onlineStatus === "online" && previousOnlineStatus == null) {
      return;
    }

    setIsVisible(true);
  }, [onlineStatus, previousOnlineStatus, setIsVisible]);

  const isOnline = onlineStatus === "online";

  return (
    isVisible && (
      <AlertPanel
        className="notifications"
        type={isOnline ? "success" : "danger"}
        onClose={() => setIsVisible(false)}
        hideAfter={4000}
      >
        {isOnline ? <RestoredConnectionMessage /> : <LostConnectionMessage />}
      </AlertPanel>
    )
  );
};

const LostConnectionMessage = () => (
  <>
    <div>
      <strong>Offline Mode</strong>
    </div>
    <div>
      <em>All network requests will be queued until connection is restored</em>
    </div>
  </>
);

const RestoredConnectionMessage = () => (
  <>
    <div>
      <strong>Connection Restored!</strong>
    </div>
    <div>
      <em>All queued network requests are being replayed...</em>
    </div>
  </>
);
