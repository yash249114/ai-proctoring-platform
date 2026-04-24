import { useNavigate } from "react-router-dom";

const NAV_CONFIG = {
  albus: {
    label: "Albus Admin",
    color: "from-indigo-500 to-purple-600",
    links: [{ to: "/albus/dashboard", label: "Dashboard" }],
  },
  company: {
    label: "",
    color: "from-emerald-500 to-teal-600",
    links: [
      { to: "/company/dashboard", label: "Dashboard" },
      { to: "/company/questions/create", label: "Questions" },
    ],
  },
  student: {
    label: "",
    color: "from-blue-500 to-cyan-600",
    links: [{ to: "/student/dashboard", label: "Dashboard" }],
  },
};

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "albus";
  const companyName = localStorage.getItem("company_name") || "";
  const studentName = localStorage.getItem("student_name") || "";
  const config = NAV_CONFIG[role] || NAV_CONFIG.albus;

  const displayName = role === "company" ? companyName : role === "student" ? studentName : "ALBUS ADMIN";
  const logoText = role === "albus" ? "ALBUSPRIMIS" : "ALBUS";

  const logout = () => {
    localStorage.clear();
    if (role === "albus") navigate("/albus/login");
    else if (role === "company") navigate("/company/login");
    else navigate("/student/login");
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <h1
              className={`text-xl font-bold tracking-tighter bg-gradient-to-r ${config.color} bg-clip-text text-transparent cursor-pointer`}
              onClick={() => navigate(config.links[0].to)}
            >
              {logoText}
            </h1>
            <div className="hidden sm:flex items-center gap-1">
              {config.links.map((l) => (
                <button
                  key={l.to}
                  onClick={() => navigate(l.to)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">{displayName}</span>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
