import React from "react";

export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => any,
  addOptions?: boolean | AddEventListenerOptions,
  removeOptions?: boolean | AddEventListenerOptions
): void {
  React.useEffect(() => {
    window.addEventListener(type, listener, addOptions);

    return () => {
      window.removeEventListener(type, listener, removeOptions);
    };
  }, [type, listener, addOptions, removeOptions]);
}
