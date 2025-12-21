const mongoose=  require("mongoose");
const { writerCommisionMultiplier } = require("../constants/commonConstants");
const commonConstants = require("../constants/commonConstants");

exports.getThreadsStages = (user, type = null, size = 0, skip = 0, userName = null) => {

    const filterStages = [];

    // getThreadsStages(req?.user?._id, null, size ? size : 0, skip);

    // NOTE: filter only the user related threads.
    if (user) {
        filterStages.push({
            $match: {
                $and: [
                    {
                        $or: [
                            { user: user },
                            { serviceprovider: user },
                        ]
                    },
                    { threadStatus: commonConstants.threadStatus.ACTIVE }
                ]
            }
        });
    }

    // NOTE: dropping th empty threads with zero messages
    filterStages.push({
        $addFields: {
            hasMessages: {
                $cond: {
                    if: {
                        $gt: [
                            {$size: "$messages"},
                            0
                        ]
                    },
                    then: 1,
                    else: 0
                }
            }
        }
    });
    // filterStages.push({
    //     $match: {
    //         hasMessages: { $gt: 0 }
    //     }
    // });

    

    // base aggregate stage without any skipping documents or limitting documents
    const baseStage = [

        ...filterStages,

        // NOTE: adding tempory field named 'hasUnread' and assign 0 or 1 to it based on lastRead array elements which are having 0 < unreadCounts and matching with given user id 
        {
            $addFields: {
                hasUnread: {
                    $cond: {
                        if: {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: "$lastRead",
                                            as: "item",
                                            cond: {
                                                $and: [
                                                    { $eq: ["$$item.userId", new mongoose.Types.ObjectId(`${user}`)] },
                                                    { $gt: ["$$item.unreadCount", 0] }
                                                ]
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        },
                        then: 1,
                        else: 0
                    }
                }
            }
        },

        // NOTE: sorting based on hasUnread field and updatedAt field
        { $sort: { hasUnread: -1, createdAt: -1 } },


        // NOTE: populating user1 field
        {
            $lookup: {
                from: 'users',         
                localField: 'user', 
                foreignField: '_id',   
                as: 'user'      
            }
        },
        {
            $unwind: {
                path: '$user',          
                preserveNullAndEmptyArrays: true // Optional: Keeps thread even if no user is found
            }
        },

        // NOTE: populating serviceprovider field 
        {
            $lookup: {
                from: 'serviceproviders',         
                localField: 'serviceprovider', 
                foreignField: '_id',   
                as: 'serviceprovider'      
            }
        },
        {
            $unwind: {
                path: '$serviceprovider',          
                preserveNullAndEmptyArrays: true // Optional: Keeps thread even if no user is found
            }
        },

        // NOTE: removing the temporary field and messages field from the output
        { $project: { hasUnread: 0, messages: 0, "user.password": 0, "serviceprovider.password": 0} }, 
    ];

    // if the requested user is awriter .. shows only the 80% portion of the price to the writer
    // if(type && type.toString().toLowerCase() === "writer"){
    //     baseStage.push(
    //         {
    //             $set: {
    //               price: { $multiply: ["$price", writerCommisionMultiplier] }, // Modify `price` field
    //             },
    //         },
    //     )
    // }
    
    if(userName){
        // NOTE: concating both user first name and last name -> then save within new temp field
        baseStage.push(
            {
                $addFields: {
                    fullNameUser2: { $concat: ["$serviceprovider.firstName", " ", "$serviceprovider.lastName"] },
                    fullNameUser1: { $concat: ["$user.firstName", " ", "$user.lastName"] },
                }
            }
        )

        // NOTE: conditionally decides the target user name of the thread
        baseStage.push({
            $addFields: {
                fullNameTarget: {
                $cond: [
                    { $eq: ["$user._id", user] },
                    "$fullNameUser2",
                    "$fullNameUser1"
                ]
                }
            }
        });

        // NOTE: Case-insensitive partial match
        baseStage.push(
            {
                $match: {
                    $or: [
                        {fullNameTarget: { $regex: userName, $options: "i" } },
                        // {fullNameUser2: { $regex: userName, $options: "i" } }
                    ]
                }
            }
        )
    }


    // NOTE: if the size was given and given size is greater than zer0.. it mens the pagination
    // NOTE: pagination need two stages; purestage and with limit/skip stage to find total number of records
    if(size && size !== 0){
        return{
            baseStage: [...baseStage, { $skip: skip }, { $limit: size}],
            withoutSkipAndLimitStage: baseStage,
        }
    }else{ // if no need a pagination just return the base satge
        return{
            baseStage: baseStage,
            withoutSkipAndLimitStage: baseStage,
        }
    }
}

exports.getChatsWithPaginationStages = (thread, size = 0, skip = 0) => {

    // this stages is usefull if only require chats in pagination modal
    // otherwise no need to split or no need to unwind, sort chats

    return [
        { $match: { _id: thread } }, //finding thread
        { $unwind: "$messages" }, // Unwind the messages array to handle sorting
        // {
        //     $match: {
        //         $or: [
        //         { "messages.isNotification": false },  // Matches if isNotification is false
        //         { "messages.isNotification": { $exists: false } } // Matches if isNotification is not defined
        //         ]
        //     }
        // },
        
        // NOTE: populating offer field
        // {
        //     $lookup: {
        //         from: "offers",
        //         localField: "messages.offer", 
        //         foreignField: "_id", 
        //         as: "offerData"
        //     }
        // },
        // {
        //     $addFields: {
        //         "messages.offer": { $arrayElemAt: ["$offerData", 0] } 
        //     }
        // },
        // { $unset: "offerData" },

        { $sort: { "messages.createdAt": -1 } }, // Sort by `updatedAt` in descending order
        { $skip: skip },
        { $limit: size },
        {// after sorting stage grouping messages together
            $group: {
                _id: "$_id",
                roomId: { $first: "$roomId" },
                user: { $first: "$user" },
                serviceprovider: { $first: "$serviceprovider" },
                threadStatus: { $first: "$threadStatus" },
                lastRead: { $first: "$lastRead" },
                lastMessage: { $first: "$lastMessage" },
                messages: { $push: "$messages" }
            }
        }
    ];
}

exports.getAllUnreadCountAtOnce = (user) => {
    const baseStage = [
        // Filter user's active threads
        {
            $match: {
                $and: [
                    {
                        $or: [
                            { user: new mongoose.Types.ObjectId(user) },
                            { serviceprovider: new mongoose.Types.ObjectId(user) }
                        ]
                    },
                    { threadStatus: commonConstants.threadStatus.ACTIVE }
                ]
            }
        },

        // Add fields for unread calculations
        {
            $addFields: {
                userUnreadData: {
                    $arrayElemAt: [
                        {
                            $filter: {
                                input: "$lastRead",
                                as: "item",
                                cond: {
                                    $eq: ["$$item.userId", new mongoose.Types.ObjectId(user)]
                                }
                            }
                        },
                        0
                    ]
                }
            }
        },

        // Add unread count and hasUnread flag
        {
            $addFields: {
                unreadCount: {
                    $ifNull: ["$userUnreadData.unreadCount", 0]
                },
                hasUnread: {
                    $gt: [{ $ifNull: ["$userUnreadData.unreadCount", 0] }, 0]
                }
            }
        },

        // Group to calculate totals
        {
            $group: {
                _id: null,
                totalUnreadThreads: {
                    $sum: {
                        $cond: ["$hasUnread", 1, 0]
                    }
                },
                totalUnreadMessages: {
                    $sum: "$unreadCount"
                },
                unreadThreads: {
                    $push: {
                        $cond: [
                            "$hasUnread",
                            {
                                threadId: "$_id",
                                unreadCount: "$unreadCount",
                                lastMessage: "$lastMessage",
                                participants: {
                                    user: "$user",
                                    serviceprovider: "$serviceprovider"
                                }
                            },
                            "$$REMOVE"
                        ]
                    }
                }
            }
        },

        // Format final output
        {
            $project: {
                _id: 0,
                userId: new mongoose.Types.ObjectId(user),
                totalUnreadThreads: 1,
                totalUnreadMessages: 1,
                unreadThreads: {
                    $filter: {
                        input: "$unreadThreads",
                        as: "thread",
                        cond: { $ne: ["$$thread", null] }
                    }
                }
            }
        }
    ];

    return baseStage;
};

// exports.getAllUnreadCountAtOnce = (user) => {
  
//     const filterStages = [];

//     // NOTE: filter only the user related threads.
//     if (user) {
//         filterStages.push({
//             $match: {
//                 $and: [
//                     {
//                         $or: [
//                             { user: user },
//                             { serviceprovider: user }
//                         ]
//                     },
//                     { threadStatus: commonConstants.threadStatus.ACTIVE }
//                 ]
//             }
//         });
//     }
        
//     const baseStage = [

//         ...filterStages,

//         // adding tempory field named 'hasUnread' and assign 0 or 1 to it based on lastRead array elements which are having 0 < unreadCounts and matching with given user id 
//         {
//             $addFields: {
//                 hasUnread: {
//                     $cond: {
//                         if: {
//                             $gt: [
//                                 {
//                                     $size: {
//                                         $filter: {
//                                             input: "$lastRead",
//                                             as: "item",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$item.userId", new mongoose.Types.ObjectId(`${user}`)] },
//                                                     { $gt: ["$$item.unreadCount", 0] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 0
//                             ]
//                         },
//                         then: 1,
//                         else: 0
//                     }
//                 }
//             }
//         },

//         // NOTE: filtering only the threads that consisting unread messages
//         { $match: {hasUnread: 1}},

//         // NOTE: counting the number of documents within the pipeline
//         { $count: 'count'}
//     ];

//     return baseStage;
// }

// exports.getSystemNotifications = (thread) => {
//     return [
//         { $match: { _id: thread } }, // Find the thread by ID
//         { $unwind: "$messages" }, // Unwind the messages array
//         { $match: { "messages.isNotification": true } }, // Filter only notifications
//         {
//             $addFields: {
//                 "messages.formattedDate": {
//                     $dateToString: { format: "%Y-%m-%d", date: "$messages.createdAt" } // Extract YYYY-MM-DD
//                 }
//             }
//         },
//         {
//             $group: {
//                 _id: "$messages.formattedDate", // Group by the formatted date (YYYY-MM-DD)
//                 messages: { $push: "$messages" } // Collect filtered messages for each date
//             }
//         },
//         {
//             $sort: { _id: 1 } // Sort by date (optional)
//         }
//     ];
// };

// exports.getAdminThreadsForJoinRooms = (user) => {
//     return [
//         // adding tempory field named 'hasEntry' and assign 0 or 1 to it based on lastRead array elements which are matching with given user id 
//         {
//             $addFields: {
//                 hasEntry: {
//                     $cond: {
//                         if: {
//                             $gt: [
//                                 {
//                                     $size: {
//                                         $filter: {
//                                             input: "$lastRead",
//                                             as: "item",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$item.userId", new mongoose.Types.ObjectId(`${user}`)] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 0
//                             ]
//                         },
//                         then: 1,
//                         else: 0
//                     }
//                 }
//             }
//         },
//         {
//             $match: {hasEntry: 1}
//         }
//     ]
// }
// exports.getAllUnreadCountAtOnce = (user, type = null) => {
  
//     const filterStages = [];

//     // initially filter user threads or else writer threads based on the given user id and this may differ according to type parameter 
//     if(type && type.toString().toLowerCase() === "user"){
//         filterStages.push(
//             { $match: {user: new mongoose.Types.ObjectId(user)}}
//         );
//     }else if(type && type.toString().toLowerCase() === "writer"){
//         filterStages.push(
//             { $match: {writer: new mongoose.Types.ObjectId(user)}}
//         );
//     }

//     const baseStage = [

//         ...filterStages,

//         // adding tempory field named 'hasUnread' and assign 0 or 1 to it based on lastRead array elements which are having 0 < unreadCounts and matching with given user id 
//         {
//             $addFields: {
//                 hasUnread: {
//                     $cond: {
//                         if: {
//                             $gt: [
//                                 {
//                                     $size: {
//                                         $filter: {
//                                             input: "$lastRead",
//                                             as: "item",
//                                             cond: {
//                                                 $and: [
//                                                     { $eq: ["$$item.userId", new mongoose.Types.ObjectId(`${user}`)] },
//                                                     { $gt: ["$$item.unreadCount", 0] }
//                                                 ]
//                                             }
//                                         }
//                                     }
//                                 },
//                                 0
//                             ]
//                         },
//                         then: 1,
//                         else: 0
//                     }
//                 }
//             }
//         },

//         // filtering only the threads that consisting unread messages
//         { $match: {hasUnread: 1}},

//         // counting the number of documents within the pipeline
//         { $count: 'count'}
//     ];

//     return baseStage;
// }