const mongoose = require("mongoose");
const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");
// const {
//   // encryptMessage,
//   // decryptMessage,
// } = require("../utils/encryptions/encryptAndDecryptMessages.js");
const User = require("../models/user.js");
// const Offer = require("../models/offer.js");
const { Thread } = require("../models/thread.js");
const { roles, threadStatus } = require("../constants/commonConstants.js");
const commonConstants = require("../constants/commonConstants.js");
const { verifyTokenUtility } = require("../utils/tokens/verifyTokenUtility.js");
const {
  ACTION_NOT_ALLOWED,
  VALIDATION_FAILURE,
  RECORD_NOT_FOUND,
  FAILURE_OCCURED,
  PERMISSION_DENIED,
  SUSPENDED,
} = require("../constants/errorCodes.js");
const { isOnlyDigits } = require("../utils/validations/validationChecks.js");
const { getNewID } = require("../utils/genCustomID/getNewID");
const ServiceProvider = require("../models/serviceProvider.js");
const PushNotificationService = require("./PushNotificationService.js");

exports.message = (
  socketIO,
  socket,
  redisClient,
  activeAppUsers = new Set()
) => {
  // NOTE: Handle messages
  socket.on(
    "message",
    catchAsyncSocket(
      socket,
      async ({
        roomId,
        userId,
        text,
        files = [],
        // isOffer = false,
        // offer = {}
      }) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
          await verifyTokenUtility({ token: socket.authToken });

          if (
            (!text || text?.trim()?.toString()?.length <= 0) &&
            (!files || files?.length < 1)
          ) {
            throw new Error(ACTION_NOT_ALLOWED.message, { cause: "logical" });
          }

          if (!mongoose.isValidObjectId(roomId)) {
            throw new Error(VALIDATION_FAILURE.message, { cause: "logical" });
          }

          if (!mongoose.isValidObjectId(userId)) {
            throw new Error(VALIDATION_FAILURE.message, { cause: "logical" });
          }

          const thread = await Thread.findById(roomId);

          let user = null;

          user = await User.findById(userId);

          if (!user) {
            user = await ServiceProvider.findById(userId);
          }

          if (!user || user?.isDeleted) {
            throw new Error(RECORD_NOT_FOUND.message, { cause: "logical" });
          }

          if (!thread) {
            throw new Error(RECORD_NOT_FOUND.message, { cause: "logical" });
          }

          if (thread.threadStatus === threadStatus.INACTIVE) {
            throw new Error(ACTION_NOT_ALLOWED.message, { cause: "logical" });
          }

          // NOTE: checks wheather if the provided user actually belongs to the given thread
          if (
            !(
              thread.user.toString() === userId?.toString() ||
              thread?.serviceprovider?.toString() === userId?.toString()
            )
          ) {
            if (
              thread?.lastRead?.filter(
                (item) => item?.userId?.toString() === userId?.toString()
              )?.length < 1
            ) {
              throw new Error(ACTION_NOT_ALLOWED.message, { cause: "logical" });
            }
          }

          // NOTE: encrypt the plain text message and generate random initial vector before save in the database : if only this is not an offer
          // const { iv, encryptedData } = encryptMessage(text || '');
          const { iv, encryptedData } = {iv: '', encryptedData: ''};

          // NOTE: create message object
          const newMessage = {
            sender: userId,
            // offer: isOffer ? offerObject?._id : undefined,
            content: encryptedData,
            attachments: files,
            iv: iv,
            // messageTye: isOffer ? commonConstants.messageTypes.OFFER : commonConstants.messageTypes.TEXT
          };

          // NOTE: persist recieved message inside relavant thread : senderModel: 'User',
          thread.messages.push(newMessage);
          thread.lastMessage = newMessage;

          // NOTE: active users for given thread: from redis db
          const activeUsers = await redisClient.lRange(
            `thread:${roomId.toString()}`,
            0,
            -1
          );

          for (const entry of thread?.lastRead) {
            const isNotSender =
              entry?.userId?.toString() !== userId?.toString();
            const isNotActivelyViewing = !activeUsers.includes(
              entry?.userId?.toString()
            );

            if (isNotSender && isNotActivelyViewing) {
              const oldCount = entry.unreadCount || 0;
              entry.unreadCount = oldCount + 1;
              console.log(
                `Updated unread count for user ${entry.userId}: ${oldCount} -> ${entry.unreadCount}`
              );
            } else {
              console.log(
                `Skipping unread count update for user ${
                  entry.userId
                } (sender: ${!isNotSender}, viewing: ${!isNotActivelyViewing})`
              );
            }
          }

          // SAVE the thread to database
          await thread.save({ session });

          // COMMIT the transaction
          await session.commitTransaction();
          session.endSession();

          // calculate counts AND send push notifications
          const participants = [thread.user, thread.serviceprovider];

          for (const participant of participants) {
            // Skip if this is the message sender
            if (participant.toString() === userId.toString()) {
              console.log(
                `Skipping sender ${participant.toString().slice(-8)}`
              );
              continue;
            }

            // Get FRESH data from database after save
            const userThreads = await Thread.find({
              $or: [{ user: participant }, { serviceprovider: participant }],
              threadStatus: commonConstants.threadStatus.ACTIVE,
            }).lean();

            let unreadThreadCount = 0;
            let totalUnreadMessages = 0;

            userThreads.forEach((t) => {
              const entry = t.lastRead.find(
                (e) => e.userId.toString() === participant.toString()
              );
              const unreadCount = entry ? entry.unreadCount || 0 : 0;

              if (unreadCount > 0) {
                unreadThreadCount++;
                totalUnreadMessages += unreadCount;
              }
            });

            // Emit socket update
            socketIO.to(participant.toString()).emit("unreadCountResponse", {
              userId: participant,
              unreadThreadCount: unreadThreadCount,
              totalUnreadMessages: totalUnreadMessages,
            });

            // Check if user has the app open (is in activeAppUsers set)
            const isAppOpen = activeAppUsers.has(participant.toString());

            // Send push notification ONLY if app is closed
            if (!isAppOpen) {

              // Get recipient's details
              const recipient = await User.findById(participant);
              const sender = user;

              if (recipient && recipient.pushToken && sender) {

                let textToSend = text?.trim()?.toString() || "";
                if (!textToSend && files && files.length > 0) {
                  textToSend = "You have received a new attachment";
                }

                await PushNotificationService.sendMessageNotification({
                  recipientPushToken: recipient.pushToken,
                  senderName: `${sender.firstName} ${sender.lastName}`,
                  messageText: textToSend,
                  threadId: roomId,
                  senderId: userId,
                  firstName: sender?.firstName,
                  lastName: sender?.lastName,
                  profilePicture: sender?.profilePicture || sender?.businessInformation?.logo?.[0],
                });
                console.log(`Push notification sent to ${recipient.firstName}`);
              } else {
                console.log(`Cannot send push notification - missing data:`, {
                  hasRecipient: !!recipient,
                  hasPushToken: !!recipient?.pushToken,
                  hasSender: !!sender,
                });
              }
            } else {
              console.log(
                `App is open for user ${participant
                  .toString()
                  .slice(-8)}, skipping push notification`
              );
            }
          }

          // NOTE: emit message for given room
          socketIO.to(thread._id.toString()).emit("messageResponse", {
            ...newMessage,
            roomId,
            userId,
            text,
            attachments: files,
            createdAt: new Date()?.toISOString(),
          });
        } catch (error) {
          session.abortTransaction();
          session.endSession();
          throw error;
        }
      }
    )
  );
};
