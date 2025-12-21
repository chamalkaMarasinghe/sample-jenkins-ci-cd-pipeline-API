const { Thread } = require("../models/thread.js");
const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");
const commonConstants = require("../constants/commonConstants");

exports.markThreadAsRead = (socketIO, socket, redisClient) => {
  socket.on("markAsRead", catchAsyncSocket(socket, async ({ threadId, userId }) => {
    
    try {
      // Update MongoDB
      const updateResult = await Thread.updateOne(
        { _id: threadId, "lastRead.userId": userId },
        { $set: { "lastRead.$.unreadCount": 0 } }
      );

      socketIO.to(userId).emit("threadMarkedAsRead", { threadId });

      // Recalculate unread threads count
      const userThreads = await Thread.find({
        $or: [{ user: userId }, { serviceprovider: userId }],
        threadStatus: commonConstants.threadStatus.ACTIVE,
      }).lean();

      let unreadThreadCount = 0;
      let totalUnreadMessages = 0;

      userThreads.forEach((t) => {
        const entry = t.lastRead.find(e => e.userId.toString() === userId);
        const unreadCount = entry ? (entry.unreadCount || 0) : 0;
        
        if (unreadCount > 0) {
          unreadThreadCount++;
          totalUnreadMessages += unreadCount;
        }
        
        console.log(`Thread ${t._id.toString().slice(-8)}: ${unreadCount} unread messages`);
      });

      socketIO.to(userId).emit("unreadCountResponse", {
        userId,
        unreadThreadCount: unreadThreadCount,
        totalUnreadMessages: totalUnreadMessages
      });

    } catch (error) {
      console.error("Error marking thread as read:", error);
    }
  }));
};