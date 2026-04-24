import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function AlbusDashboard() {
  const [stats, setStats] = useState({});
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, compRes] = await Promise.all([
        api.get("/albus/stats"),
        api.get("/albus/companies"),
      ]);
      setStats(statsRes.data);
      setCompanies(compRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleVerify = async (id) => {
    try {
      await api.post(`/albus/companies/${id}/verify`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const statCards = [
    { label: "Companies", value: stats.total_companies ?? 0, icon: "🏢", color: "from-indigo-500 to-blue-600" },
    { label: "Assessments", value: stats.total_assessments ?? 0, icon: "📝", color: "from-emerald-500 to-teal-600" },
    { label: "Students", value: stats.total_students ?? 0, icon: "🎓", color: "from-amber-500 to-orange-600" },
    { label: "Active Sessions", value: stats.active_sessions ?? 0, icon: "🔴", color: "from-red-500 to-pink-600" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Platform Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={card.label} className={`glass-card p-5 animate-fade-in stagger-${i + 1}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
                </div>
                <div className={`text-3xl p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-10`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Companies Table */}
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-white/5">
            <h3 className="text-lg font-semibold text-white">Registered Companies</h3>
          </div>
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading…</div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No companies registered yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Registered</th>
                    <th className="px-6 py-3">Assessments</th>
                    <th className="px-6 py-3">Students</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{c.company_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{c.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {c.registered_at ? new Date(c.registered_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{c.assessment_count}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{c.active_students}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${c.is_verified ? "badge-active" : "badge-draft"}`}>
                          {c.is_verified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleVerify(c.id)}
                          className={`btn-cool text-xs py-1.5 ${
                            c.is_verified
                              ? "text-red-400 border-red-500/20 hover:bg-red-500/10"
                              : "btn-cool-emerald"
                          }`}
                        >
                          {c.is_verified ? "Revoke" : "Verify"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
