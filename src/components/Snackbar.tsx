import React, { PropsWithChildren } from "react";

type SnackbarType = "primary" | "secondary" | "success" | "danger";

interface SnackbarProps {
  type?: SnackbarType;
  onClose(): void;
}

export const Snackbar = ({
  children,
  type = "primary",
  onClose
}: PropsWithChildren<SnackbarProps>) => {
  React.useEffect(() => {
    // const timer = setTimeout(onClose, 1500);
    // return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`alert alert-${type}`} role="alert">
      {children}
    </div>
  );
};
