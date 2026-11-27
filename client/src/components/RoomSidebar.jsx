import { useState, useEffect, useRef } from "react";
import { MessageSquare, FileText, Send, Lock, Check, Loader2 } from "lucide-react";
import api from "../utils/api";

export default function RoomSidebar({
  roomId,
  isHost,
  messages,
  onSendMessage,
  currentUserName,
}) {
  const [activeTab, setActiveTab] = useState("chat");
  const [inputMsg, setInputMsg] = useState("");

  // Private Notes states (Interviewer only)
  const [notes, setNotes] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved
  const saveTimerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Naya message aate hi auto-scroll neeche
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // Host ke liye existing notes fetch karo
  useEffect(() => {
    if (!isHost) return;
    const fetchNotes = async () => {
      try {
        const { data } = await api.get(`/rooms/${roomId}/notes`);
        setNotes(data.notes || "");
      } catch (err) {
        console.error("Failed to load notes:", err.message);
      }
    };
    fetchNotes();
  }, [roomId, isHost]);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputMsg.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInputMsg("");
  };

  // Debounced auto-save for Private Notes
  const handleNotesChange = (e) => {
    const updatedNotes = e.target.value;
    setNotes(updatedNotes);
    setSaveStatus("saving");

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await api.patch(`/rooms/${roomId}/notes`, { notes: updatedNotes });
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to save notes:", err.message);
        setSaveStatus("idle");
      }
    }, 1000);
  };

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-900/50 flex flex-col shrink-0">
      {/* Sidebar Tabs */}
      <div className="h-10 px-2 border-b border-zinc-800 flex items-center gap-1 shrink-0">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
            activeTab === "chat"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Live Chat
        </button>

        {isHost && (
          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "notes"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Private Notes
          </button>
        )}
      </div>

      {/* TAB 1: LIVE CHAT */}
      {activeTab === "chat" && (
        <>
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center mt-8">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderName === currentUserName;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-medium text-zinc-400">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {msg.timestamp}
                      </span>
                    </div>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed break-words ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-sm"
                          : "bg-zinc-800 text-zinc-200 rounded-tl-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleChatSubmit}
            className="p-3 border-t border-zinc-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}

      {/* TAB 2: PRIVATE NOTES (Host Only) */}
      {activeTab === "notes" && isHost && (
        <div className="flex-1 flex flex-col p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90">
              <Lock className="w-3 h-3" />
              Only visible to you
            </span>
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              {saveStatus === "saving" && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  Saved
                </>
              )}
            </span>
          </div>

          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Write private candidate feedback, strengths, red flags, or DSA scores here..."
            className="flex-1 w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-indigo-500 transition leading-relaxed"
          />
        </div>
      )}
    </aside>
  );
}