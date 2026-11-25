import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  LogOut,
  Copy,
  ExternalLink,
  Code2,
  Clock,
  CheckCircle2,
  Radio,
  Terminal,
  PowerOff,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import CreateRoomModal from "../components/CreateRoomModal";

const LANG_LABELS = {
  javascript: "JavaScript",
  python: "Python",
  cpp: "C++",
  java: "Java",
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | ended
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [userRes, roomsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/rooms"),
        ]);
        setUser(userRes.data);
        setRooms(roomsRes.data);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleCopyLink = (roomId) => {
    const inviteUrl = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  const handleEndRoom = async (roomId) => {
    try {
      const { data } = await api.patch(`/rooms/${roomId}/end`);
      setRooms((prev) =>
        prev.map((room) => (room.roomId === roomId ? data : room))
      );
      toast.success("Interview marked as ended");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end room");
    }
  };

  const handleRoomCreated = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
  };

  const filteredRooms = rooms.filter((room) => {
    if (filter === "active") return room.status === "active";
    if (filter === "ended") return room.status === "ended";
    return true;
  });

  const activeCount = rooms.filter((r) => r.status === "active").length;
  const endedCount = rooms.filter((r) => r.status === "ended").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          Loading workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight text-base">
              SyncHire
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-medium text-indigo-300">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm">
                <p className="font-medium text-zinc-200 leading-none">
                  {user?.name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Interview Rooms
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Create, manage, and launch live technical coding interviews.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            New Interview
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Total Rooms
            </p>
            <p className="text-2xl font-semibold text-white mt-2">
              {rooms.length}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Active Sessions
              </p>
              <Radio className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-semibold text-white mt-2">
              {activeCount}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Completed
              </p>
              <CheckCircle2 className="w-4 h-4 text-zinc-500" />
            </div>
            <p className="text-2xl font-semibold text-white mt-2">
              {endedCount}
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-8 border-b border-zinc-800/80 pb-3">
          {["all", "active", "ended"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filter === tab
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Rooms Grid */}
        {filteredRooms.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 p-12 text-center">
            <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-zinc-200 mt-4">
              No interview rooms found
            </h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Create your first interview room to generate an invite link for
              candidates.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {filteredRooms.map((room) => (
              <div
                key={room._id}
                className="group p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition flex flex-col justify-between gap-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-medium text-zinc-100 group-hover:text-white transition">
                        {room.title}
                      </h3>
                      <p className="text-xs font-mono text-zinc-500 mt-1">
                        ID: {room.roomId}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        room.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-800/80 text-zinc-400 border-zinc-700/60"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          room.status === "active"
                            ? "bg-emerald-400"
                            : "bg-zinc-500"
                        }`}
                      />
                      {room.status === "active" ? "Active" : "Ended"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-xs text-zinc-400">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                      {LANG_LABELS[room.language] || room.language}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {new Date(room.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between gap-2 pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(room.roomId)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </button>

                    {room.status === "active" && (
                      <button
                        onClick={() => handleEndRoom(room.roomId)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="End Interview"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                        End
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/room/${room.roomId}`)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-medium transition"
                  >
                    Enter Room
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}