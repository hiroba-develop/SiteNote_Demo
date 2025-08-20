import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProjects } from "../contexts/ProjectsContext";
// import type { CostItem } from "../contexts/ProjectsContext";
import { format } from "date-fns";
import { useContractChange } from "../contexts/ContractChangeContext";

const formatCurrency = (v: number) => `${v.toLocaleString()} 円`;

const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, addCostItem, updateProject } = useProjects();
  const project = projects.find((p) => p.id === projectId);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-gray-700 mb-4">工事が見つかりません。</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 underline">
          戻る
        </button>
      </div>
    );
  }

  const profit = project.budget - project.actualCost;
  const margin = project.budget ? (profit / project.budget) * 100 : 0;
  // const variance = project.budget ? ((project.budget - project.actualCost) / project.budget) * 100 : 0;

  const { drafts, approveDraft } = useContractChange();
  const projectDrafts = drafts.filter((d) => d.projectId === project.id);
  const fullWidthToHalf = (str: string) => str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  const approvedValueDelta = projectDrafts
    .filter((d) => d.approved)
    .reduce((sum, d) => {
      const m = d.draftText.match(/金額変更[:：]\s*([+-]?[0-9０-９,]+)/);
      if (m) {
        const numStr = fullWidthToHalf(m[1]).replace(/,/g, "");
        return sum + parseInt(numStr, 10);
      }
      return sum;
    }, 0);
  const revisedContract = project.budget + approvedValueDelta;

  const handleAdd = () => {
    const amt = parseInt(amount, 10);
    if (!desc.trim() || isNaN(amt) || amt <= 0) return;
    addCostItem(project.id, { description: desc, amount: amt, category });
    setDesc("");
    setAmount("");
    setCategory("");
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/projects" className="text-sm text-blue-600 underline mr-4">
          ← 工事一覧へ戻る
        </Link>
        <Link to={`/site-manager?projectId=${project.id}`} className="text-sm text-blue-600 underline">
          現場管理へ ➔
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-4">{project.name}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">予算</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(project.budget)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">実コスト</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(project.actualCost)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">粗利益</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(profit)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-sm text-gray-500">利益率</p>
          <p className="text-xl font-bold text-gray-800">{margin.toFixed(1)}%</p>
        </div>
      </div>

      {/* コスト内訳入力 */}
      <div className="bg-white p-6 shadow rounded-lg mb-6">
        <h2 className="text-lg font-medium mb-4">原価内訳追加</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="項目名"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="border rounded p-2 col-span-2"
          />
          <input
            type="number"
            placeholder="金額"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="text"
            placeholder="カテゴリ (任意)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded p-2"
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-3 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
        >
          追加
        </button>
      </div>

      {/* 内訳テーブル */}
      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">項目</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">金額</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {project.costBreakdown.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.category || "-"}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(c.amount)}</td>
              </tr>
            ))}
            {project.costBreakdown.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  まだ原価内訳がありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 契約情報 & 変更履歴 */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 契約情報 */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium mb-4">契約情報</h2>
          <p className="text-sm text-gray-500 mb-2">契約金額</p>
          <p className="text-xl font-bold text-gray-800 mb-4">{revisedContract.toLocaleString()} 円</p>
          {approvedValueDelta !== 0 && (
            <p className="text-sm text-gray-600">(変更累計 {approvedValueDelta >= 0 ? "+" : ""}{approvedValueDelta.toLocaleString()} 円)</p>
          )}
        </div>

        {/* 変更履歴 */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium mb-4">契約変更履歴</h2>
          {projectDrafts.length === 0 ? (
            <p className="text-sm text-gray-500">まだ変更ドラフトがありません。</p>
          ) : (
            <ul className="space-y-4">
              {projectDrafts.map((d) => (
                <li key={d.id} className="border rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{new Date(d.createdAt).toLocaleString()}</span>
                    {d.approved ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">承認済</span>
                    ) : (
                      <button
                        onClick={() => {
                          // 金額変更抽出
                          const m = d.draftText.match(/金額変更[:：]\s*([+-]?[0-9０-９,]+)/);
                          if (m) {
                            const numStr = fullWidthToHalf(m[1]).replace(/,/g, "");
                            const delta = parseInt(numStr, 10);
                            updateProject({ ...project, budget: project.budget + delta });
                          }
                          approveDraft(d.id);
                        }}
                        className="text-xs px-2 py-1 rounded bg-blue-600 text-white"
                      >
                        承認
                      </button>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-800">{d.draftText}</pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        最終更新: {format(new Date(), "yyyy/MM/dd HH:mm")}
      </div>
    </div>
  );
};

export default ProjectDetail;
