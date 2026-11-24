import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Security Guard (/api/auth/me) ko check kar rahe hain
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        // Token nahi hai ya expire ho gaya -> wapas login par bhejo
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold">SyncHire Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-indigo-400 font-medium">{user.name}</span> ({user.email})
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-600/80 text-sm font-medium transition"
        >
          Logout
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-10 p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center">
        <p className="text-slate-300">
          Auth 100% Working! Next step mein hum yahan <strong>Create Interview Room</strong> ka button lagayenge.
        </p>
      </div>
    </div>
  );
}