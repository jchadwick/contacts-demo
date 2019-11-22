import React from "react";
import { StretchBox } from "./StretchBox";

export const Loading = () => (
  <StretchBox>
    <div className="spinner-border text-primary" role="status">
      <span className="sr-only">Loading...</span>
    </div>
  </StretchBox>
);
