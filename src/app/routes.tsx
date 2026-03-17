import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { UploadReport } from "./pages/UploadReport";
import { MetricsOverview } from "./pages/MetricsOverview";
import { MetricDetail } from "./pages/MetricDetail";
import { AIAssistant } from "./pages/AIAssistant";
import { Profile } from "./pages/Profile";
import { ReportHistory } from "./pages/ReportHistory";
import { Alerts } from "./pages/Alerts";
import { ManualEntry } from "./pages/ManualEntry";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Analytics } from "./pages/Analytics";
import { ProtectedRoute } from "./components/ProtectedRoute";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  {
    path: "/",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "upload", Component: UploadReport },
      { path: "metrics", Component: MetricsOverview },
      { path: "metrics/:id", Component: MetricDetail },
      { path: "reports", Component: ReportHistory },
      { path: "alerts", Component: Alerts },
      { path: "manual-entry", Component: ManualEntry },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "analytics", Component: Analytics },
      { path: "profile", Component: Profile },
    ],
  },
]);
