import Room from "../models/Room.js";

const roomParticipants = new Map();
const saveTimers = new Map();
const disconnectTimers = new Map();

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    // 1. JOIN ROOM
    socket.on("join-room", ({ roomId, name, role }) => {
      socket.join(roomId);
      socket.data = { roomId, name, role };

      const userKey = `${roomId}:${name}:${role}`;
      const isReconnect = disconnectTimers.has(userKey);

      // Agar 3 sec ke andar reconnect hua (refresh), toh leave timer cancel kar do
      if (isReconnect) {
        clearTimeout(disconnectTimers.get(userKey));
        disconnectTimers.delete(userKey);
      }

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }
      roomParticipants.get(roomId).set(socket.id, { name, role });

      const participants = Array.from(roomParticipants.get(roomId).values());
      io.to(roomId).emit("participants-update", participants);

      // Sirf tab notify karo jab genuinely naya join ho (refresh par nahi)
      if (!isReconnect) {
        socket.to(roomId).emit("user-joined", { name, role });
      }
    });

    // 2. LIVE CODE SYNC + AUTO-SAVE
    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-update", code);

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

    // 4. LIVE CODE OUTPUT SYNC
    socket.on("code-output", ({ roomId, output, isError }) => {
      socket.to(roomId).emit("output-update", { output, isError });
    });

    // 5. LIVE CHAT MESSAGE
    socket.on("send-message", ({ roomId, message, senderName, senderRole }) => {
      io.to(roomId).emit("receive-message", {
        id: Date.now() + Math.random(),
        message,
        senderName,
        senderRole,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    });

    // 5. DISCONNECT (3-second grace period ke saath)
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
      }

      const userKey = `${roomId}:${name}:${role}`;
      const timer = setTimeout(() => {
        disconnectTimers.delete(userKey);
        socket.to(roomId).emit("user-left", { name, role });
      }, 3000);

      disconnectTimers.set(userKey, timer);
    });
  });
};