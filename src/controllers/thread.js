// const mongoose = require("mongoose");
// const { catchAsync } = require("../utils/errors/catchAsync");
// const { Thread } = require("../models/thread");
// const User = require("../models/user");
// const ServiceProvider = require("../models/serviceProvider");
// const handleResponse = require("../utils/response/response");
// const AppError = require("../utils/errors/AppError");
// const { roles, threadStatus, messageTypes, documentCounters } =require("../constants/commonConstants");
// const { getThreadsStages, getChatsWithPaginationStages, getAllUnreadCountAtOnce } = require("../queries/thread");
// const paginationResponse = require("../utils/response/paginationResponse");
// const { decryptAllMessages } = require("../utils/encryptions/decryptAllMessages");
// const { decryptMessage } = require("../utils/encryptions/encryptAndDecryptMessages");
// const { RecordNotFoundError, FailureOccurredError, ActionNotAllowedError, DuplicateRecordsError } = require("../utils/errors/CustomErrors");
// const { getNewID } = require("../utils/genCustomID/getNewID");

// exports.createThread = catchAsync(async(req, res, next) => {

//     const { serviceprovider } = req.params;
    
//     const { _id } = req.user;

//     const user = _id;

//     // NOTE: reject the request if the user 1 and user 2 is the same entity
//     if(user?.toString() === serviceprovider?.toString()){
//         return next(new ActionNotAllowedError());
//     }


//     // NOTE: drop the request if there is already existing thread between two specified users
//     const existingThread = await Thread.findOne({
//         $or: [
//             { user: user, serviceprovider: serviceprovider },
//         ]
//     });

//     if(existingThread){
//         return next(new DuplicateRecordsError(`Thread : ${existingThread?._id}`));
//     }

//     const dbUser1 = await User.findById(user);
//     const dbUser2 = await ServiceProvider.findById(serviceprovider);
    
//     if(!dbUser1 || dbUser1?.isDeleted || !dbUser2 || dbUser1?.isDeleted){        
//         return next(new RecordNotFoundError("User"));
//     }

//     if(dbUser2?.isSuspended){
//         return next(new ActionNotAllowedError());
//     }

//     const newId = await getNewID(documentCounters.THREAD);

//     if(!newId){
//         return next(new FailureOccurredError("ID Generation"));
//     }

//     const lastReadList = [];    
    
//     // NOTE: lastread entry for user 1
//     lastReadList.push(
//         {
//             userId: dbUser1?._id,
//             lastReadTimestamp: new Date()?.toISOString(),
//             unreadCount: 0 
//         }
//     );

//     // NOTE: lastread entry for user 1
//     lastReadList.push(
//         {
//             userId: dbUser2?._id,
//             lastReadTimestamp: new Date()?.toISOString(),
//             unreadCount: 0 
//         }
//     );

//     const thread = new Thread({
//         roomId: newId, 
//         user: dbUser1._id,
//         serviceprovider: dbUser2?._id,
//         lastRead: lastReadList,
//     });

//     await thread.save();

//     const createdThread = await Thread.findOne({roomId: newId});

//     if(!createdThread){
//         return next(new FailureOccurredError("Thread Creation"));
//     }

//     return handleResponse(res, 201, "Thread Created Successfully.", createdThread);
// });

// exports.getUserThreads = catchAsync(async(req, res, next) => {

//     let {offset, limit, userName} = req.query;

//     const user = req?.user?._id;
//     const userRoles = req?.user?.roles;

//     // NOTE: if only one parameter was given; then the other one is initialized with appropriate value
//     if (offset && !limit) {
//         limit = 10;
//     } if (!offset && limit) {
//         offset = 0;
//     }

//     offset = Number(offset);
//     limit = Number(limit);

//     let dbUser = null;

//     if(userRoles?.includes(roles.USER)){
//         dbUser = await User.findById(user);
//     }else if(userRoles?.includes(roles.SERVICE_PRO)){
//         dbUser = await ServiceProvider.findById(user);
//     }
    
//     if(!dbUser || dbUser?.isDeleted){        
//         return next(new RecordNotFoundError("User"));
//     }

//     const {baseStage, withoutSkipAndLimitStage} = getThreadsStages(dbUser._id, null, limit ? limit : 0, offset, userName);
//     const userThreads = await Thread.aggregate(baseStage);   
    
//     // NOTE: generating the general response - decryptingt the last message of each thread also
//     // let response = {threads: userThreads.map(thread => {return {...thread, lastMessage: {...thread?.lastMessage,  content: decryptMessage(thread?.lastMessage?.content, thread?.lastMessage?.iv)}}})}

