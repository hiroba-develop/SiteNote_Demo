import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProjects } from "../contexts/ProjectsContext";
import { useState } from "react";

const formatCurrency = (v: number) => `${v.toLocaleString()} 円`;

const Projects = () => {
  const { projects, addProject } = useProjects();

  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState("");

  const summary = useMemo(() => {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalCost = projects.reduce((sum, p) => sum + p.actualCost, 0);
    const totalProfit = totalBudget - totalCost;
    const margin = totalBudget ? (totalProfit / totalBudget) * 100 : 0;
    const variance = totalBudget ? ((totalBudget - totalCost) / totalBudget) * 100 : 0;
    return { totalBudget, totalCost, totalProfit, margin, variance };
  }, [projects]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">全工事一覧</h1>

      {/* 新規工事追加 */}
      <div className="bg-white p-4 shadow rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-2">新規工事追加</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            className="border rounded p-2"
            placeholder="工事名"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="予算"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
          />
          <button
            onClick={() => {
              const budgetNum = parseInt(newBudget, 10);
              if (!newName.trim() || isNaN(budgetNum) || budgetNum <= 0) return;
              addProject({ name: newName, budget: budgetNum, actualCost: 0, invoicesTotal: 0, receiptsIssued: 0, costBreakdown: [] });
              setNewName("");
              setNewBudget("");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2"
          >
            追加
          </button>
        </div>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">総予算</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.totalBudget)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">総実コスト</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.totalCost)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">総粗利益</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(summary.totalProfit)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">利益率</p>
          <p className="text-xl font-bold text-gray-800">{summary.margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* 一覧テーブル */}
      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工事名</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">予算</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">実コスト</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">粗利益</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">利益率</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">予実差異%</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">請求/領収</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((p) => {
              const profit = p.budget - p.actualCost;
              const margin = p.budget ? (profit / p.budget) * 100 : 0;
              const variance = p.budget ? ((p.budget - p.actualCost) / p.budget) * 100 : 0;
              const unissued = p.invoicesTotal - p.receiptsIssued;
              return (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">
                    <Link to={`/projects/${p.id}`}>{p.name}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(p.budget)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(p.actualCost)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(profit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{margin.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{variance.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {unissued > 0 ? (
                      <a href={`/invoices?projectId=${p.id}`} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200">
                        未完了 {unissued}
                      </a>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        完了
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;
