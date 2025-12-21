const { Thread } = require("../models/thread.js");
const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");
const commonConstants = require("../constants/commonConstants");

exports.unreadCount = (socket, redisClient) => {
  socket.on(
    "getUnreadCount",
    catchAsyncSocket(socket, async (userId) => {
      try {
        // Get all threads where user is a participant
        const userThreads = await Thread.find({
          $or: [{ user: userId }, { serviceprovider: userId }],
          threadStatus: commonConstants.threadStatus.ACTIVE,
        }).lean();

        // Count threads with unread messages
        let unreadThreadCount = 0;
        let totalUnreadMessages = 0;

        userThreads.forEach((thread, index) => {
          const userLastRead = thread.lastRead.find(
            (entry) => entry.userId.toString() === userId.toString()
          );

          const unreadCount = userLastRead ? userLastRead.unreadCount || 0 : 0;
          const hasUnreadMessages = unreadCount > 0;

          if (hasUnreadMessages) {
            unreadThreadCount++;
            totalUnreadMessages += unreadCount;
            console.log(`COUNTED as unread thread`);
          } else {
            console.log(`NOT counted as unread thread`);
          }
        });

        socket.emit("unreadCountResponse", {
          userId,
          unreadThreadCount: unreadThreadCount,
          totalUnreadMessages: totalUnreadMessages,
        });
      } catch (error) {
        socket.emit("unreadCountResponse", {
          userId,
          unreadThreadCount: 0,
          totalUnreadMessages: 0,
        });
      }
    })
  );
};
