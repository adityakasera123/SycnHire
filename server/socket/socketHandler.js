import Room from "../models/Room.js";

// Har room ke live participants track karne ke liye: roomId -> Map(socketId -> { name, role })
const roomParticipants = new Map();
// Auto-save debounce timers track karne ke liye
const saveTimers = new Map();

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    // 1. JOIN ROOM
    socket.on("join-room", ({ roomId, name, role }) => {
      socket.join(roomId);
      socket.data = { roomId, name, role };

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      roomParticipants.get(roomId).set(socket.id, { name, role });

      // Room ke sabhi logon ko updated participants list bhejo
      const participants = Array.from(roomParticipants.get(roomId).values());
      io.to(roomId).emit("participants-update", participants);

      // Baaki logon ko notify karo ki naya banda aaya hai
      socket.to(roomId).emit("user-joined", { name, role });
    });

    // 2. LIVE CODE SYNC + AUTO-SAVE
    socket.on("code-change", ({ roomId, code }) => {
      // Doosre user ko turant updated code bhejo
      socket.to(roomId).emit("code-update", code);

      // Debounced Auto-Save (typing rukne ke 1.5s baad MongoDB mein save)
      if (saveTimers.has(roomId)) {
        clearTimeout(saveTimers.get(roomId));
      }

      const timer = setTimeout(async () => {
        try {
          await Room.findOneAndUpdate({ roomId }, { code });
        } catch (err) {
          console.error("Auto-save error:", err.message);
        }
      }, 1500);

      saveTimers.set(roomId, timer);
    });

    // 3. LIVE LANGUAGE SYNC
    socket.on("language-change", async ({ roomId, language }) => {
      socket.to(roomId).emit("language-update", language);
      try {
        await Room.findOneAndUpdate({ roomId }, { language });
      } catch (err) {
        console.error("Language save error:", err.message);
      }
    });

    // 4. DISCONNECT
    socket.on("disconnect", () => {
      const { roomId, name, role } = socket.data || {};
      if (!roomId || !roomParticipants.has(roomId)) return;

      const roomMap = roomParticipants.get(roomId);
      roomMap.delete(socket.id);

      if (roomMap.size === 0) {
        roomParticipants.delete(roomId);
      } else {
        const participants = Array.from(roomMap.values());
        io.to(roomId).emit("participants-update", participants);
        socket.to(roomId).emit("user-left", { name, role });
      }
    });
  });
};