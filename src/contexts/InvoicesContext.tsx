import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface Invoice {
  id: string;
  projectId: string;
  customer: string;
  amount: number; // 税抜
  issueDate: string; // ISO 8601 format
  receiptIssued: boolean;
}

// 初期モックデータ
const defaultInvoices: Invoice[] = [
  {
    id: "INV-001",
    projectId: "P-001",
    customer: "株式会社サンプル建設",
    amount: 1_200_000,
    issueDate: "2024-08-18",
    receiptIssued: false,
  },
  {
    id: "INV-002",
    projectId: "P-002",
    customer: "有限会社デモ電気",
    amount: 850_000,
    issueDate: "2024-08-10",
    receiptIssued: true,
  },
];

interface InvoicesContextType {
  invoices: Invoice[];
  issueReceipt: (id: string) => void;
}

const InvoicesContext = createContext<InvoicesContextType | undefined>(undefined);

export const InvoicesProvider = ({ children }: { children: ReactNode }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // 初期化: localStorage から取得 or デフォルト
  useEffect(() => {
    const stored = localStorage.getItem("invoices");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((inv: any) => ({
            projectId: inv.projectId ?? "P-001",
            ...inv,
          }));
          setInvoices(migrated);
          return;
        }
      } catch {
        // ignore
      }
    }
    setInvoices(defaultInvoices);
  }, []);

  // 更新時に保存
  useEffect(() => {
    if (invoices.length) {
      localStorage.setItem("invoices", JSON.stringify(invoices));
    }
  }, [invoices]);

  const issueReceipt = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, receiptIssued: true } : inv
      )
    );
  };

  return (
    <InvoicesContext.Provider value={{ invoices, issueReceipt }}>
      {children}
    </InvoicesContext.Provider>
  );
};

export const useInvoices = (): InvoicesContextType => {
  const ctx = useContext(InvoicesContext);
  if (!ctx) throw new Error("useInvoices must be used within InvoicesProvider");
  return ctx;
};
