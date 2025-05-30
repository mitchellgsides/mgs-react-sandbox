import { useContext } from "react";
import { ActivityDetailsContext } from "./ActivityDetailsContext";
import type { ActivityDetailsContextType } from "./ActivityDetailsContext";

// Custom hook for consuming the context
export const useActivityDetailsContext = (): ActivityDetailsContextType => {
  const context = useContext(ActivityDetailsContext);

  if (context === undefined || context === null) {
    throw new Error(
      "useActivityDetailsContext must be used within an ActivityDetailsContextProvider"
    );
  }

  return context as ActivityDetailsContextType;
};
