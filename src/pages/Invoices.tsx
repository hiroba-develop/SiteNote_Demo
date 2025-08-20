import { jsPDF } from "jspdf";
import { format, parseISO } from "date-fns";
import { useInvoices } from "../contexts/InvoicesContext";
import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";
import type { Invoice } from "../contexts/InvoicesContext";

const formatCurrency = (value: number) => `${value.toLocaleString()} 円`;

const Invoices = () => {
  const { invoices, issueReceipt } = useInvoices();
  const [searchParams] = useSearchParams();
  const projectIdFilter = searchParams.get("projectId");

  const filtered = projectIdFilter ? invoices.filter((i) => i.projectId === projectIdFilter) : invoices;

  const handleResetDemo = useCallback(() => {
    ["invoices", "contractDrafts", "projects", "siteTasks"].forEach((k) => localStorage.removeItem(k));
    window.location.reload();
  }, []);

  const generateReceiptPdf = (invoice: Invoice) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("領収書", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const issueDate = format(new Date(), "yyyy年MM月dd日");

    doc.text(`発行日: ${issueDate}`, 20, 35);
    doc.text(`請求書番号: ${invoice.id}`, 20, 45);
    doc.text(`御得意先: ${invoice.customer}`, 20, 55);

    // 金額 (税込み10% for demo)
    const tax = Math.round(invoice.amount * 0.1);
    const total = invoice.amount + tax;

    doc.text(`金額 (税抜): ${formatCurrency(invoice.amount)}`, 20, 70);
    doc.text(`消費税 (10%): ${formatCurrency(tax)}`, 20, 80);
    doc.text(`合計金額: ${formatCurrency(total)}`, 20, 90);

    doc.text("備考: 入金ありがとうございました。", 20, 110);

    doc.save(`${invoice.id}_receipt.pdf`);
  };

  const handleIssueReceipt = (id: string) => {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return;

    generateReceiptPdf(invoice as Invoice);
    issueReceipt(id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">請求書一覧</h1>
        <button onClick={handleResetDemo} className="text-sm text-gray-500 underline hover:text-blue-600">デモデータをリセット</button>
      </div>

      <div className="bg-white shadow overflow-x-auto rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                番号
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                得意先
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                金額 (税抜)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                発行日
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                領収書
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inv.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {inv.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(inv.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(parseISO(inv.issueDate), "yyyy/MM/dd")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  {inv.receiptIssued ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      発行済
                    </span>
                  ) : (
                    <button
                      onClick={() => handleIssueReceipt(inv.id)}
                      className="relative inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      領収書発行
                      <span className="absolute -top-1 -right-1 inline-block h-3 w-3 rounded-full bg-red-500"></span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
