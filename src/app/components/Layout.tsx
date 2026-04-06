import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Bell,
  User,
  MessageSquare,
  Activity,
  PenLine,
  ChevronLeft,
  ChevronRight,
  Heart,
  LogOut,
  Menu,
  X,
  BarChart2,
  Palette,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme, THEME_COLORS } from "../contexts/ThemeContext";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/upload", icon: Upload, label: "Upload Report" },
  { path: "/metrics", icon: Activity, label: "Health Metrics" },
  { path: "/reports", icon: FileText, label: "Report History" },
  { path: "/alerts", icon: Bell, label: "Health Alerts" },
  { path: "/manual-entry", icon: PenLine, label: "Manual Entry" },
  { path: "/ai-assistant", icon: MessageSquare, label: "AI Assistant" },
  { path: "/analytics", icon: BarChart2, label: "Analytics" },
  { path: "/profile", icon: User, label: "My Profile" },
];

export function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { themeColor, setThemeColor, setCustomColor, darkMode, toggleDarkMode } = useTheme();

  const currentPage = navItems.find((item) =>
    item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatarInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "HV";

  return (
    <div
      className="flex h-screen overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: "var(--hv-bg)" }}
    >
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 flex flex-col border-r shadow-xl
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          backgroundColor: "var(--hv-surface)",
          borderColor: "var(--hv-border)",
        }}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b ${collapsed ? "justify-center" : ""}`}
          style={{ borderColor: "var(--hv-border)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${themeColor.primary}, ${themeColor.primaryDark})` }}
          >
            <Heart className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-[15px] font-bold" style={{ color: "var(--hv-text)" }}>
                HealthVault
              </span>
              <p className="text-[11px] leading-none mt-0.5" style={{ color: "var(--hv-text-muted)" }}>
                Health Monitor
              </p>
            </div>
          )}
          <button
            className="ml-auto lg:hidden transition-colors"
            style={{ color: "var(--hv-text-muted)" }}
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-0.5">
            {(() => {
              const displayedItems = [...navItems];
              if (user?.gender === "female") {
                displayedItems.splice(5, 0, { path: "/cycle", icon: Heart, label: "Cycle Tracker" });
              }
              
              return displayedItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 relative group
                      ${collapsed ? "justify-center" : ""}
                    `}
                    style={
                      isActive
                        ? {
                            backgroundColor: themeColor.primaryLighter,
                            color: themeColor.primaryDark,
                          }
                        : {
                            color: "var(--hv-text-muted)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hv-surface-2)";
                        (e.currentTarget as HTMLElement).style.color = "var(--hv-text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--hv-text-muted)";
                      }
                    }}
                  >
                    <Icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: isActive ? themeColor.primary : undefined }}
                    />
                    {!collapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {/* Active indicator bar */}
                    {isActive && !collapsed && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                        style={{ backgroundColor: themeColor.primary }}
                      />
                    )}
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              });
            })()}
          </div>
        </nav>

        {/* Theme Controls */}
        <div className="px-2 pb-2" style={{ borderColor: "var(--hv-border)" }}>
          {/* Theme toggle button */}
          <button
            onClick={() => setThemePanelOpen(!themePanelOpen)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${collapsed ? "justify-center" : ""}`}
            style={{ color: "var(--hv-text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hv-surface-2)";
              (e.currentTarget as HTMLElement).style.color = "var(--hv-text)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "var(--hv-text-muted)";
            }}
            title="Change theme"
          >
            <Palette className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Customize Theme</span>}
          </button>

          {/* Theme panel */}
          {themePanelOpen && !collapsed && (
            <div
              className="mx-1 mb-2 p-3 rounded-xl border"
              style={{
                backgroundColor: "var(--hv-surface-2)",
                borderColor: "var(--hv-border)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--hv-text-muted)" }}>
                  Accent Color
                </p>
              </div>
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setThemeColor(color)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-110 shadow-sm"
                    style={{ backgroundColor: color.primary }}
                    title={color.label}
                  >
                    {themeColor.name === color.name && themeColor.primary === color.primary && (
                      <Check className="w-3.5 h-3.5 text-white drop-shadow" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
              {/* Custom color picker */}
              <div className="flex items-center gap-2 mb-3">
                <label
                  className="text-[11px] font-semibold uppercase tracking-wider flex-1"
                  style={{ color: "var(--hv-text-muted)" }}
                >
                  Custom Color
                </label>
                <div className="relative">
                  <input
                    type="color"
                    defaultValue={themeColor.primary}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border-0 cursor-pointer p-0.5 bg-transparent"
                    style={{ outline: themeColor.name === 'custom' ? `2px solid ${themeColor.primary}` : 'none' }}
                    title="Pick a custom color"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--hv-text-muted)" }}>
                  {darkMode ? "Dark Mode" : "Light Mode"}
                </p>
                <button
                  onClick={toggleDarkMode}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-105"
                  style={{ backgroundColor: themeColor.primaryLighter, color: themeColor.primary }}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Dark mode quick toggle when collapsed */}
          {collapsed && (
            <button
              onClick={toggleDarkMode}
              className="flex items-center justify-center w-full py-2 rounded-xl transition-all"
              style={{ color: "var(--hv-text-muted)" }}
              title={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Profile section */}
        <div
          className={`p-3 border-t ${collapsed ? "flex flex-col items-center gap-2" : ""}`}
          style={{ borderColor: "var(--hv-border)" }}
        >
          {!collapsed ? (
            <>
              <div
                className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors"
                style={{ color: "var(--hv-text)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--hv-surface-2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-md"
                  style={{ background: `linear-gradient(135deg, ${themeColor.primary}, ${themeColor.primaryDark})` }}
                >
                  {avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--hv-text)" }}>
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: "var(--hv-text-muted)" }}>
                    {user?.email || ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-1 flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-colors hover:bg-red-50 hover:text-red-600"
                style={{ color: "var(--hv-text-muted)" }}
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                style={{ background: `linear-gradient(135deg, ${themeColor.primary}, ${themeColor.primaryDark})` }}
              >
                {avatarInitials}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3.5 top-[72px] w-7 h-7 border rounded-full items-center justify-center shadow-md hover:shadow-lg transition-all"
          style={{
            backgroundColor: "var(--hv-surface)",
            borderColor: "var(--hv-border)",
            color: "var(--hv-text-muted)",
          }}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="border-b px-4 lg:px-6 py-4 flex items-center gap-4 flex-shrink-0 shadow-sm"
          style={{
            backgroundColor: "var(--hv-surface)",
            borderColor: "var(--hv-border)",
          }}
        >
          <button
            className="lg:hidden transition-colors"
            style={{ color: "var(--hv-text-muted)" }}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" style={{ color: "var(--hv-text)" }}>
              {currentPage?.label || "HealthVault"}
            </h1>
            <p className="text-xs hidden sm:block" style={{ color: "var(--hv-text-muted)" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {/* Color dot indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
              style={{
                backgroundColor: themeColor.primaryLighter,
                color: themeColor.primaryDark,
                borderColor: themeColor.ring,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: themeColor.primary }}
              />
              {themeColor.label}
            </div>

            <NavLink
              to="/alerts"
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ backgroundColor: "var(--hv-surface-2)", color: "var(--hv-text-muted)" }}
            >
              <Bell className="w-4 h-4" />
            </NavLink>
            <NavLink
              to="/profile"
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
                style={{
                  background: `linear-gradient(135deg, ${themeColor.primary}, ${themeColor.primaryDark})`,
                  outline: `3px solid ${themeColor.ring}`,
                }}
              >
                {avatarInitials}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold leading-tight" style={{ color: "var(--hv-text)" }}>
                  {user?.name || "User"}
                </p>
                <p className="text-[11px]" style={{ color: "var(--hv-text-muted)" }}>
                  View profile
                </p>
              </div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
