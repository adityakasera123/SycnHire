import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Code2,
  Users,
  Terminal,
  AlertCircle,
  ShieldCheck,
  User,
  LogOut,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Candidate lobby states
  const [candidateName, setCandidateName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  // Check karo ki kya browser mein logged-in user hai
  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        setRoom(data);

        // Agar logged-in user hi is room ka host hai, toh seedha enter kara do
        if (currentUser && data.host?._id === currentUser._id) {
          setHasJoined(true);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Interview room not found");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const isHost = Boolean(currentUser && room?.host?._id === currentUser._id);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied!");
  };

  const handleCandidateJoin = (e) => {
    e.preventDefault();
    if (!candidateName.trim()) return;
    setHasJoined(true);
    toast.success(`Joined as ${candidateName.trim()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        Loading interview room...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-white mt-4">{error}</h2>
          <p className="text-sm text-zinc-400 mt-1">
            The invite link may be invalid or expired.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // CANDIDATE LOBBY (Sirf non-host users ko pehle yeh screen dikhegi)
  if (!isHost && !hasJoined) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">SyncHire</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <User className="w-3 h-3" />
            Candidate Invite
          </span>

          <h1 className="text-xl font-semibold text-white mt-3">
            {room.title}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Hosted by <span className="text-zinc-200">{room.host?.name}</span> •{" "}
            <span className="font-mono text-xs">{room.roomId}</span>
          </p>

          <form onSubmit={handleCandidateJoin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Your Full Name
              </label>
              <input
                type="text"
                required
                autoFocus
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
            >
              Join Interview Room
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN WORKSPACE (Role ke hisaab se alag UI)
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Workspace Bar */}
      <header className="h-14 px-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back to Dashboard sirf Interviewer ko dikhega */}
          {isHost && (
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white leading-none">
                  {room.title}
                </h1>
                {/* Clear Role Badge */}
                {isHost ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Interviewer
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <User className="w-3 h-3" />
                    Candidate ({candidateName})
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-zinc-500 mt-0.5">
                {room.roomId} • Host: {room.host?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-300">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            {room.language}
          </span>

          {/* Interviewer ko Copy Invite, Candidate ko Leave Button */}
          {isHost ? (
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Invite
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-xs font-medium text-zinc-300 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Leave
            </button>
          )}
        </div>
      </header>

      {/* Workspace Body */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full p-8 rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-white mt-4">
            {isHost
              ? `Welcome, ${currentUser.name} (Interviewer)`
              : `Welcome, ${candidateName} (Candidate)`}
          </h2>
          <p className="text-sm text-zinc-400 mt-1.5">
            {isHost
              ? "Share the invite link with your candidate. Next, we'll plug in the live Monaco Code Editor here."
              : "You are connected to the interview room. Waiting for the live code editor in Phase 3."}
          </p>
        </div>
      </main>
    </div>
  );
}