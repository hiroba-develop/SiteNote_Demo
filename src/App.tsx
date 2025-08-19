import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { InvoicesProvider } from "./contexts/InvoicesContext";
import { ContractChangeProvider } from "./contexts/ContractChangeContext";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ContractChange from "./pages/ContractChange";
import Layout from "./components/Layout";
// Dashboard and Sample removed
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";
import { useEffect } from "react";
import { SiteProvider } from "./contexts/SiteContext";
import SiteManager from "./pages/SiteManager";

// 認証が必要なページをラップするコンポーネント
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading, shouldRedirectToLogin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
          <p className="text-sm text-blue-600 mt-2">(デモモード)</p>
        </div>
      </div>
    );
  }

  // cookieに「userId」キーが無い場合は、必ずlogin画面に遷移
  if (shouldRedirectToLogin) {
    return <Navigate to="/login" replace />;
  }

  // ユーザーが存在しない場合はログイン画面に遷移
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// メインアプリケーションコンポーネント
const AppContent: React.FC = () => {
  // 検索エンジンボット対策の強化
  useEffect(() => {
    // User-Agentベースでのボット検出
    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);

    if (isBot) {
      // ボットの場合は空のページを表示
      document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h1>会員限定サイト</h1>
            <p>このサイトは会員限定です。</p>
            <p>アクセスには認証が必要です。</p>
          </div>
        </div>
      `;
      return;
    }

    // メタタグの動的追加（念のため）
    const metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      document.head.appendChild(meta);
    }

    // デモモード用のページタイトル設定
    document.title = "SiteNote - ログイン認証デモ";
  }, []);

  return (
    <Routes>
      {/* ログイン画面 */}
      <Route path="/login" element={<Login />} />

      {/* 認証が必要なページ */}
      <Route path="/" element={<Navigate to="/projects" replace />} />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contract-change"
        element={
          <ProtectedRoute>
            <Layout>
              <ContractChange />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-manager"
        element={
          <ProtectedRoute>
            <Layout>
              <SiteManager />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  // Viteのベースパスを取得
  const basename = import.meta.env.BASE_URL;

  return (
    <AuthProvider>
      <ProjectsProvider>
        <InvoicesProvider>
          <ContractChangeProvider>
            <SiteProvider>
              <Router basename={basename}>
                <AppContent />
              </Router>
            </SiteProvider>
          </ContractChangeProvider>
        </InvoicesProvider>
      </ProjectsProvider>
    </AuthProvider>
  );
}

export default App;
