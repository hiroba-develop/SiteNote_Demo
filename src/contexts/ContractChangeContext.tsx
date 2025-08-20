import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface ContractDraft {
  id: string;
  projectId: string;
  createdAt: string; // ISO date
  transcript: string;
  draftText: string;
  approved: boolean;
}

const ContractChangeContext = createContext<
  | {
      drafts: ContractDraft[];
      addDraft: (draft: Omit<ContractDraft, "id" | "createdAt" | "approved">) => void;
      approveDraft: (id: string) => void;
    }
  | undefined
>(undefined);

export const ContractChangeProvider = ({ children }: { children: ReactNode }) => {
  const [drafts, setDrafts] = useState<ContractDraft[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("contractDrafts");
    if (stored) {
      try {
        const parsed: ContractDraft[] = JSON.parse(stored);
        const migrated = parsed.map((d) => ({
          ...d,
          projectId: (d as any).projectId ?? "P-001",
        }));
        setDrafts(migrated);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("contractDrafts", JSON.stringify(drafts));
  }, [drafts]);

  const addDraft = (data: Omit<ContractDraft, "id" | "createdAt" | "approved">) => {
    const newDraft: ContractDraft = {
      ...data,
      projectId: data.projectId,
      id: `DRAFT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      approved: false,
    };
    setDrafts((prev) => [newDraft, ...prev]);
  };

  const approveDraft = (id: string) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, approved: true } : d)));
  };

  return (
    <ContractChangeContext.Provider value={{ drafts, addDraft, approveDraft }}>
      {children}
    </ContractChangeContext.Provider>
  );
};

export const useContractChange = () => {
  const ctx = useContext(ContractChangeContext);
  if (!ctx) throw new Error("useContractChange must be used within ContractChangeProvider");
  return ctx;
};
