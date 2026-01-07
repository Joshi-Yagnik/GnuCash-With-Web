import { createContext, useContext, ReactNode } from "react";
import { useFirestoreData } from "@/hooks/useFirestoreData";

type FinanceContextType = ReturnType<typeof useFirestoreData>;

const FinanceContext = createContext<FinanceContextType | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const financeData = useFirestoreData();

  return (
    <FinanceContext.Provider value={financeData}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
