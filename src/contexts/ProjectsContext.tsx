import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface Project {
  id: string;
  name: string;
  budget: number; // 予算 (売上)
  actualCost: number; // 実コスト
  invoicesTotal: number; // 請求書発行総件数
  receiptsIssued: number; // 領収書発行済件数
  costBreakdown: CostItem[];
}

export interface CostItem {
  id: string;
  description: string;
  amount: number;
  category?: string;
}

interface ProjectsContextType {
  projects: Project[];
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (p: Project) => void;
  addCostItem: (projectId: string, item: Omit<CostItem, "id">) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

const defaultProjects: Project[] = [
  {
    id: "P-001",
    name: "○○ビル新築工事",
    budget: 50000000,
    actualCost: 32000000,
    invoicesTotal: 5,
    receiptsIssued: 3,
    costBreakdown: [
      { id: "C-1", description: "基礎工事", amount: 12000000, category: "土工" },
      { id: "C-2", description: "構造躯体", amount: 8000000, category: "躯体" },
      { id: "C-3", description: "仕上げ", amount: 12000000, category: "仕上げ" },
    ],
  },
  {
    id: "P-002",
    name: "△△マンション改修工事",
    budget: 12000000,
    actualCost: 9000000,
    invoicesTotal: 2,
    receiptsIssued: 2,
    costBreakdown: [],
  },
  {
    id: "P-003",
    name: "市立小学校耐震補強",
    budget: 30000000,
    actualCost: 28000000,
    invoicesTotal: 3,
    receiptsIssued: 1,
    costBreakdown: [],
  },
];

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
     const stored = localStorage.getItem("projects");
    if (stored) {
      try {
        const parsed: Project[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // costBreakdown プロパティが無い旧データ用のマイグレーション
          const migrated = parsed.map((p) => ({
            ...p,
            costBreakdown: p.costBreakdown ?? [],
          }));
          setProjects(migrated);
          return;
        }
      } catch {
        // パースエラー時はデフォルト読み込み
      }
    }
    setProjects(defaultProjects);
  }, []);

  useEffect(() => {
    localStorage.setItem("projects", JSON.stringify(projects));
  }, [projects]);

  const addProject = (p: Omit<Project, "id">) => {
    const newProject: Project = { ...p, id: `P-${Date.now()}` };
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addCostItem = (projectId: string, item: Omit<CostItem, "id">) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const newItem: CostItem = { ...item, id: `C-${Date.now()}` };
        const newBreakdown = [...p.costBreakdown, newItem];
        const newActual = newBreakdown.reduce((s, c) => s + c.amount, 0);
        return { ...p, costBreakdown: newBreakdown, actualCost: newActual };
      })
    );
  };

  return (
    <ProjectsContext.Provider value={{ projects, addProject, updateProject, addCostItem }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectsProvider");
  return ctx;
};
