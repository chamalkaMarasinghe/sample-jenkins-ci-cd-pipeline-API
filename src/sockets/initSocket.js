const { CloseThread } = require("./closeThread");
const { joinRoom } = require("./joinRoom");
const { message } = require("./message");
const { openThread } = require("./openThread");
const { stopTyping } = require("./stopTyping");
const { typing } = require("./typing");

exports.initSocket = (socketIO, redisClient) => {
  // Store user-socket mapping for cleanup
  const userSocketMap = new Map();
  // Track active app users (users with app in foreground)
  const activeAppUsers = new Set();

  socketIO.on("connection", (socket) => {
    socket.authToken = socket.handshake.auth?.token;

    // Handle user joining their personal room
    socket.on("join-room", ({ userId }) => {
      if (userId) {
        userSocketMap.set(socket.id, userId);
        activeAppUsers.add(userId.toString());

        // Join user's personal room for unread count updates
        socket.join(userId.toString());
        
        console.log(`User ${userId} joined personal room, app is now active`);
      }
    });

    // Handle user explicitly going to background
    socket.on("app-background", ({ userId }) => {
      if (userId) {
        activeAppUsers.delete(userId.toString());
        console.log(`User ${userId} went to background`);
      }
    });

    // Handle user explicitly coming to foreground
    socket.on("app-foreground", ({ userId }) => {
      if (userId) {
        activeAppUsers.add(userId.toString());
        console.log(`User ${userId} came to foreground`);
      }
    });

    // leave the room when user disconnects
    socket.on("leave-room", ({ userId }) => {
      if (userId) {
        userSocketMap.delete(socket.id);
        activeAppUsers.delete(userId.toString());
        socket.leave(userId.toString());
        console.log(`User ${userId} left personal room`);
      }
    });

    // NOTE: Store active viewers per thread in in-memory db: Redis
    openThread(socket, redisClient);
    // NOTE: Remove active viewers when they are leaving in in-memory db: Redis
    CloseThread(socket, redisClient);
    // NOTE: Join a socket to a room joinRoomResponse
    joinRoom(socket);
    // NOTE: Listen for typing event
    typing(socket);
    // NOTE: Listen for stopTyping event
    stopTyping(socket);
    // NOTE: Handle messages - pass activeAppUsers for checking
    message(socketIO, socket, redisClient, activeAppUsers);

    // Initialize notification and unread count handlers
    require("./unreadCount").unreadCount(socket, redisClient);
    require("./notification").notification(socketIO, socket, redisClient);
    require("./markThreadAsRead").markThreadAsRead(socketIO, socket, redisClient);

    // Handle disconnect cleanup
    socket.on("disconnect", () => {
      const userId = userSocketMap.get(socket.id);
      if (userId) {
        // Remove from active app users
        activeAppUsers.delete(userId.toString());

        // Clean up user from active notification users
        const { activeNotificationUsers } = require("./notification");
        if (activeNotificationUsers) {
          activeNotificationUsers.delete(userId.toString());
        }
        userSocketMap.delete(socket.id);
        console.log(`User ${userId} disconnected, removed from active users`);
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
};
