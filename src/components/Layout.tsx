import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useInvoices } from "../contexts/InvoicesContext";
import { FiSettings } from "react-icons/fi";

// サイドバーのナビゲーションアイテム
const navigationItems = [
  { name: "工事一覧", path: "/projects" },
  { name: "現場管理", path: "/site-manager" },
  { name: "契約変更", path: "/contract-change" },
  { name: "請求書", path: "/invoices" },
];

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const { invoices } = useInvoices();
  const unissuedCount = invoices.filter((inv) => !inv.receiptIssued).length;
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ログアウト処理
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="ml-2 text-xl font-bold">SiteNote</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="hidden md:ml-4 md:flex md:items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="mr-3 text-sm font-medium text-gray-700">
                      {user?.name}
                    </span>
                    <Link to="/settings" className="mr-2 text-gray-600 hover:text-blue-600">
                      <FiSettings size={18} />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>
              <div className="ml-3 md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <span className="sr-only">メニューを開く</span>
                  {/* ハンバーガーメニューアイコン */}
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    location.pathname === item.path
                      ? "border-blue-500 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  }`}
                >
                  <span className="flex items-center">
                    {item.name}
                    {item.path === "/invoices" && unissuedCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                        {unissuedCount}
                      </span>
                    )}
                  </span>
                </Link>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {user?.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/settings"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  <span className="flex items-center">
                    <FiSettings className="mr-2" /> 設定
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* サイドバー（デスクトップ） */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center">
                      {item.name}
                      {item.path === "/invoices" && unissuedCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-600 text-white">
                          {unissuedCount}
                        </span>
                      )}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