//     // NOTE: generating the general response - decryptingt the last message of each thread also
//     let response = {data: userThreads.map(thread => {
//         // if(thread.lastMessage && thread.lastMessage?.messageTye === messageTypes.TEXT){
//             return {
//                 ...thread, 
//                 lastMessage: {...thread?.lastMessage,  content: decryptMessage(thread?.lastMessage?.content, thread?.lastMessage?.iv)}
//             }
//         // }
//         // return thread;
//     })}

//     // NOTE: generating the pagination modal response
//     if(limit && limit !== 0){
//         const threadsWithoutLimitting = await Thread.aggregate(withoutSkipAndLimitStage);
//         response = {
//             ...response,
//             pagination: paginationResponse({
//                 offset: offset, 
//                 limit: limit, 
//                 totalDocuments : threadsWithoutLimitting?.length,
//             }) 
//         }
//     }

//     return handleResponse(res, 200, "Threads For Given User Fetched Successfully.", response);
// });

// exports.getUserChats = catchAsync(async(req, res, next) => {

//     const { thread } = req.params;

//     const user = req.user?._id;

//     let {offset, limit} = req.query;

//     // NOTE: if only one parameter was given; then the other one is initialized with appropriate value
//     if (offset && !limit) {
//         limit = 10;
//     } if (!offset && limit) {
//         offset = 0;
//     }

//     offset = Number(offset);
//     limit = Number(limit);

//     const dbThread = await Thread.findById(thread);

//     if(!dbThread){
//         return next(new RecordNotFoundError("Thread"));
//     }

//     // NOTE: checks wheather if the provided user actually belongs to the given thread
//     if(!(dbThread.user.toString() === user?.toString()) && !(dbThread.serviceprovider.toString() === user?.toString())){
//         return next(new ActionNotAllowedError());
//     }

//     // NOTE: generating the general response
//     let response = {data: decryptAllMessages(dbThread.messages)};

//     // NOTE: invoking paginated aggragation stages; generating response only if the request to pagination modal
//     if(limit && limit !== 0){

//         const paginatedThreads = await Thread.aggregate(getChatsWithPaginationStages(dbThread._id, limit ? limit : 0, offset));
                
//         response = {
//             data: paginatedThreads[0]?.messages ? decryptAllMessages(paginatedThreads[0]?.messages) : [],
//             pagination: paginationResponse({
//                 offset: offset, 
//                 limit: limit, 
//                 totalDocuments : dbThread?.messages?.length,
//             }) 
//         }
//     }

//     //reseting the last seen time and unread message count
//     for(const entry of dbThread?.lastRead){
//         if(entry?.userId?.toString() === user?.toString()){
//             entry.lastReadTimestamp = new Date().toISOString();
//             // entry.selectedRoomId = dbThread._id;
//             entry.unreadCount = 0;
//         }
//     }

//     await dbThread.save();

//     return handleResponse(res, 200, "Messages For Given User Thread Fetched Successfully.", response);
// });

// exports.getThreadById = catchAsync(async(req, res, next) => {

//     const { thread } = req.params;

//     const user = req.user?._id;

//     let dbThread = await Thread.findById(thread).populate("user serviceprovider").select("-messages");

//     if(!dbThread){
//         return next(new RecordNotFoundError("Thread"));
//     }

//     // checks wheather if the provided user actually belongs to the given thread
//     if(!(dbThread?.user.toString() === user?.toString() || dbThread?.serviceprovider?.toString() === user?.toString())){
//         if(dbThread?.lastRead?.filter((item) => item?.userId?.toString() === user?.toString())?.length < 1){
//             return next(new ActionNotAllowedError());
//         }
//     }

//     if(dbThread.lastMessage && dbThread.lastMessage.content){
//         dbThread.lastMessage.content = decryptMessage(dbThread?.lastMessage?.content, dbThread?.lastMessage?.iv );
//     }

//     return handleResponse(res, 200, "Given Thread Fetched Successfully.", dbThread);
// })

// exports.getUnreadCountAtOnce = catchAsync(async(req, res, next) => {
//     const user = req.user?._id;
    
//     try {
//         const baseStage = getAllUnreadCountAtOnce(user);
//         const responseFromStages = await Thread.aggregate(baseStage);

//         let response;
//         if (responseFromStages.length === 0) {
//             response = {
//                 userId: user,
//                 totalUnreadThreads: 0,
//                 totalUnreadMessages: 0,
//                 unreadThreads: []
//             };
//         } else {
//             response = responseFromStages[0];
//         }
        
//         return handleResponse(res, 200, "Unread Messages Count Fetched Successfully.", response);
        
//     } catch (error) {
//         console.error("Error in getUnreadCountAtOnce:", error);
//         return next(new AppError("Failed to fetch unread counts", 500));
//     }
// });