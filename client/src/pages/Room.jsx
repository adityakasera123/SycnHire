import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
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
  Lock,
  Play,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";
import OutputTerminal from "../components/OutputTerminal";
import RoomSidebar from "../components/RoomSidebar";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
];

export default function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Candidate lobby states
const storageKey = `synchire_candidate_${roomId}`;
  const savedCandidate = sessionStorage.getItem(storageKey) || "";

  const [candidateName, setCandidateName] = useState(savedCandidate);
  const [hasJoined, setHasJoined] = useState(Boolean(savedCandidate));

  // Live Editor & Socket states
  const [code, setCode] = useState("// Write your code here...\n");
  const [language, setLanguage] = useState("javascript");
  const [participants, setParticipants] = useState([]);

  // Code Execution Output states
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([]);

  const socketRef = useRef(null);
  const isRemoteUpdate = useRef(false);

  const storedUser = localStorage.getItem("user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  // 1. Fetch Room Details from MongoDB
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        setRoom(data);
        setCode(data.code || "// Write your code here...\n");
        setLanguage(data.language || "javascript");

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
  const isReadOnly = room?.status === "ended";

  // 2. Connect to Socket.io once user has joined the room
  useEffect(() => {
    if (!hasJoined || !room) return;

    const socket = io("http://localhost:8000");
    socketRef.current = socket;

    const userName = isHost ? currentUser.name : candidateName.trim();
    const userRole = isHost ? "Interviewer" : "Candidate";

    socket.emit("join-room", { roomId, name: userName, role: userRole });

    socket.on("participants-update", (list) => {
      setParticipants(list);
    });

    socket.on("user-joined", ({ name, role }) => {
      toast.success(`${name} (${role}) joined the room`);
    });

    socket.on("user-left", ({ name }) => {
      toast(`${name} left the room`, { icon: "👋" });
    });

    socket.on("code-update", (newCode) => {
      isRemoteUpdate.current = true;
      setCode(newCode);
    });

    socket.on("language-update", (newLang) => {
      setLanguage(newLang);
      toast(`Language switched to ${newLang.toUpperCase()}`, { icon: "💻" });
    });

    socket.on("output-update", ({ output: newOutput, isError: newIsError }) => {
      setOutput(newOutput);
      setIsError(newIsError);
    });
    socket.on("receive-message", (msg) => {
  setMessages((prev) => [...prev, msg]);
});

    return () => {
      socket.disconnect();
    };
  }, [hasJoined, roomId, room?._id]);

  // 3. Handle Local Code Typing
  const handleCodeChange = (value) => {
    if (isReadOnly) return;

    const updatedCode = value ?? "";
    setCode(updatedCode);

    // Agar yeh update server se aaya tha, toh wapas emit mat karo
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    socketRef.current?.emit("code-change", { roomId, code: updatedCode });
  };

  // 4. Handle Language Change
  const handleLanguageChange = (e) => {
    if (isReadOnly) return;
    const newLang = e.target.value;
    setLanguage(newLang);
    socketRef.current?.emit("language-change", { roomId, language: newLang });
  };

  // 5. Run Code via Backend (Piston API) & Sync Output
  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setOutput("");
    setIsError(false);

    try {
      const { data } = await api.post("/code/run", { language, code });
      const finalOutput = data.output || "(No output)";
      setOutput(finalOutput);
      setIsError(data.isError);

      // Doosre user ki screen par bhi output sync kar do
      socketRef.current?.emit("code-output", {
        roomId,
        output: finalOutput,
        isError: data.isError,
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to execute code";
      setOutput(errMsg);
      setIsError(true);
      toast.error(errMsg);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendMessage = (message) => {
  const senderName = isHost ? currentUser.name : candidateName.trim();
  const senderRole = isHost ? "Interviewer" : "Candidate";
  socketRef.current?.emit("send-message", {
    roomId,
    message,
    senderName,
    senderRole,
  });
};

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied!");
  };

const handleCandidateJoin = (e) => {
    e.preventDefault();
    const trimmed = candidateName.trim();
    if (!trimmed) return;
    sessionStorage.setItem(storageKey, trimmed);
    setHasJoined(true);
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
            onClick={() => {
                sessionStorage.removeItem(storageKey);
                navigate("/login");
              }}
            className="mt-6 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // CANDIDATE LOBBY
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

  // LIVE COLLABORATIVE WORKSPACE
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Workspace Bar */}
      <header className="h-14 px-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
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

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Live Participants Pill */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300"
            title={participants.map((p) => `${p.name} (${p.role})`).join(", ")}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>{participants.length} Live</span>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/60">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={isReadOnly}
              className="bg-transparent text-xs font-medium text-zinc-200 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option
                  key={lang.id}
                  value={lang.id}
                  className="bg-zinc-900 text-zinc-200"
                >
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

              {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition disabled:opacity-50"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Run
          </button>

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

      {/* Read-Only Banner (agar room ended ho) */}
      {isReadOnly && (
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-300 text-xs flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5" />
          This interview has ended. The editor is in read-only mode.
        </div>
      )}

     {/* Monaco Code Editor + Output Terminal */}
      {/* Main Split Workspace: Left (Editor + Terminal) | Right (Chat + Notes) */}
   <div className="flex-1 flex overflow-hidden">
     <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
       <div className="flex-1 overflow-hidden">
         <Editor
           height="100%"
           language={language}
           value={code}
           theme="vs-dark"
           onChange={handleCodeChange}
           options={{
             fontSize: 14,
             minimap: { enabled: false },
             scrollBeyondLastLine: false,
             automaticLayout: true,
             readOnly: isReadOnly,
             padding: { top: 16 },
             fontFamily: "JetBrains Mono, Menlo, Monaco, Consolas, monospace",
           }}
         />
       </div>

       <OutputTerminal
         output={output}
         isError={isError}
         isRunning={isRunning}
         onClear={() => {
           setOutput("");
           setIsError(false);
         }}
       />
     </main>

     <RoomSidebar
       roomId={roomId}
       isHost={isHost}
       messages={messages}
       onSendMessage={handleSendMessage}
       currentUserName={isHost ? currentUser?.name : candidateName.trim()}
     />
   </div>
    </div>
  );
}