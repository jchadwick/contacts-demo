import { useLocalStore } from "mobx-react-lite";

export const useStore = <T>(StoreType: { new (): T }) =>
  useLocalStore(() => new StoreType());
