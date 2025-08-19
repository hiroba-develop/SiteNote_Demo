import { useMemo, useState } from "react";
import { useSite } from "../contexts/SiteContext";
import { useProjects } from "../contexts/ProjectsContext";
import { useSearchParams } from "react-router-dom";

const SiteManager = () => {
  const { tasks, addTask, toggleComplete } = useSite();
  const { projects } = useProjects();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedProjectId = searchParams.get("projectId") || projects[0]?.id;

  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));

  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === selectedProjectId), [tasks, selectedProjectId]);

  const [title, setTitle] = useState("");
  const [worker, setWorker] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [plannedCost, setPlannedCost] = useState("");
  const [actualCost, setActualCost] = useState("");

  const handleAdd = () => {
    if (!title.trim() || !selectedProjectId) return;
    addTask({
      projectId: selectedProjectId,
      title,
      worker,
      startDate: start,
      endDate: end,
      plannedCost: plannedCost ? parseInt(plannedCost, 10) : undefined,
      actualCost: actualCost ? parseInt(actualCost, 10) : undefined,
    });
    setTitle("");
    setWorker("");
    setStart("");
    setEnd("");
    setPlannedCost("");
    setActualCost("");
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">現場管理</h1>

      {/* プロジェクト選択 */}
      <div className="mb-6">
        <label className="mr-2 text-sm">工事選択:</label>
        <select
          className="border rounded p-2"
          value={selectedProjectId}
          onChange={(e) => setSearchParams({ projectId: e.target.value })}
        >
          {projectOptions.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      {/* タスク追加フォーム */}
      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">タスク追加</h2>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
          <input
            className="border rounded p-2"
            placeholder="作業内容"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="border rounded p-2"
            placeholder="担当職人"
            value={worker}
            onChange={(e) => setWorker(e.target.value)}
          />
          <input
            type="date"
            className="border rounded p-2"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="date"
            className="border rounded p-2"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="予定原価"
            value={plannedCost}
            onChange={(e) => setPlannedCost(e.target.value)}
          />
          <input
            type="number"
            className="border rounded p-2"
            placeholder="実績原価"
            value={actualCost}
            onChange={(e) => setActualCost(e.target.value)}
          />
          <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2">
            追加
          </button>
        </div>
      </div>

      {/* タスクリスト */}
      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完了</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作業内容</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">担当</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">開始</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">終了</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">予定原価</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">実績原価</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectTasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleComplete(t.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.worker || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.startDate || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.endDate || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{t.plannedCost ? `${t.plannedCost.toLocaleString()} 円` : "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{t.actualCost ? `${t.actualCost.toLocaleString()} 円` : "-"}</td>
              </tr>
            ))}
            {projectTasks.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  まだタスクがありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SiteManager;
