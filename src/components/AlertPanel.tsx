import React, { useEffect, useMemo } from "react";
import { useObserver } from "mobx-react-lite";
import { NotificationType } from "../model";

interface AlertPanelProps {
  className?: string;
  type?: NotificationType;
  message: string;
  hideAfter?: number;
  onClose?(): void;
}

export const AlertPanel = ({
  className = "",
  type,
  message,
  onClose,
  hideAfter = null
}: AlertPanelProps) => {
  const contents = useMemo(() => {
    if (typeof message === "string") {
      return message;
    } else {
      const { message: text, responseText } = (message || {}) as any;
      return text || responseText || JSON.stringify(message);
    }
  }, [message]);

  useEffect(() => {
    if (hideAfter) {
      const timer = setTimeout(() => (onClose ? onClose() : null), hideAfter);
      return () => clearTimeout(timer);
    }
  }, [hideAfter, message, onClose]);

  return useObserver(() => (
    <div className={`alert alert-${type || "info"} ${className}`} role="alert">
      {contents}
    </div>
  ));
};
