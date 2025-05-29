import { createContext, useContext, type ReactNode } from "react";
import { type ActivityDetailsContextType } from "./ActivityDetailsContext";

export const ActivityDetailsContext = createContext<
  ActivityDetailsContextType | undefined
>(undefined);

export type ActivityDetailsProviderProps = {
  children: ReactNode;
};

// Custom hook for consuming the context
export const useActivityDetailsContext = (): ActivityDetailsContextType => {
  const context = useContext(ActivityDetailsContext);

  if (context === undefined) {
    throw new Error(
      "useActivityDetailsContext must be used within an ActivityDetailsContextProvider"
    );
  }

  return context;
};
