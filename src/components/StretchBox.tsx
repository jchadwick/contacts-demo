import clsx from "clsx";
import React, { PropsWithChildren } from "react";

export const StretchBox = ({
  className,
  children
}: PropsWithChildren<{ className?: string }>) => (
  <div
    style={{ minHeight: "10em" }}
    className={clsx(
      className,
      "d-flex flex-column justify-content-center align-items-center"
    )}
  >
    {children}
  </div>
);
