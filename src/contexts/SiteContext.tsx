import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface SiteTask {
  id: string;
  projectId: string;
  title: string;
  worker: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
  plannedCost?: number;
  actualCost?: number;
  completed: boolean;
}

interface SiteContextType {
  tasks: SiteTask[];
  addTask: (task: Omit<SiteTask, "id" | "completed">) => void;
  toggleComplete: (taskId: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

const defaultTasks: SiteTask[] = [
  {
    id: "T-1",
    projectId: "P-001",
    title: "基礎配筋検査",
    worker: "田中",
    startDate: "2024-08-20",
    endDate: "2024-08-20",
    plannedCost: 200000,
    actualCost: 0,
    completed: false,
  },
  {
    id: "T-2",
    projectId: "P-002",
    title: "足場解体",
    worker: "佐藤",
    startDate: "2024-08-22",
    endDate: "2024-08-23",
    plannedCost: 500000,
    actualCost: 480000,
    completed: true,
  },
];

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<SiteTask[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("siteTasks");
    if (stored) {
      try {
        const parsed: SiteTask[] = JSON.parse(stored);
        if (parsed.length) {
          setTasks(parsed);
          return;
        }
      } catch {}
    }
    setTasks(defaultTasks);
  }, []);

  useEffect(() => {
    localStorage.setItem("siteTasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (task: Omit<SiteTask, "id" | "completed">) => {
    const newTask: SiteTask = { ...task, id: `T-${Date.now()}`, completed: false };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleComplete = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <SiteContext.Provider value={{ tasks, addTask, toggleComplete }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = (): SiteContextType => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
};
