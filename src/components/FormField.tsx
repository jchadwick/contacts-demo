import React from "react";
import { useObserver } from "mobx-react-lite";

export const FormField = ({
  children = null,
  label,
  model,
  name,
  type = "text",
  field = "value",
  ...props
}) => {
  const Component: any =
    ["select", "textarea"].indexOf(type) > -1 ? type : "input";

  return useObserver(() => (
    <div className="form-group">
      <label>{label}</label>
      <Component
        children={children}
        type={type}
        className="form-control"
        placeholder={label}
        {...props}
        value={model[name] || ""}
        onChange={evt => (model[name] = evt.target[field])}
      />
    </div>
  ));
};
