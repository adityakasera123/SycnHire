import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Code2,
  Users,
  Terminal,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        setRoom(data);
      } catch (err) {
        setError(err.response?.data?.message || "Interview room not found");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Room link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-sm gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        Joining interview room...
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
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Workspace Bar */}
      <header className="h-14 px-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">
                {room.title}
              </h1>
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

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white transition"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Invite
          </button>
        </div>
      </header>

      {/* Workspace Body (Phase 3 mein yahan Monaco Editor + Video aayega) */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full p-8 rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-base font-semibold text-white mt-4">
            Room Ready: {room.title}
          </h2>
          <p className="text-sm text-zinc-400 mt-1.5">
            Phase 2 complete! Next, we will plug the{" "}
            <span className="text-indigo-400 font-medium">
              Monaco Code Editor
            </span>{" "}
            and{" "}
            <span className="text-indigo-400 font-medium">
              Real-time Socket.io Sync
            </span>{" "}
            right here.
          </p>
        </div>
      </main>
    </div>
  );
}