import React, { useEffect, useMemo, ReactNode, PropsWithChildren } from "react";
import { useObserver } from "mobx-react-lite";
import { NotificationType } from "../model";

interface AlertPanelProps {
  className?: string;
  type?: NotificationType;
  message?: string | ReactNode | { responseText: string } | { message: string };
  hideAfter?: number;
  onClose?(): void;
}

export const AlertPanel = ({
  children,
  className = "",
  type,
  message,
  onClose,
  hideAfter = null
}: PropsWithChildren<AlertPanelProps>) => {
  const contents = useMemo(() => {
    if (message == null) {
      return children;
    }
    if (React.isValidElement(message)) {
      return message;
    } else {
      const { message: text, responseText } = (message || {}) as any;
      return text || responseText || JSON.stringify(message);
    }
  }, [children, message]);

  useEffect(() => {
    if (hideAfter) {
      const timer = setTimeout(() => (onClose ? onClose() : null), hideAfter);
      return () => clearTimeout(timer);
    }
  }, [hideAfter, message, onClose]);

  return useObserver(() => (
    <div
      className={`fade show alert alert-${type || "info"} ${className}`}
      role="alert"
    >
      <button
        onClick={onClose}
        type="button"
        className="close"
        data-dismiss="alert"
        aria-label="Close"
      >
        <span aria-hidden="true">&times;</span>
      </button>
      {contents}
    </div>
  ));
};
